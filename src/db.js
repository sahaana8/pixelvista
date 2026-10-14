// Tiny file-backed JSON database. No native modules, so it installs anywhere.
// For heavy traffic swap this module for PostgreSQL/MySQL/MongoDB - the rest of the app only uses data.* arrays.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FILE = process.env.DB_FILE || path.join(__dirname, '..', 'storage', 'db.json');
fs.mkdirSync(path.dirname(FILE), { recursive: true });

const empty = () => ({ users: [], progress: [], quizResults: [], messages: [], subscribers: [] });
let data = empty();
try {
  data = Object.assign(empty(), JSON.parse(fs.readFileSync(FILE, 'utf8')));
} catch (e) {
  if (e.code !== 'ENOENT') console.error('Could not read database, starting empty:', e.message);
}

let timer = null;
function flush() {
  clearTimeout(timer);
  timer = null;
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, FILE);
}
function save() {
  if (!timer) timer = setTimeout(flush, 300);
}
const id = () => crypto.randomBytes(8).toString('hex');

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => { if (timer) flush(); process.exit(0); });
}

module.exports = { data, save, flush, id };
