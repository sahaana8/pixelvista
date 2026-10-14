const express = require('./mini');
const { data, save, id } = require('./db');
const auth = require('./auth');
const catalog = require('./catalog');

const router = express.Router();

// ---------- helpers ----------
const buckets = new Map();
function limit(name, max, windowMs) {
  return (req, res, next) => {
    const key = name + ':' + req.ip;
    const now = Date.now();
    const b = (buckets.get(key) || []).filter((t) => now - t < windowMs);
    if (b.length >= max) return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    b.push(now);
    buckets.set(key, b);
    next();
  };
}
setInterval(() => buckets.clear(), 60 * 60 * 1000).unref();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const fail = (res, msg, code = 400) => res.status(code).json({ error: msg });

router.use(express.json({ limit: 20 * 1024 }));

// Basic CSRF defence for cookie auth: JSON bodies only (cross-site forms can't send application/json without CORS preflight).
router.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !req.is('application/json')) {
    return fail(res, 'Content-Type must be application/json', 415);
  }
  next();
});

// ---------- catalog ----------
router.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

router.get('/courses', (_req, res) => {
  res.json(catalog.courses.map((c) => ({
    slug: c.slug, title: c.title, tagline: c.tagline, lessons: c.lessons.length,
    url: `/learn/${c.slug}`
  })));
});

router.get('/courses/:course', (req, res) => {
  const c = catalog.getCourse(req.params.course);
  if (!c) return fail(res, 'Course not found', 404);
  res.json({
    slug: c.slug, title: c.title, description: c.description,
    lessons: c.lessons.map((l) => ({ slug: l.slug, title: l.title, minutes: l.minutes, url: `/learn/${c.slug}/${l.slug}` }))
  });
});

router.get('/search', limit('search', 120, 60 * 1000), (req, res) => {
  res.json({ results: catalog.search(str(req.query.q, 80)) });
});

// ---------- auth ----------
router.post('/auth/signup', limit('signup', 10, 60 * 60 * 1000), (req, res) => {
  const name = str(req.body.name, 60), email = str(req.body.email, 120).toLowerCase(), password = String(req.body.password || '');
  if (name.length < 2) return fail(res, 'Please enter your name.');
  if (!EMAIL_RE.test(email)) return fail(res, 'Please enter a valid email address.');
  if (password.length < 8 || password.length > 100) return fail(res, 'Password must be 8-100 characters.');
  if (data.users.some((u) => u.email === email)) return fail(res, 'An account with this email already exists.', 409);
  const user = { id: id(), name, email, password: auth.hashPassword(password), createdAt: new Date().toISOString() };
  data.users.push(user);
  save();
  auth.setSession(res, user);
  res.status(201).json({ user: auth.publicUser(user) });
});

router.post('/auth/login', limit('login', 20, 15 * 60 * 1000), (req, res) => {
  const email = str(req.body.email, 120).toLowerCase(), password = String(req.body.password || '');
  const user = data.users.find((u) => u.email === email);
  // Always run a hash comparison to keep timing similar whether or not the user exists.
  const ok = auth.verifyPassword(password, user ? user.password : 'aa:bb') && user;
  if (!ok) return fail(res, 'Incorrect email or password.', 401);
  auth.setSession(res, user);
  res.json({ user: auth.publicUser(user) });
});

router.post('/auth/logout', (_req, res) => { auth.clearSession(res); res.json({ ok: true }); });
router.get('/auth/me', (req, res) => res.json({ user: auth.publicUser(req.user) }));

// ---------- progress ----------
router.get('/progress', auth.requireUser, (req, res) => {
  res.json({ completed: data.progress.filter((p) => p.userId === req.user.id).map((p) => `${p.course}/${p.lesson}`) });
});

router.post('/progress', auth.requireUser, (req, res) => {
  const course = catalog.getCourse(str(req.body.course, 40));
  const lesson = course && catalog.getLesson(course, str(req.body.lesson, 60));
  if (!lesson) return fail(res, 'Unknown lesson', 404);
  const done = req.body.done !== false;
  const idx = data.progress.findIndex((p) => p.userId === req.user.id && p.course === course.slug && p.lesson === lesson.slug);
  if (done && idx < 0) data.progress.push({ userId: req.user.id, course: course.slug, lesson: lesson.slug, at: new Date().toISOString() });
  if (!done && idx >= 0) data.progress.splice(idx, 1);
  save();
  res.json({ ok: true, done });
});

// ---------- quizzes ----------
router.get('/quiz/:course', (req, res) => {
  const c = catalog.getCourse(req.params.course);
  if (!c) return fail(res, 'Course not found', 404);
  res.json({ course: c.slug, title: c.title, questions: c.quiz.map((q) => ({ q: q.q, options: q.options })) });
});

router.post('/quiz/:course/submit', limit('quiz', 60, 60 * 60 * 1000), (req, res) => {
  const c = catalog.getCourse(req.params.course);
  if (!c) return fail(res, 'Course not found', 404);
  const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
  let score = 0;
  const review = c.quiz.map((q, i) => {
    const correct = answers[i] === q.answer;
    if (correct) score++;
    return { correct, answer: q.answer };
  });
  if (req.user) {
    data.quizResults.push({ id: id(), userId: req.user.id, course: c.slug, score, total: c.quiz.length, at: new Date().toISOString() });
    save();
  }
  res.json({ score, total: c.quiz.length, review, saved: !!req.user });
});

router.get('/quiz-results', auth.requireUser, (req, res) => {
  res.json({ results: data.quizResults.filter((r) => r.userId === req.user.id).slice(-50).reverse() });
});

// ---------- contact + newsletter ----------
router.post('/contact', limit('contact', 5, 60 * 60 * 1000), (req, res) => {
  if (str(req.body.website, 100)) return res.json({ ok: true }); // honeypot field - bots fill it
  const name = str(req.body.name, 80), email = str(req.body.email, 120), subject = str(req.body.subject, 120), message = str(req.body.message, 4000);
  if (name.length < 2) return fail(res, 'Please enter your name.');
  if (!EMAIL_RE.test(email)) return fail(res, 'Please enter a valid email address.');
  if (message.length < 10) return fail(res, 'Your message is too short (min 10 characters).');
  data.messages.push({ id: id(), name, email, subject, message, userId: req.user ? req.user.id : null, createdAt: new Date().toISOString() });
  save();
  res.status(201).json({ ok: true, message: 'Thanks! Your message has been received. We will reply by email.' });
});

router.post('/newsletter', limit('news', 10, 60 * 60 * 1000), (req, res) => {
  const email = str(req.body.email, 120).toLowerCase();
  if (!EMAIL_RE.test(email)) return fail(res, 'Please enter a valid email address.');
  if (!data.subscribers.some((s) => s.email === email)) {
    data.subscribers.push({ email, createdAt: new Date().toISOString() });
    save();
  }
  res.status(201).json({ ok: true, message: 'You are subscribed. Welcome to PixelVista!' });
});

// ---------- admin (set ADMIN_TOKEN in .env; send header "Authorization: Bearer <token>") ----------
router.get('/admin/messages', (req, res) => {
  const token = process.env.ADMIN_TOKEN;
  if (!token || req.headers.authorization !== 'Bearer ' + token) return fail(res, 'Forbidden', 403);
  res.json({ messages: data.messages.slice().reverse(), subscribers: data.subscribers, users: data.users.length });
});

router.use((_req, res) => fail(res, 'Not found', 404));
router.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return fail(res, 'Invalid JSON');
  console.error(err);
  fail(res, 'Server error', 500);
});

module.exports = router;
