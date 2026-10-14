# PixelVista

A W3Schools-style learning website with a real Node.js backend.

**Features:** 5 courses (HTML, CSS, JavaScript, Python, SQL) · 29 lessons · live "Try it Yourself" editor ·
quizzes with server-side grading · user accounts (scrypt-hashed passwords, signed HttpOnly cookie sessions) ·
lesson progress + quiz history dashboard · full-text search with live suggestions · contact form · newsletter signup ·
dark mode · SEO (meta tags, sitemap.xml, robots.txt) · rate limiting, CSP and security headers.

## Run it
```bash
# no dependencies - nothing to install!
npm start          # http://localhost:3000
```
Copy `.env.example` to `.env` to configure it (SITE_URL, SESSION_SECRET, ADMIN_TOKEN, PORT).

## Structure
```
server.js          app entry, security headers, static files
src/api.js         REST API (/api/...)
src/pages.js       server-rendered pages + sitemap/robots
src/auth.js        password hashing + signed session cookies
src/db.js          file-backed JSON store (storage/db.json)
src/catalog.js     course lookup + search
data/content.js    ALL tutorial content - add lessons/courses here
public/            CSS, JS, favicon
```

## API
| Method | Path | Description |
|---|---|---|
| GET | /api/courses, /api/courses/:slug | course catalog |
| GET | /api/search?q= | search lessons |
| POST | /api/auth/signup, /login, /logout; GET /api/auth/me | accounts |
| GET/POST | /api/progress | lesson completion (login required) |
| GET | /api/quiz/:course | questions (no answers) |
| POST | /api/quiz/:course/submit | `{answers:[0,2,...]}` → score |
| POST | /api/contact, /api/newsletter | forms |
| GET | /api/admin/messages | needs `Authorization: Bearer $ADMIN_TOKEN` |

## Add a lesson
Edit `data/content.js`, add an object to a course's `lessons` array. It appears in the sidebar, search and sitemap automatically.

## Deploy
* **Any VPS / Render / Railway / Fly.io:** `npm install && npm start`, set `NODE_ENV=production`, `TRUST_PROXY=1`, `SITE_URL`. Put HTTPS in front (nginx, Caddy or the platform).
* **Docker:** `docker build -t pixelvista . && docker run -p 3000:3000 -v pv-data:/app/storage pixelvista`
* Data is stored in `storage/` - keep it on a persistent disk and back it up.
* Scaling up: replace `src/db.js` with PostgreSQL/MySQL/MongoDB; the rest of the code only touches `data.users`, `data.progress`, etc.
