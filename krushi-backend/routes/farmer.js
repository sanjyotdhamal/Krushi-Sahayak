// routes/farmer.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProfile, updatePersonal, updateFarm, updateBank, changePassword
} = require('../controllers/farmerController');

router.get( '/profile',  protect, getProfile);
router.put( '/personal', protect, updatePersonal);
router.put( '/farm',     protect, updateFarm);
router.put( '/bank',     protect, updateBank);
router.put( '/password', protect, changePassword);

module.exports = router;
