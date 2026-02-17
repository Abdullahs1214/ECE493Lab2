const db = require('./db');

function getCurrentPricing() {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, registration_fee FROM pricing ORDER BY id DESC LIMIT 1', (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

function createPricing(registrationFee) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO pricing (registration_fee) VALUES (?)', [registrationFee], function onInsert(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID, registrationFee });
    });
  });
}

module.exports = { getCurrentPricing, createPricing };
