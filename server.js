const fs = require('fs');
const path = require('path');

// Minimal .env loader (no dependency)
try {
  for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const express = require('./src/mini');
const auth = require('./src/auth');

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', 1);

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-src 'self' about: blob:; connect-src 'self' https:; base-uri 'self'; form-action 'self'");
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: process.env.NODE_ENV === 'production' ? 7 * 864e5 : 0 }));
app.use(auth.attachUser);
app.use('/api', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); }, require('./src/api'));
app.use(require('./src/pages'));

app.use((err, _req, res, _next) => { console.error(err); res.status(500).send('Server error'); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PixelVista running on http://localhost:${PORT}`));
