const db = require('./db');

function createUser(email, password) {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.run(sql, [email, password], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID, email });
    });
  });
}

function findByEmail(email) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, email, password FROM users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

function updatePassword(userId, newPassword) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    db.run(sql, [newPassword, userId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes > 0);
    });
  });
}

module.exports = { createUser, findByEmail, updatePassword };
