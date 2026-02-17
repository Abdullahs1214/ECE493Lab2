const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { sendError, sendSuccess } = require('../services/errors');
const paymentService = require('../services/payment_service');

const router = express.Router();

router.post('/payments', requireAuth, async (req, res) => {
  const { paymentInformation } = req.body || {};

  const result = await paymentService.processPayment({
    userId: req.session.userId,
    paymentInformation
  });

  if (!result.ok) {
    const statusMap = {
      invalid_payment_info: 400,
      payment_rejected: 400,
      gateway_unavailable: 503,
      db_error: 503
    };
    return sendError(res, statusMap[result.code] || 400, result.code, result.message);
  }

  return sendSuccess(res, {
    success: true,
    paymentId: result.paymentId,
    paymentConfirmation: result.paymentConfirmation,
    registered: result.registered
  });
});

module.exports = router;
