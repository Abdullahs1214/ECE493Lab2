const db = require('./db');

function createReview({ reviewAssignmentId, reviewForm }) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO reviews (review_assignment_id, review_form) VALUES (?, ?)',
      [reviewAssignmentId, JSON.stringify(reviewForm)],
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

function countReviewsForSubmission(submissionId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT COUNT(*) AS count
      FROM reviews r
      JOIN review_assignments ra ON ra.id = r.review_assignment_id
      WHERE ra.submission_id = ?
    `;
    db.get(sql, [submissionId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row.count);
    });
  });
}

function getReviewsForSubmission(submissionId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT r.id, r.review_form, ra.submission_id, ra.reviewer_id
      FROM reviews r
      JOIN review_assignments ra ON ra.id = r.review_assignment_id
      WHERE ra.submission_id = ?
    `;
    db.all(sql, [submissionId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve((rows || []).map((row) => ({
        id: row.id,
        submissionId: row.submission_id,
        reviewerId: row.reviewer_id,
        reviewForm: JSON.parse(row.review_form)
      })));
    });
  });
}

module.exports = { createReview, countReviewsForSubmission, getReviewsForSubmission };
