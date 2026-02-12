const express = require('express');
const { sendError, sendSuccess } = require('../services/errors');
const { requireAuth } = require('../middleware/auth');
const submissionService = require('../services/submission_service');

const router = express.Router();

router.post('/submissions', requireAuth, async (req, res) => {
  const { metadata, manuscriptFile } = req.body || {};

  const result = await submissionService.submitSubmission({
    userId: req.session.userId,
    metadata,
    manuscriptFile
  });

  if (!result.ok) {
    const statusMap = {
      metadata_missing: 400,
      file_missing: 400,
      file_invalid: 400,
      file_format: 400,
      file_size: 400,
      db_error: 503,
      file_storage_error: 503
    };
    return sendError(res, statusMap[result.code] || 400, result.code, result.message, result.details);
  }

  return sendSuccess(res, { success: true, submissionId: result.submissionId });
});

module.exports = router;
