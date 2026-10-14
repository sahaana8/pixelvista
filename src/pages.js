// Server-side rendered pages (fast, SEO-friendly). Interactivity is added by /js/app.js.
const express = require('./mini');
const { data } = require('./db');
const catalog = require('./catalog');

const router = express.Router();
const SITE = () => (process.env.SITE_URL || '').replace(/\/$/, '');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const WEB_LANGS = new Set(['html', 'css', 'js', 'javascript']);

// ---------- layout ----------
function layout(req, { title, desc, body, path, bodyClass = '', noindex = false }) {
  const user = req.user;
  const fullTitle = title === 'PixelVista' ? 'PixelVista - Learn to Code Free, Online' : `${title} | PixelVista`;
  const description = desc || 'PixelVista offers free, interactive tutorials in HTML, CSS, JavaScript, Python and SQL, with a live code editor and quizzes.';
  const canonical = SITE() + (path || req.path);
  const tabs = catalog.courses.map((c) => `<a href="/learn/${c.slug}" class="${req.path.startsWith('/learn/' + c.slug) || req.path === '/quiz/' + c.slug ? 'active' : ''}">${esc(c.title)}</a>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:title" content="${esc(fullTitle)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${esc(canonical)}">
<meta name="theme-color" content="#5b3df5">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/css/style.css">
<script>try{var t=localStorage.getItem('pv-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="topbar">
  <div class="wrap bar">
    <a class="logo" href="/" aria-label="PixelVista home"><svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#5b3df5"/><rect x="7" y="7" width="8" height="8" fill="#fff"/><rect x="17" y="7" width="8" height="8" fill="#ffb800"/><rect x="7" y="17" width="8" height="8" fill="#ff5e7e"/><rect x="17" y="17" width="8" height="8" fill="#2ee6a6"/></svg><span>Pixel<b>Vista</b></span></a>
    <button class="menu-btn" aria-label="Menu" aria-expanded="false" data-menu>☰</button>
    <div class="searchbox"><input type="search" id="q" placeholder="Search tutorials..." autocomplete="off" aria-label="Search tutorials"><div id="suggest" class="suggest" hidden></div></div>
    <nav class="actions" id="actions">
      <a href="/tryit">Try it</a>
      <button class="icon-btn" data-theme-toggle aria-label="Toggle dark mode">◐</button>
      ${user ? `<a class="btn-sm" href="/dashboard">${esc(user.name.split(' ')[0])}</a><button class="link-btn" data-logout>Log out</button>` : `<a href="/login">Log in</a><a class="btn-sm primary" href="/signup">Sign up free</a>`}
    </nav>
  </div>
  <nav class="tabs" aria-label="Courses"><div class="wrap">${tabs}<a href="/quiz/html" class="${req.path.startsWith('/quiz') ? 'active' : ''}">Quizzes</a></div></nav>
</header>
<main id="main">${body}</main>
<footer class="footer">
  <div class="wrap fgrid">
    <div><a class="logo" href="/"><span>Pixel<b>Vista</b></span></a><p>Free, interactive tutorials for the next generation of web developers.</p>
      <form class="inline-form" data-api="/api/newsletter" data-reset><label class="sr" for="nl">Email</label><input id="nl" type="email" name="email" placeholder="you@example.com" required><button class="btn primary" type="submit">Subscribe</button><p class="form-msg" role="status"></p></form></div>
    <div><h4>Tutorials</h4>${catalog.courses.map((c) => `<a href="/learn/${c.slug}">${esc(c.title)} Tutorial</a>`).join('')}</div>
    <div><h4>Practice</h4><a href="/tryit">Code Editor</a>${catalog.courses.map((c) => `<a href="/quiz/${c.slug}">${esc(c.title)} Quiz</a>`).join('')}</div>
    <div><h4>Company</h4><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/sitemap.xml">Sitemap</a></div>
  </div>
  <div class="wrap legal-line">© ${new Date().getFullYear()} PixelVista. All rights reserved.</div>
</footer>
<script src="/js/app.js" defer></script>
</body>
</html>`;
}

const send = (req, res, opts, status = 200) => res.status(status).type('html').send(layout(req, opts));

// ---------- components ----------
function renderExample(course, lesson, ex, i) {
  const isWeb = WEB_LANGS.has(ex.lang);
  const head = `<div class="ex-head"><span>Example</span><button class="copy" type="button" data-copy>Copy</button></div>`;
  const code = `<pre class="code"><code>${esc(ex.code)}</code></pre>`;
  const foot = isWeb
    ? `<a class="btn try" href="/tryit/${course.slug}/${lesson.slug}/${i}">Try it Yourself »</a>`
    : `<div class="out-head">Output</div><pre class="output">${esc(ex.output || '')}</pre>`;
  return `<div class="example">${head}${code}${foot}</div>`;
}

function lessonSidebar(req, course, current) {
  const done = new Set(req.user ? data.progress.filter((p) => p.userId === req.user.id && p.course === course.slug).map((p) => p.lesson) : []);
  return `<aside class="sidebar" id="sidebar"><h2>${esc(course.title)} Tutorial</h2><ul>
  ${course.lessons.map((l) => `<li><a href="/learn/${course.slug}/${l.slug}" class="${l.slug === current ? 'active' : ''}" ${l.slug === current ? 'aria-current="page"' : ''}><span class="tick ${done.has(l.slug) ? 'on' : ''}" data-lesson="${l.slug}"></span>${esc(l.title)}</a></li>`).join('')}
  </ul><h3>Test yourself</h3><a class="side-link" href="/quiz/${course.slug}">${esc(course.title)} Quiz</a><a class="side-link" href="/tryit">Code Editor</a></aside>`;
}

function crumbs(items) {
  return `<nav class="crumbs" aria-label="Breadcrumb">${items.map(([t, h]) => (h ? `<a href="${h}">${esc(t)}</a>` : `<span>${esc(t)}</span>`)).join(' › ')}</nav>`;
}

// ---------- pages ----------
router.get('/', (req, res) => {
  const cards = catalog.courses.map((c) => `<a class="course-card" href="/learn/${c.slug}" style="--c:${c.color}"><span class="badge">${esc(c.icon)}</span><h3>${esc(c.title)}</h3><p>${esc(c.tagline)}</p><span class="more">${c.lessons.length} lessons · Start learning →</span></a>`).join('');
  const starter = catalog.courses[0].lessons[0].examples[0].code;
  const body = `
<section class="hero"><div class="wrap hero-grid">
  <div><p class="eyebrow">Free · Interactive · No sign-up needed</p>
    <h1>Learn to build the web, one pixel at a time.</h1>
    <p class="lead">Bite-sized tutorials in HTML, CSS, JavaScript, Python and SQL - with a live code editor, quizzes and progress tracking.</p>
    <div class="hero-cta"><a class="btn primary big" href="/learn/html">Start with HTML</a><a class="btn big" href="/tryit">Open the editor</a></div>
    <ul class="stats"><li><b>${catalog.courses.length}</b> courses</li><li><b>${catalog.courses.reduce((n, c) => n + c.lessons.length, 0)}</b> lessons</li><li><b>${catalog.courses.reduce((n, c) => n + c.quiz.length, 0)}</b> quiz questions</li></ul></div>
  <div class="mini-editor" data-tryit data-compact><div class="ed-head"><span>Try it now</span><button class="btn primary sm" type="button" data-run>Run ▶</button></div>
    <textarea spellcheck="false" aria-label="Code editor">${esc(starter)}</textarea><iframe title="Result" sandbox="allow-scripts allow-modals"></iframe></div>
</div></section>
<section class="wrap section"><h2 class="center">Pick a tutorial</h2><div class="cards">${cards}</div></section>
<section class="band"><div class="wrap features">
  <div><span class="fi">⚡</span><h3>Learn by doing</h3><p>Every example opens in an editor. Change the code, press Run, see the result instantly.</p></div>
  <div><span class="fi">✅</span><h3>Track your progress</h3><p>Create a free account to mark lessons complete and save your quiz scores.</p></div>
  <div><span class="fi">🧠</span><h3>Test your skills</h3><p>Short quizzes after each course tell you what to review next.</p></div>
  <div><span class="fi">📱</span><h3>Works everywhere</h3><p>Fast, accessible and responsive - with light and dark mode.</p></div>
</div></section>`;
  send(req, res, { title: 'PixelVista', body, bodyClass: 'home' });
});

router.get('/learn/:course', (req, res, next) => {
  const course = catalog.getCourse(req.params.course);
  if (!course) return next();
  const total = course.lessons.reduce((n, l) => n + l.minutes, 0);
  const body = `<div class="wrap layout">${lessonSidebar(req, course, '')}<article class="content">
  ${crumbs([['Home', '/'], [course.title + ' Tutorial']])}
  <h1>${esc(course.title)} Tutorial</h1><p class="lead">${esc(course.description)}</p>
  <p class="meta">${course.lessons.length} lessons · about ${total} minutes</p>
  <a class="btn primary big" href="/learn/${course.slug}/${course.lessons[0].slug}">Start ${esc(course.title)} »</a>
  <h2>Lessons</h2><ol class="lesson-list">${course.lessons.map((l) => `<li><a href="/learn/${course.slug}/${l.slug}">${esc(l.title)}</a><span>${l.minutes} min</span></li>`).join('')}</ol>
  <div class="tip">Ready to test yourself? Take the <a href="/quiz/${course.slug}">${esc(course.title)} quiz</a>.</div></article></div>`;
  send(req, res, { title: `${course.title} Tutorial`, desc: course.description, body });
});

router.get('/learn/:course/:lesson', (req, res, next) => {
  const course = catalog.getCourse(req.params.course);
  const lesson = course && catalog.getLesson(course, req.params.lesson);
  if (!lesson) return next();
  const i = course.lessons.indexOf(lesson);
  const prev = course.lessons[i - 1], nextL = course.lessons[i + 1];
  const html = lesson.body.replace(/\{\{example:(\d+)\}\}/g, (_m, n) => renderExample(course, lesson, lesson.examples[+n], +n));
  const body = `<div class="wrap layout">${lessonSidebar(req, course, lesson.slug)}<article class="content" data-course="${course.slug}" data-lesson="${lesson.slug}">
  <button class="side-toggle" data-side>☰ ${esc(course.title)} menu</button>
  ${crumbs([['Home', '/'], [course.title, '/learn/' + course.slug], [lesson.title]])}
  <h1>${esc(lesson.title)}</h1><p class="meta">${lesson.minutes} min read</p>
  ${html}
  <div class="complete"><button class="btn" type="button" data-complete>Mark as complete ✓</button><span class="form-msg" role="status"></span></div>
  <div class="pager">${prev ? `<a class="btn" href="/learn/${course.slug}/${prev.slug}">« ${esc(prev.title)}</a>` : '<span></span>'}${nextL ? `<a class="btn primary" href="/learn/${course.slug}/${nextL.slug}">${esc(nextL.title)} »</a>` : `<a class="btn primary" href="/quiz/${course.slug}">Take the ${esc(course.title)} quiz »</a>`}</div>
  </article></div>`;
  send(req, res, { title: `${lesson.title} - ${course.title} Tutorial`, desc: catalogDesc(lesson), body });
});
const catalogDesc = (l) => l.body.replace(/\{\{[^}]+\}\}/g, '').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/\s+/g, ' ').trim().slice(0, 155);

router.get('/quiz/:course', (req, res, next) => {
  const course = catalog.getCourse(req.params.course);
  if (!course) return next();
  const body = `<div class="wrap narrow section">${crumbs([['Home', '/'], [course.title, '/learn/' + course.slug], ['Quiz']])}
  <h1>${esc(course.title)} Quiz</h1><p class="lead">${course.quiz.length} questions. Pick one answer for each, then submit.</p>
  <div class="quiz-tabs">${catalog.courses.map((c) => `<a href="/quiz/${c.slug}" class="${c.slug === course.slug ? 'active' : ''}">${esc(c.title)}</a>`).join('')}</div>
  <form id="quiz" data-course="${course.slug}"><div id="questions"><p>Loading questions…</p></div>
  <button class="btn primary big" type="submit">Submit answers</button></form><div id="result" class="result" hidden></div></div>`;
  send(req, res, { title: `${course.title} Quiz`, desc: `Test your ${course.title} knowledge with this free quiz.`, body });
});

function editorPage(req, res, { code, heading, back }) {
  const body = `<div class="tryit-page"><div class="tryit-bar wrap"><h1>${esc(heading)}</h1><div><button class="btn primary" type="button" data-run>Run ▶</button> <button class="btn" type="button" data-layout>Toggle layout</button> ${back ? `<a class="btn" href="${back}">« Back to lesson</a>` : ''}</div></div>
  <div class="tryit wrap" data-tryit><textarea spellcheck="false" aria-label="Code editor">${esc(code)}</textarea><iframe title="Result" sandbox="allow-scripts allow-modals allow-forms"></iframe></div>
  <p class="wrap hint">Tip: press <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> to run. Your code runs in a sandbox and is never uploaded.</p></div>`;
  send(req, res, { title: 'Try it Yourself - Code Editor', desc: 'Edit HTML, CSS and JavaScript and see the result instantly.', body, bodyClass: 'tryit-body' });
}
const BLANK = `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  body { font-family: sans-serif; padding: 24px; }\n  h1 { color: #5b3df5; }\n</style>\n</head>\n<body>\n  <h1>Hello, PixelVista!</h1>\n  <button onclick="this.textContent = 'Clicked!'">Click me</button>\n</body>\n</html>`;
router.get('/tryit', (req, res) => editorPage(req, res, { code: BLANK, heading: 'Code Editor' }));
router.get('/tryit/:course/:lesson/:n', (req, res, next) => {
  const course = catalog.getCourse(req.params.course);
  const lesson = course && catalog.getLesson(course, req.params.lesson);
  const ex = lesson && lesson.examples[+req.params.n];
  if (!ex || !WEB_LANGS.has(ex.lang)) return next();
  editorPage(req, res, { code: ex.code, heading: `${lesson.title} - Try it Yourself`, back: `/learn/${course.slug}/${lesson.slug}` });
});

router.get('/search', (req, res) => {
  const q = String(req.query.q || '').slice(0, 80);
  const results = catalog.search(q, 30);
  const body = `<div class="wrap narrow section"><h1>Search</h1><form action="/search" class="bigsearch"><input type="search" name="q" value="${esc(q)}" placeholder="Search tutorials..." aria-label="Search"><button class="btn primary">Search</button></form>
  ${q ? `<p class="meta">${results.length} result${results.length === 1 ? '' : 's'} for “${esc(q)}”</p>` : ''}
  <ul class="results">${results.map((r) => `<li><a href="${r.url}">${esc(r.title)}</a><small>${esc(r.courseTitle)}</small><p>${esc(r.snippet)}…</p></li>`).join('')}</ul></div>`;
  send(req, res, { title: q ? `Search: ${q}` : 'Search', body, noindex: true });
});

router.get('/about', (req, res) => send(req, res, {
  title: 'About', body: `<div class="wrap narrow section prose"><h1>About PixelVista</h1>
  <p>PixelVista exists to make learning to code simple, free and fun. Every tutorial is short, practical and comes with examples you can run immediately.</p>
  <h2>What you'll find here</h2><ul><li>Step-by-step lessons for ${catalog.courses.map((c) => esc(c.title)).join(', ')}</li><li>A live code editor that runs in your browser</li><li>Quizzes to check your understanding</li><li>Free accounts to track progress</li></ul>
  <p>Questions or ideas? <a href="/contact">Get in touch</a>.</p></div>` }));

router.get('/contact', (req, res) => send(req, res, {
  title: 'Contact', desc: 'Contact the PixelVista team.', body: `<div class="wrap narrow section"><h1>Contact us</h1><p class="lead">Found a mistake or have a suggestion? We read every message.</p>
  <form class="form" data-api="/api/contact" data-reset novalidate>
    <label>Name<input name="name" required maxlength="80" autocomplete="name" value="${esc(req.user ? req.user.name : '')}"></label>
    <label>Email<input type="email" name="email" required maxlength="120" autocomplete="email" value="${esc(req.user ? req.user.email : '')}"></label>
    <label>Subject<input name="subject" maxlength="120"></label>
    <label>Message<textarea name="message" rows="6" required minlength="10" maxlength="4000"></textarea></label>
    <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button class="btn primary big" type="submit">Send message</button><p class="form-msg" role="status"></p></form></div>` }));

const authForm = (kind) => (req, res) => {
  if (req.user) return res.redirect('/dashboard');
  const signup = kind === 'signup';
  send(req, res, {
    title: signup ? 'Sign up' : 'Log in', noindex: true, body: `<div class="wrap tiny section"><h1>${signup ? 'Create your free account' : 'Welcome back'}</h1>
    <form class="form" data-api="/api/auth/${kind}" data-redirect="/dashboard" novalidate>
      ${signup ? '<label>Name<input name="name" required autocomplete="name"></label>' : ''}
      <label>Email<input type="email" name="email" required autocomplete="email"></label>
      <label>Password<input type="password" name="password" required minlength="${signup ? 8 : 1}" autocomplete="${signup ? 'new-password' : 'current-password'}"></label>
      <button class="btn primary big" type="submit">${signup ? 'Sign up' : 'Log in'}</button><p class="form-msg" role="status"></p></form>
    <p class="center">${signup ? 'Already have an account? <a href="/login">Log in</a>' : 'New here? <a href="/signup">Create an account</a>'}</p></div>` });
};
router.get('/login', authForm('login'));
router.get('/signup', authForm('signup'));

router.get('/dashboard', (req, res) => {
  if (!req.user) return res.redirect('/login');
  const done = data.progress.filter((p) => p.userId === req.user.id);
  const results = data.quizResults.filter((r) => r.userId === req.user.id).slice(-8).reverse();
  const rows = catalog.courses.map((c) => {
    const n = done.filter((p) => p.course === c.slug).length, pct = Math.round((n / c.lessons.length) * 100);
    return `<div class="prog"><div class="prog-top"><a href="/learn/${c.slug}">${esc(c.title)}</a><span>${n}/${c.lessons.length} lessons</span></div><div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${c.color}"></div></div></div>`;
  }).join('');
  const body = `<div class="wrap narrow section"><h1>Hi, ${esc(req.user.name)} 👋</h1><p class="lead">Here is your learning progress.</p>
  <h2>Course progress</h2>${rows}
  <h2>Recent quiz scores</h2>${results.length ? `<table class="table"><thead><tr><th>Quiz</th><th>Score</th><th>Date</th></tr></thead><tbody>${results.map((r) => `<tr><td>${esc(r.course.toUpperCase())}</td><td>${r.score}/${r.total}</td><td>${new Date(r.at).toLocaleDateString('en-GB')}</td></tr>`).join('')}</tbody></table>` : '<p>No quizzes taken yet. <a href="/quiz/html">Try the HTML quiz</a>.</p>'}</div>`;
  send(req, res, { title: 'Dashboard', body, noindex: true });
});

const legal = (title, text) => (req, res) => send(req, res, { title, body: `<div class="wrap narrow section prose"><h1>${title}</h1>${text}</div>` });
router.get('/privacy', legal('Privacy Policy', `<p>PixelVista stores only what is needed to run the service: if you create an account we store your name, email and a securely hashed password, plus your lesson progress and quiz scores. Contact-form messages are stored so we can reply.</p><p>We use a single essential cookie to keep you logged in. Code you type in the editor runs in your browser and is never sent to our servers.</p><p>You can ask us to delete your data at any time via the <a href="/contact">contact page</a>.</p>`));
router.get('/terms', legal('Terms of Use', `<p>PixelVista tutorials are provided "as is" for educational purposes. Please don't abuse the service, attempt to disrupt it, or submit unlawful content through our forms. We may update these terms; continued use means you accept the changes.</p>`));

// ---------- SEO ----------
router.get('/robots.txt', (_req, res) => res.type('text').send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /dashboard\n${SITE() ? `Sitemap: ${SITE()}/sitemap.xml\n` : ''}`));
router.get('/sitemap.xml', (req, res) => {
  const base = SITE() || `${req.protocol}://${req.get('host')}`;
  const urls = ['/', '/tryit', '/about', '/contact', '/privacy', '/terms'];
  for (const c of catalog.courses) {
    urls.push(`/learn/${c.slug}`, `/quiz/${c.slug}`);
    c.lessons.forEach((l) => urls.push(`/learn/${c.slug}/${l.slug}`));
  }
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${base}${u}</loc></url>`).join('\n')}\n</urlset>`);
});

// ---------- 404 ----------
router.use((req, res) => send(req, res, {
  title: 'Page not found', noindex: true,
  body: `<div class="wrap tiny section center"><h1>404</h1><p class="lead">We couldn't find that page.</p><a class="btn primary" href="/">Back to home</a></div>`
}, 404));

module.exports = router;
