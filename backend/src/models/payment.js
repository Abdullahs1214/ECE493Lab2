const db = require('./db');

function createPayment({ userId, paymentInformation, paymentConfirmation }) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO payments (user_id, payment_information, payment_confirmation) VALUES (?, ?, ?)',
      [userId, paymentInformation, paymentConfirmation],
      function onInsert(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: this.lastID });
      }
    );
  });
}

function getLatestPaymentByUserId(userId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, user_id, payment_information, payment_confirmation FROM payments WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [userId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      }
    );
  });
}

module.exports = { createPayment, getLatestPaymentByUserId };
