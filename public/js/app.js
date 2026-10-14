(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  async function api(url, method, body) {
    const res = await fetch(url, {
      method: method || 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin'
    });
    let json = {};
    try { json = await res.json(); } catch (e) {}
    if (!res.ok) throw new Error(json.error || 'Something went wrong. Please try again.');
    return json;
  }
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const msg = (el, text, ok) => { if (el) { el.textContent = text; el.className = 'form-msg ' + (ok ? 'ok' : 'err'); } };

  // ---- theme + menus ----
  $('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('pv-theme', next); } catch (e) {}
  });
  $('[data-menu]')?.addEventListener('click', (e) => {
    const bar = e.currentTarget.closest('.bar');
    const open = bar.classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', open);
  });
  $('[data-side]')?.addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $('[data-logout]')?.addEventListener('click', async () => { await api('/api/auth/logout', 'POST', {}); location.href = '/'; });

  // ---- generic JSON forms (login, signup, contact, newsletter) ----
  $$('form[data-api]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const out = $('.form-msg', form);
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const btn = $('button[type=submit]', form);
      btn.disabled = true;
      try {
        const payload = Object.fromEntries(new FormData(form).entries());
        const res = await api(form.dataset.api, 'POST', payload);
        if (form.dataset.redirect) { location.href = form.dataset.redirect; return; }
        msg(out, res.message || 'Done!', true);
        if (form.hasAttribute('data-reset')) form.reset();
      } catch (err) { msg(out, err.message, false); }
      btn.disabled = false;
    });
  });

  // ---- live search suggestions ----
  const q = $('#q'), box = $('#suggest');
  if (q) {
    let t;
    q.addEventListener('input', () => {
      clearTimeout(t);
      const v = q.value.trim();
      if (v.length < 2) { box.hidden = true; return; }
      t = setTimeout(async () => {
        try {
          const { results } = await api('/api/search?q=' + encodeURIComponent(v));
          box.innerHTML = results.slice(0, 6).map((r) => `<a href="${r.url}">${esc(r.title)}<small>${esc(r.courseTitle)}</small></a>`).join('') || '<a href="#" tabindex="-1">No results</a>';
          box.hidden = false;
        } catch (e) { box.hidden = true; }
      }, 180);
    });
    q.addEventListener('keydown', (e) => { if (e.key === 'Enter' && q.value.trim()) location.href = '/search?q=' + encodeURIComponent(q.value.trim()); if (e.key === 'Escape') box.hidden = true; });
    document.addEventListener('click', (e) => { if (!e.target.closest('.searchbox')) box.hidden = true; });
  }

  // ---- copy buttons ----
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    const code = b.closest('.example').querySelector('pre.code').textContent;
    try { await navigator.clipboard.writeText(code); b.textContent = 'Copied!'; } catch (e) { b.textContent = 'Press Ctrl+C'; }
    setTimeout(() => (b.textContent = 'Copy'), 1500);
  }));

  // ---- lesson completion ----
  const lessonEl = $('article[data-lesson]');
  if (lessonEl) {
    const btn = $('[data-complete]'), out = $('.complete .form-msg');
    const tick = $('.tick[data-lesson="' + lessonEl.dataset.lesson + '"]');
    const set = (on) => { btn.textContent = on ? 'Completed ✓ (click to undo)' : 'Mark as complete ✓'; btn.dataset.done = on ? '1' : ''; tick && tick.classList.toggle('on', on); };
    set(tick && tick.classList.contains('on'));
    btn.addEventListener('click', async () => {
      const done = !btn.dataset.done;
      try { await api('/api/progress', 'POST', { course: lessonEl.dataset.course, lesson: lessonEl.dataset.lesson, done }); set(done); msg(out, '', true); }
      catch (err) { msg(out, err.message.includes('log in') ? 'Log in to save your progress.' : err.message, false); }
    });
  }

  // ---- Try-it editors ----
  $$('[data-tryit]').forEach((root) => {
    const ta = $('textarea', root), frame = $('iframe', root);
    const page = root.closest('.tryit-page') || root;
    const run = () => { frame.srcdoc = ta.value; };
    $$('[data-run]', page).forEach((b) => b.addEventListener('click', run));
    ta.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
      if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText('  ', s, ta.selectionEnd, 'end'); }
    });
    $('[data-layout]', page)?.addEventListener('click', () => root.classList.toggle('stacked'));
    run();
  });

  // ---- quiz ----
  const quiz = $('#quiz');
  if (quiz) {
    const course = quiz.dataset.course, holder = $('#questions'), result = $('#result');
    api('/api/quiz/' + course).then(({ questions }) => {
      holder.innerHTML = questions.map((qq, i) => `<fieldset class="q"><legend>${i + 1}. ${esc(qq.q)}</legend>${qq.options.map((o, j) => `<label><input type="radio" name="q${i}" value="${j}" required> <span>${esc(o)}</span></label>`).join('')}</fieldset>`).join('');
    }).catch((err) => (holder.textContent = err.message));
    quiz.addEventListener('submit', async (e) => {
      e.preventDefault();
      const n = $$('.q', quiz).length;
      const answers = Array.from({ length: n }, (_, i) => { const c = $('input[name=q' + i + ']:checked', quiz); return c ? +c.value : -1; });
      try {
        const r = await api('/api/quiz/' + course + '/submit', 'POST', { answers });
        $$('.q', quiz).forEach((fs, i) => {
          fs.classList.add(r.review[i].correct ? 'good' : 'bad');
          const labels = $$('label', fs);
          labels[r.review[i].answer].classList.add('right');
          if (!r.review[i].correct && answers[i] >= 0) labels[answers[i]].classList.add('wrong');
          $$('input', fs).forEach((inp) => (inp.disabled = true));
        });
        const pct = r.score / r.total;
        result.innerHTML = `<div class="score">${r.score}/${r.total}</div><p>${pct === 1 ? 'Perfect score! 🎉' : pct >= 0.6 ? 'Nice work! Review the green answers above.' : 'Keep going - revisit the lessons and try again.'}</p><p>${r.saved ? 'Your score was saved to your <a href="/dashboard">dashboard</a>.' : '<a href="/signup">Create a free account</a> to save your scores.'}</p><a class="btn" href="/quiz/${course}">Try again</a>`;
        result.hidden = false;
        $('button[type=submit]', quiz).hidden = true;
        result.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (err) { alert(err.message); }
    });
  }
})();
