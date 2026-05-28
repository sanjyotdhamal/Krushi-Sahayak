// routes/applications.js
const express = require('express');
const router  = express.Router();
const { protect, protectAuthority } = require('../middleware/auth');
const {
  submitApplication, getMyApplications, getApplication,
  getAllApplications, updateStatus, getStats
} = require('../controllers/applicationController');

// Farmer routes
router.post('/',             protect, submitApplication);
router.get( '/my',           protect, getMyApplications);

// Authority routes (MUST come before /:id to avoid being caught by wildcard)
router.get( '/all',          protectAuthority, getAllApplications);
router.get( '/stats',        protectAuthority, getStats);
router.put( '/:id/status',   protectAuthority, updateStatus);

// Farmer routes (specific ID - MUST come after /all and /stats)
router.get( '/:id',          protect, getApplication);

module.exports = router;
