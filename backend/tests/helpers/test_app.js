process.env.DB_PATH = ':memory:';
process.env.SESSION_SECRET = 'test-secret';

const { app, migratePromise } = require('../../src/app');
const db = require('../../src/models/db');

function resetDatabase() {
  const sql = [
    'DELETE FROM reviewer_notifications;',
    'DELETE FROM review_assignments;',
    'DELETE FROM submissions;',
    'DELETE FROM users;'
  ].join('\n');
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

module.exports = { app, migratePromise, resetDatabase, closeDatabase, db };
