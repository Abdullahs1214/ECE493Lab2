const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { sendError, sendSuccess } = require('../services/errors');
const paymentService = require('../services/payment_service');

const router = express.Router();

router.post('/tickets', requireAuth, async (req, res) => {
  const result = await paymentService.issueTicket({ userId: req.session.userId });

  if (!result.ok) {
    const statusMap = {
      payment_required: 400,
      ticket_generation_failure: 503,
      storage_failure: 503,
      delivery_failure: 503
    };
    return sendError(res, statusMap[result.code] || 400, result.code, result.message);
  }

  return sendSuccess(res, {
    success: true,
    ticketId: result.ticketId,
    paymentConfirmation: result.paymentConfirmation,
    ticketDetails: result.ticketDetails
  });
});

module.exports = router;
