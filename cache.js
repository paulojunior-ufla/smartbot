const Database = require('better-sqlite3');
const path = require('path');

// Cria/conecta ao banco de dados local
const db = new Database(path.join(__dirname, 'cache.db'));

// Cria tabela de cache se não existir
// key: string, value: string, timestamp: int (epoch ms), ttl: int (ms, opcional)
db.prepare(`CREATE TABLE IF NOT EXISTS cache (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  timestamp INTEGER NOT NULL
)`).run();

function setCache(key, value) {
  const now = Date.now();
  db.prepare(`INSERT OR REPLACE INTO cache (key, value, timestamp) VALUES (?, ?, ?)`)
    .run(key, JSON.stringify(value), now);
}

function getCache(key) {
  const row = db.prepare(`SELECT value FROM cache WHERE key = ?`).get(key);
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return row.value;
  }
}

function clearCache(key) {
  db.prepare(`DELETE FROM cache WHERE key = ?`).run(key);
}

function clearAllCache() {
  db.prepare(`DELETE FROM cache`).run();
}

module.exports = {
  setCache,
  getCache,
  clearCache,
  clearAllCache
};
