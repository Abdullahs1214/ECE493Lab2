const db = require('./db');

function createNotification({ submissionId, reviewerId }) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO reviewer_notifications (submission_id, reviewer_id) VALUES (?, ?)',
      [submissionId, reviewerId],
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

function getNotificationsBySubmission(submissionId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT id, submission_id, reviewer_id FROM reviewer_notifications WHERE submission_id = ?',
      [submissionId],
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      }
    );
  });
}

module.exports = { createNotification, getNotificationsBySubmission };
