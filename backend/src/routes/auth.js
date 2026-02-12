const express = require('express');
const { sendError, sendSuccess } = require('../services/errors');
const userService = require('../services/user_service');
const authService = require('../services/auth_service');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return sendError(res, 400, 'invalid_request', 'Email and password are required.');
  }

  const result = await userService.registerUser(email, password);
  if (!result.ok) {
    const statusMap = {
      invalid_email: 400,
      weak_password: 400,
      duplicate_email: 409,
      policy_unavailable: 503,
      db_error: 503
    };
    return sendError(res, statusMap[result.code] || 400, result.code, result.message);
  }

  return res.redirect(302, '/login');
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return sendError(res, 400, 'invalid_request', 'Email and password are required.');
  }

  const result = await authService.login(email, password);
  if (!result.ok) {
    const status = result.code === 'invalid_credentials' ? 401 : 503;
    return sendError(res, status, result.code, result.message);
  }

  req.session.userId = result.user.id;
  return sendSuccess(res, { success: true });
});

router.post('/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return sendError(res, 400, 'invalid_request', 'Current and new password are required.');
  }

  const result = await authService.changePassword(req.session.userId, currentPassword, newPassword);
  if (!result.ok) {
    const statusMap = {
      current_password_incorrect: 400,
      weak_password: 400,
      policy_unavailable: 503,
      update_failed: 503,
      db_error: 503,
      auth_unavailable: 503
    };
    return sendError(res, statusMap[result.code] || 400, result.code, result.message);
  }

  return sendSuccess(res, { success: true });
});

module.exports = router;
