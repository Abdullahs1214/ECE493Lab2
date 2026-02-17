const express = require('express');
const { sendError, sendSuccess } = require('../services/errors');
const pricingModel = require('../models/pricing');

const router = express.Router();

router.get('/pricing', async (req, res) => {
  if (process.env.SIMULATE_PRICING_RETRIEVAL_FAILURE === 'true') {
    return sendError(res, 503, 'retrieval_failure', 'Pricing retrieval failure.');
  }

  let pricing;
  try {
    pricing = await pricingModel.getCurrentPricing();
  } catch (err) {
    return sendError(res, 503, 'retrieval_failure', 'Pricing retrieval failure.');
  }

  if (!pricing) {
    return sendError(res, 404, 'pricing_unavailable', 'Pricing information unavailable.');
  }

  return sendSuccess(res, { success: true, registrationFee: pricing.registration_fee });
});

module.exports = router;
