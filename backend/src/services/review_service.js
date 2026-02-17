const reviewModel = require('../models/review');
const reviewAssignmentModel = require('../models/review_assignment');

function isCompleteReviewForm(reviewForm) {
  if (!reviewForm || typeof reviewForm !== 'object') {
    return false;
  }
  return Object.values(reviewForm).some((value) => {
    return value !== null && value !== undefined && String(value).trim().length > 0;
  });
}

async function submitReview({ reviewAssignmentId, reviewForm }) {
  if (process.env.SIMULATE_REVIEW_PERIOD_CLOSED === 'true') {
    return { ok: false, code: 'review_period_closed', message: 'Review submission period has closed.' };
  }

  if (!isCompleteReviewForm(reviewForm)) {
    return { ok: false, code: 'review_incomplete', message: 'Review form is incomplete.' };
  }

  if (process.env.SIMULATE_REVIEW_VALIDATION_FAILURE === 'true') {
    return { ok: false, code: 'invalid_review_submission', message: 'Invalid review submission.' };
  }

  if (process.env.SIMULATE_DB_FAILURE === 'true') {
    return { ok: false, code: 'db_error', message: 'Review submission failed.' };
  }

  let assignment;
  try {
    assignment = await reviewAssignmentModel.findAssignmentById(reviewAssignmentId);
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Review submission failed.' };
  }

  if (!assignment) {
    return { ok: false, code: 'invalid_review_submission', message: 'Invalid review submission.' };
  }

  try {
    const created = await reviewModel.createReview({ reviewAssignmentId, reviewForm });

    if (process.env.SIMULATE_EDITOR_ACCESS_FAILURE === 'true') {
      return { ok: false, code: 'editor_access_failure', message: 'Editor access failure.' };
    }

    return { ok: true, reviewId: created.id, submissionId: assignment.submission_id };
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Review submission failed.' };
  }
}

module.exports = { submitReview };
