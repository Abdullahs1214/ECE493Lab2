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

router.post('/submissions/:id/draft', requireAuth, async (req, res) => {
  const { metadata, manuscriptFile } = req.body || {};
  const result = await submissionService.saveDraft({
    submissionId: req.params.id,
    userId: req.session.userId,
    metadata,
    manuscriptFile
  });

  if (!result.ok) {
    const statusMap = {
      draft_insufficient: 400,
      draft_not_found: 404,
      db_error: 503,
      file_storage_error: 503
    };
    return sendError(res, statusMap[result.code] || 400, result.code, result.message);
  }

  return sendSuccess(res, { success: true, submissionId: result.submissionId, status: 'draft' });
});

router.post('/submissions/validate', requireAuth, async (req, res) => {
  const { metadata, manuscriptFile } = req.body || {};
  const result = await submissionService.validateSubmissionData({ metadata, manuscriptFile });
  if (!result.ok) {
    const statusMap = {
      metadata_missing: 400,
      field_invalid: 400,
      file_missing: 400,
      file_invalid: 400,
      file_format: 400,
      file_size: 400,
      validation_failure: 503
    };
    return sendError(res, statusMap[result.code] || 400, result.code, result.message, result.details);
  }

  return sendSuccess(res, { success: true, valid: true });
});

module.exports = router;
