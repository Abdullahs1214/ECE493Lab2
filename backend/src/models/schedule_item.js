const db = require('./db');

function createScheduleItem({ submissionId, timeAssignment, roomAssignment }) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO schedule_items (submission_id, time_assignment, room_assignment) VALUES (?, ?, ?)',
      [submissionId, timeAssignment, roomAssignment],
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

function updateScheduleItemBySubmissionId({ submissionId, timeAssignment, roomAssignment }) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE schedule_items SET time_assignment = ?, room_assignment = ? WHERE submission_id = ?',
      [timeAssignment, roomAssignment, submissionId],
      function onUpdate(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ updated: this.changes > 0 });
      }
    );
  });
}

function clearScheduleItems() {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM schedule_items', (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function getAllScheduleItems() {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT id, submission_id, time_assignment, room_assignment FROM schedule_items ORDER BY id',
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

module.exports = {
  createScheduleItem,
  updateScheduleItemBySubmissionId,
  clearScheduleItems,
  getAllScheduleItems
};
