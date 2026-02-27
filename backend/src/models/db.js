const path = require('path');
const sqlite3 = require('sqlite3').verbose();

function resolveDbPath() {
  return process.env.DB_PATH || path.join(__dirname, '..', '..', 'cms.db');
}

const dbPath = resolveDbPath();
const db = new sqlite3.Database(dbPath);

db.resolveDbPath = resolveDbPath;

module.exports = db;
