const db = require('./db');

function countAssignmentsForReviewer(reviewerId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT COUNT(*) AS count FROM review_assignments WHERE reviewer_id = ?',
      [reviewerId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row.count);
      }
    );
  });
}

function createAssignments({ submissionId, reviewerIds }) {
  return new Promise((resolve, reject) => {
    const insertSql = 'INSERT INTO review_assignments (submission_id, reviewer_id) VALUES (?, ?)';
    db.serialize(() => {
      db.run('BEGIN');
      for (const reviewerId of reviewerIds) {
        db.run(insertSql, [submissionId, reviewerId]);
      }
      db.run('COMMIT', (err) => {
        if (err) {
          db.run('ROLLBACK');
          reject(err);
          return;
        }
        resolve({ created: reviewerIds.length });
      });
    });
  });
}

function getAssignmentsBySubmission(submissionId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT id, submission_id, reviewer_id FROM review_assignments WHERE submission_id = ?',
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

function findAssignmentById(assignmentId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, submission_id, reviewer_id FROM review_assignments WHERE id = ?',
      [assignmentId],
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

function countAssignmentsForSubmission(submissionId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT COUNT(*) AS count FROM review_assignments WHERE submission_id = ?',
      [submissionId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row.count);
      }
    );
  });
}

module.exports = {
  countAssignmentsForReviewer,
  createAssignments,
  getAssignmentsBySubmission,
  findAssignmentById,
  countAssignmentsForSubmission
};
