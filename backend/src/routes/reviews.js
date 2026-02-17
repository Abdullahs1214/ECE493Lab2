const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { sendError, sendSuccess } = require('../services/errors');
const reviewService = require('../services/review_service');
const decisionService = require('../services/decision_service');

const router = express.Router();

router.post('/reviews', requireAuth, async (req, res) => {
  const { reviewAssignmentId, reviewForm } = req.body || {};
  const result = await reviewService.submitReview({
    reviewAssignmentId: Number(reviewAssignmentId),
    reviewForm
  });

  if (!result.ok) {
    const statusMap = {
      review_incomplete: 400,
      review_period_closed: 400,
      invalid_review_submission: 400,
      db_error: 503,
      editor_access_failure: 503
    };
    return sendError(res, statusMap[result.code] || 400, result.code, result.message);
  }

  return sendSuccess(res, { success: true, reviewId: result.reviewId });
});

router.post('/decisions', requireAuth, async (req, res) => {
  const { submissionId, decisionOutcome } = req.body || {};
  const result = await decisionService.recordDecision({
    submissionId: Number(submissionId),
    decisionOutcome
  });

  if (!result.ok) {
    const statusMap = {
      invalid_decision: 400,
      reviews_incomplete: 400,
      validation_failure: 503,
      db_error: 503
    };
    return sendError(res, statusMap[result.code] || 400, result.code, result.message);
  }

  return sendSuccess(res, { success: true, decisionId: result.decisionId });
});

module.exports = router;
