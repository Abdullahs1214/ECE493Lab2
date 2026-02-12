const express = require('express');
const authRoutes = require('./auth');
const submissionsRoutes = require('./submissions');
const reviewersRoutes = require('./reviewers');

const router = express.Router();

router.use(authRoutes);
router.use(submissionsRoutes);
router.use(reviewersRoutes);

module.exports = router;
