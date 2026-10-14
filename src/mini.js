// Minimal Express-style web framework built on Node's http module, so PixelVista has ZERO npm dependencies.
// Supports: app.use / get / post, Router, :params, req.query/path/ip/body, res.status/json/send/type/redirect,
// express.json() and express.static() equivalents, and error middleware (4 args).
const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2', '.xml': 'application/xml'
};
const TYPES = { html: 'text/html; charset=utf-8', text: 'text/plain; charset=utf-8', json: 'application/json; charset=utf-8', xml: 'application/xml; charset=utf-8' };

function compile(p) {
  const keys = [];
  const body = p.replace(/\/$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\/:(\w+)/g, (_m, k) => { keys.push(k); return '/([^/]+)'; });
  return { re: new RegExp('^' + body + '/?$'), keys };
}

class Router {
  constructor() { this.stack = []; }
  use(a, ...rest) {
    let prefix = '/', fns = [a, ...rest];
    if (typeof a === 'string') { prefix = a; fns = rest; }
    for (const f of fns) this.stack.push({ prefix, fn: f instanceof Router ? (req, res, next) => f.handle(req, res, next) : f });
    return this;
  }
  _route(method, p, fns) { const c = compile(p); for (const fn of fns) this.stack.push({ method, re: c.re, keys: c.keys, fn }); return this; }
  get(p, ...f) { return this._route('GET', p, f); }
  post(p, ...f) { return this._route('POST', p, f); }

  handle(req, res, done) {
    let i = 0;
    const origPath = req.path;
    const next = (err) => {
      if (i >= this.stack.length) { req.path = origPath; return done(err); }
      const l = this.stack[i++];
      try {
        if (l.re) { // route
          if (err) return next(err);
          if (l.method !== req.method && !(l.method === 'GET' && req.method === 'HEAD')) return next();
          const m = l.re.exec(req.path);
          if (!m) return next();
          req.params = {};
          l.keys.forEach((k, j) => { req.params[k] = decodeURIComponent(m[j + 1]); });
          return l.fn(req, res, next);
        }
        const isErrHandler = l.fn.length === 4;
        if (err && !isErrHandler) return next(err);
        if (!err && isErrHandler) return next();
        const saved = req.path;
        if (l.prefix !== '/') {
          if (!(saved === l.prefix || saved.startsWith(l.prefix + '/'))) return next(err);
          req.path = saved.slice(l.prefix.length) || '/';
        }
        const nx = (e) => { req.path = saved; next(e); };
        return err ? l.fn(err, req, res, nx) : l.fn(req, res, nx);
      } catch (e) { return next(e); }
    };
    next();
  }
}

function app() {
  const a = new Router();
  const settings = {};
  a.disable = () => a;
  a.set = (k, v) => { settings[k] = v; return a; };
  a.listen = (port, cb) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://x');
      req.path = decodeURIComponentSafe(url.pathname);
      req.query = Object.fromEntries(url.searchParams);
      req.body = {};
      req.params = {};
      const fwd = settings['trust proxy'] && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
      req.ip = fwd || req.socket.remoteAddress || '';
      req.protocol = settings['trust proxy'] && req.headers['x-forwarded-proto'] ? req.headers['x-forwarded-proto'] : 'http';
      req.get = (h) => req.headers[h.toLowerCase()];
      req.is = (t) => String(req.headers['content-type'] || '').toLowerCase().includes(t.replace('application/', ''));
      res.status = (c) => { res.statusCode = c; return res; };
      res.type = (t) => { res.setHeader('Content-Type', TYPES[t] || t); return res; };
      res.send = (body) => { if (!res.getHeader('Content-Type')) res.type('html'); res.end(body); };
      res.json = (o) => { res.type('json'); res.end(JSON.stringify(o)); };
      res.redirect = (to) => { res.statusCode = 302; res.setHeader('Location', to); res.end(); };
      a.handle(req, res, (err) => {
        if (err) { console.error(err); res.status(500).send('Server error'); }
        else res.status(404).type('text').send('Not found');
      });
    });
    return server.listen(port, cb);
  };
  return a;
}
function decodeURIComponentSafe(s) { try { return decodeURIComponent(s); } catch { return s; } }

app.Router = () => new Router();

app.json = ({ limit = 20 * 1024 } = {}) => (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) || !req.is('application/json')) return next();
  let size = 0; const chunks = [];
  let dead = false;
  req.on('data', (c) => {
    if (dead) return;
    size += c.length;
    if (size > limit) { dead = true; res.status(413).json({ error: 'Request too large' }); req.destroy(); return; }
    chunks.push(c);
  });
  req.on('end', () => {
    if (dead) return;
    try { req.body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}; if (typeof req.body !== 'object' || !req.body) req.body = {}; next(); }
    catch { const e = new Error('Invalid JSON'); e.type = 'entity.parse.failed'; next(e); }
  });
};

app.static = (dir, { maxAge = 0 } = {}) => {
  const root = path.resolve(dir);
  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const file = path.join(root, path.normalize(req.path));
    if (!file.startsWith(root + path.sep)) return next();
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) return next();
      res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream');
      res.setHeader('Content-Length', st.size);
      res.setHeader('Cache-Control', maxAge ? `public, max-age=${Math.round(maxAge / 1000)}` : 'no-cache');
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(file).on('error', () => res.end()).pipe(res);
    });
  };
};

module.exports = app;
