const db = require('../models/db');
const reviewAssignmentModel = require('../models/review_assignment');
const reviewModel = require('../models/review');

function createDecision({ submissionId, decisionOutcome }) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO decisions (submission_id, decision_outcome) VALUES (?, ?)',
      [submissionId, decisionOutcome],
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

function getDecisionBySubmissionId(submissionId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, submission_id, decision_outcome FROM decisions WHERE submission_id = ? ORDER BY id DESC LIMIT 1',
      [submissionId],
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

async function recordDecision({ submissionId, decisionOutcome }) {
  if (!['accept', 'reject'].includes(decisionOutcome)) {
    return { ok: false, code: 'invalid_decision', message: 'Decision must be accept or reject.' };
  }

  if (process.env.SIMULATE_REVIEW_VALIDATION_FAILURE === 'true') {
    return { ok: false, code: 'validation_failure', message: 'Review validation failure.' };
  }

  if (process.env.SIMULATE_DB_FAILURE === 'true') {
    return { ok: false, code: 'db_error', message: 'Decision recording failed.' };
  }

  let requiredReviewCount;
  let submittedReviewCount;

  try {
    requiredReviewCount = await reviewAssignmentModel.countAssignmentsForSubmission(submissionId);
    submittedReviewCount = await reviewModel.countReviewsForSubmission(submissionId);
  } catch (err) {
    return { ok: false, code: 'validation_failure', message: 'Review validation failure.' };
  }

  if (requiredReviewCount === 0 || submittedReviewCount < requiredReviewCount) {
    return { ok: false, code: 'reviews_incomplete', message: 'All required reviews are not submitted.' };
  }

  try {
    const created = await createDecision({ submissionId, decisionOutcome });
    return { ok: true, decisionId: created.id };
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Decision recording failed.' };
  }
}

module.exports = { recordDecision, getDecisionBySubmissionId };
