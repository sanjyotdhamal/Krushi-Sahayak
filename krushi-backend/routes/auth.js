// routes/auth.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  register, login, sendOTP, verifyOTP, getMe, authorityLogin
} = require('../controllers/authController');

router.post('/register',          register);
router.post('/login',             login);
router.post('/send-otp',          sendOTP);
router.post('/verify-otp',        verifyOTP);
router.get( '/me',                protect, getMe);
router.post('/authority/login',   authorityLogin);

module.exports = router;
