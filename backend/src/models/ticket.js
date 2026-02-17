const db = require('./db');

function createTicket({ userId, ticketDetails }) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO tickets (user_id, ticket_details) VALUES (?, ?)', [userId, ticketDetails], function onInsert(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID });
    });
  });
}

function getLatestTicketByUserId(userId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, user_id, ticket_details FROM tickets WHERE user_id = ? ORDER BY id DESC LIMIT 1',
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

module.exports = { createTicket, getLatestTicketByUserId };
