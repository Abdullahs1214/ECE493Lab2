const express = require('express');
const authRoutes = require('./auth');
const submissionsRoutes = require('./submissions');

const router = express.Router();

router.use(authRoutes);
router.use(submissionsRoutes);

module.exports = router;
