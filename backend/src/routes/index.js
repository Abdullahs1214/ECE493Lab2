const express = require('express');
const authRoutes = require('./auth');
const submissionsRoutes = require('./submissions');
const reviewersRoutes = require('./reviewers');
const reviewsRoutes = require('./reviews');
const notificationsRoutes = require('./notifications');
const scheduleRoutes = require('./schedule');
const pricingRoutes = require('./pricing');
const paymentsRoutes = require('./payments');
const ticketsRoutes = require('./tickets');

const router = express.Router();

router.use(authRoutes);
router.use(submissionsRoutes);
router.use(reviewersRoutes);
router.use(reviewsRoutes);
router.use(notificationsRoutes);
router.use(scheduleRoutes);
router.use(pricingRoutes);
router.use(paymentsRoutes);
router.use(ticketsRoutes);

module.exports = router;
