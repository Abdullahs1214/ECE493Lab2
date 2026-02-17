const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { sendError, sendSuccess } = require('../services/errors');
const authorNotificationService = require('../services/author_notification_service');

const router = express.Router();

router.post('/author-notifications', requireAuth, async (req, res) => {
  const { submissionId } = req.body || {};
  const result = await authorNotificationService.notifyAuthors({ submissionId: Number(submissionId) });

  if (!result.ok) {
    const statusMap = {
      decision_missing: 400,
      missing_contact: 400,
      email_failure: 503,
      logging_failure: 503,
      db_error: 503
    };
    return sendError(res, statusMap[result.code] || 400, result.code, result.message);
  }

  return sendSuccess(res, { success: true, notified: result.notified, outcome: result.outcome });
});

module.exports = router;
