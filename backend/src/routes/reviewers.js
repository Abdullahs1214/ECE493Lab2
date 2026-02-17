const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { sendError, sendSuccess } = require('../services/errors');
const reviewerAssignmentService = require('../services/reviewer_assignment_service');
const reviewerNotificationService = require('../services/reviewer_notification_service');
const invitationResponseService = require('../services/invitation_response_service');

const router = express.Router();

router.post('/reviewer-assignments', requireAuth, async (req, res) => {
  const { submissionId, reviewerIds } = req.body || {};
  const result = await reviewerAssignmentService.assignReviewers({
    submissionId: Number(submissionId),
    reviewerIds
  });

  if (!result.ok) {
    const statusMap = {
      no_eligible_reviewers: 400,
      invalid_selection: 400,
      workload_limit: 400,
      workload_data_failure: 503,
      db_error: 503
    };
    return sendError(res, statusMap[result.code] || 400, result.code, result.message);
  }

  if (result.warning) {
    return sendSuccess(res, { success: true, warning: result.warningCode, message: result.message });
  }

  return sendSuccess(res, { success: true });
});

router.post('/reviewers/notify', requireAuth, async (req, res) => {
  const { submissionId, reviewerIds } = req.body || {};

  const result = await reviewerNotificationService.notifyReviewers({
    submissionId: Number(submissionId),
    reviewerIds: Array.isArray(reviewerIds) ? reviewerIds : []
  });

  if (!result.ok) {
    const statusMap = {
      missing_email: 400,
      email_failure: 503,
      logging_failure: 503,
      db_error: 503
    };
    return sendError(res, statusMap[result.code] || 400, result.code, result.message);
  }

  return sendSuccess(res, { success: true, notified: result.notified });
});

router.post('/reviewer-invitations/:id/response', requireAuth, async (req, res) => {
  const { response } = req.body || {};
  const result = await invitationResponseService.respondToInvitation({
    reviewAssignmentId: Number(req.params.id),
    response
  });

  if (!result.ok) {
    const statusMap = {
      invalid_response: 400,
      invalid_invitation: 400,
      db_error: 503
    };
    return sendError(res, statusMap[result.code] || 400, result.code, result.message);
  }

  if (result.warning) {
    return sendSuccess(res, {
      success: true,
      warning: result.warningCode,
      message: result.message
    });
  }

  return sendSuccess(res, { success: true });
});

module.exports = router;
