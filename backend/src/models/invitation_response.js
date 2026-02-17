const db = require('./db');

function createInvitationResponse({ reviewAssignmentId, response }) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO invitation_responses (review_assignment_id, response) VALUES (?, ?)',
      [reviewAssignmentId, response],
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

function getResponseByAssignmentId(reviewAssignmentId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, review_assignment_id, response FROM invitation_responses WHERE review_assignment_id = ? ORDER BY id DESC LIMIT 1',
      [reviewAssignmentId],
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

module.exports = { createInvitationResponse, getResponseByAssignmentId };
