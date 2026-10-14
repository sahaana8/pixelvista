// Read-only helpers over data/content.js
const { courses } = require('../data/content');

const getCourse = (slug) => courses.find((c) => c.slug === slug);
const getLesson = (course, slug) => course.lessons.find((l) => l.slug === slug);
const stripTags = (h) => h.replace(/\{\{example:\d+\}\}/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();

const index = [];
for (const c of courses) {
  for (const l of c.lessons) {
    index.push({
      course: c.slug, courseTitle: c.title, lesson: l.slug, title: l.title,
      url: `/learn/${c.slug}/${l.slug}`, text: stripTags(l.body)
    });
  }
}

function search(q, limit = 12) {
  const terms = String(q).toLowerCase().split(/\s+/).filter(Boolean).slice(0, 6);
  if (!terms.length) return [];
  const out = [];
  for (const e of index) {
    const title = (e.title + ' ' + e.courseTitle).toLowerCase();
    const text = e.text.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (title.includes(t)) score += 10;
      if (text.includes(t)) score += 2;
      else if (!title.includes(t)) { score = 0; break; }
    }
    if (score > 0) {
      const i = text.indexOf(terms[0]);
      const snippet = i >= 0 ? e.text.slice(Math.max(0, i - 40), i + 120) : e.text.slice(0, 140);
      out.push({ course: e.course, courseTitle: e.courseTitle, title: e.title, url: e.url, snippet: snippet.trim(), score });
    }
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

module.exports = { courses, getCourse, getLesson, search };
