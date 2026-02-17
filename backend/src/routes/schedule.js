const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { sendError, sendSuccess } = require('../services/errors');
const scheduleService = require('../services/schedule_service');

const router = express.Router();

router.post('/schedule/generate', requireAuth, async (req, res) => {
  const result = await scheduleService.generateSchedule();
  if (!result.ok) {
    const statusMap = {
      no_accepted_papers: 400,
      no_resources: 400,
      unsatisfied_constraints: 400,
      db_error: 503
    };
    return sendError(res, statusMap[result.code] || 400, result.code, result.message);
  }

  return sendSuccess(res, { success: true, generatedCount: result.generatedCount });
});

router.post('/schedule/modify', requireAuth, async (req, res) => {
  const { items } = req.body || {};
  const result = await scheduleService.modifySchedule({ items });
  if (!result.ok) {
    const statusMap = {
      invalid_modification: 400,
      conflict: 400,
      constraint_violation: 400,
      db_error: 503
    };
    return sendError(res, statusMap[result.code] || 400, result.code, result.message);
  }

  return sendSuccess(res, { success: true, updatedCount: result.updatedCount });
});

router.post('/schedule/publish', requireAuth, async (req, res) => {
  const result = await scheduleService.publishSchedule();
  if (!result.ok) {
    const statusMap = {
      retrieval_failure: 503,
      publishing_failure: 503,
      author_access_failure: 503
    };
    return sendError(res, statusMap[result.code] || 400, result.code, result.message);
  }

  return sendSuccess(res, {
    success: true,
    published: result.published,
    visibleToAuthors: result.visibleToAuthors,
    itemCount: result.itemCount
  });
});

module.exports = router;
