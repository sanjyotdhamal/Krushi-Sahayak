// controllers/authController.js
const jwt    = require('jsonwebtoken');
const Farmer = require('../models/Farmer');
const Notification = require('../models/Notification');

// ── Helper: generate JWT ──
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// ── Helper: send token response ──
const sendToken = (farmer, statusCode, res) => {
  const token = signToken(farmer._id);
  res.status(statusCode).json({
    success: true,
    token,
    farmer: {
      _id:          farmer._id,
      farmerId:     farmer.farmerId,
      name:         farmer.name,
      mobile:       farmer.mobile,
      aadhaar:      farmer.aadhaar,
      district:     farmer.district,
      taluka:       farmer.taluka,
      village:      farmer.village,
      pincode:      farmer.pincode,
      category:     farmer.category,
      landSize:     farmer.landSize,
      landType:     farmer.landType,
      mainCrop:     farmer.mainCrop,
      irrigation:   farmer.irrigation,
      hasCattle:    farmer.hasCattle,
      cattleCount:  farmer.cattleCount,
      bankName:     farmer.bankName,
      accountHolder:farmer.accountHolder,
      accountNumber:farmer.accountNumber,
      ifscCode:     farmer.ifscCode,
      registeredOn: farmer.registeredOn,
    },
  });
};

// ══════════════════════════════════════════════
// @route  POST /api/auth/register
// @desc   Register new farmer
// @access Public
// ══════════════════════════════════════════════
exports.register = async (req, res, next) => {
  try {
    const {
      name, mobile, aadhaar, category, password,
      district, taluka, village, pincode,
      landSize, landType, mainCrop, irrigation, hasCattle, cattleCount,
      bankName, accountHolder, accountNumber, ifscCode,
    } = req.body;

    // Check if mobile already registered
    const existing = await Farmer.findOne({ mobile });
    if (existing) {
      return res.status(400).json({ success: false, msg: 'Mobile number already registered. Please login.' });
    }

    // Create farmer
    const farmer = await Farmer.create({
      name, mobile, aadhaar, category, password,
      district, taluka, village, pincode,
      landSize: parseFloat(landSize),
      landType, mainCrop, irrigation,
      hasCattle: hasCattle || 'no',
      cattleCount: parseInt(cattleCount) || 0,
      bankName, accountHolder, accountNumber,
      ifscCode: (ifscCode || '').toUpperCase(),
    });

    // Send welcome notification
    await Notification.create({
      farmer:   farmer._id,
      title:    'Welcome to Krushi Sahayak! 🌾',
      title_mr: 'कृषी सहायकमध्ये स्वागत! 🌾',
      msg:      `Your Farmer ID is ${farmer.farmerId}. Start exploring schemes.`,
      msg_mr:   `तुमचा शेतकरी आयडी ${farmer.farmerId} आहे. योजना पाहण्यास सुरुवात करा.`,
      type:     'success',
    });

    sendToken(farmer, 201, res);

  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
// @route  POST /api/auth/login
// @desc   Login with mobile + password
// @access Public
// ══════════════════════════════════════════════
exports.login = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ success: false, msg: 'Please enter mobile number and password.' });
    }

    const farmer = await Farmer.findOne({ mobile }).select('+password');
    if (!farmer) {
      return res.status(401).json({ success: false, msg: 'Mobile number not found. Please register first.' });
    }

    const isMatch = await farmer.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, msg: 'Incorrect password. Please try again.' });
    }

    sendToken(farmer, 200, res);

  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
// @route  POST /api/auth/send-otp
// @desc   Send OTP to mobile number
// @access Public
// ══════════════════════════════════════════════
exports.sendOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, msg: 'Enter valid 10-digit mobile number.' });
    }

    const farmer = await Farmer.findOne({ mobile });
    if (!farmer) {
      return res.status(404).json({ success: false, msg: 'Mobile number not found. Please register first.' });
    }

    const otp = farmer.generateOTP();
    await farmer.save({ validateBeforeSave: false });

    // ── Try Fast2SMS; fall back to demo OTP ──
    if (process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY !== 'your_fast2sms_api_key_here') {
      try {
        const https = require('https');
        const body  = JSON.stringify({
          route: 'v3',
          sender_id: 'KRUSHI',
          message: `Your Krushi Sahayak OTP is ${otp}. Valid for ${process.env.OTP_EXPIRE_MINUTES || 10} minutes. Do not share.`,
          language: 'english',
          flash: 0,
          numbers: mobile,
        });
        await new Promise((resolve, reject) => {
          const req = https.request({
            hostname: 'www.fast2sms.com',
            path: '/dev/bulkV2',
            method: 'POST',
            headers: {
              authorization: process.env.FAST2SMS_API_KEY,
              'Content-Type': 'application/json',
            },
          }, (resp) => {
            let data = '';
            resp.on('data', chunk => data += chunk);
            resp.on('end', () => resolve(JSON.parse(data)));
          });
          req.on('error', reject);
          req.write(body);
          req.end();
        });
        return res.json({ success: true, msg: `OTP sent to ${mobile.replace(/\d{6}/, '******')}` });
      } catch (smsErr) {
        console.warn('SMS failed, falling back to demo OTP:', smsErr.message);
      }
    }

    // Demo mode — return OTP in response (development only)
    res.json({
      success:  true,
      msg:      'Demo mode: OTP generated',
      demoOTP:  process.env.NODE_ENV === 'development' ? otp : undefined,
      hint:     'Add FAST2SMS_API_KEY in .env for real SMS',
    });

  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
// @route  POST /api/auth/verify-otp
// @desc   Verify OTP and login
// @access Public
// ══════════════════════════════════════════════
exports.verifyOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    const farmer = await Farmer.findOne({ mobile }).select('+otp +otpExpire');
    if (!farmer) {
      return res.status(404).json({ success: false, msg: 'Mobile number not found.' });
    }
    if (!farmer.otp || farmer.otp !== otp) {
      return res.status(401).json({ success: false, msg: 'Invalid OTP. Please try again.' });
    }
    if (farmer.otpExpire < Date.now()) {
      return res.status(401).json({ success: false, msg: 'OTP expired. Please request a new one.' });
    }

    // Clear OTP
    farmer.otp       = undefined;
    farmer.otpExpire = undefined;
    await farmer.save({ validateBeforeSave: false });

    sendToken(farmer, 200, res);

  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
// @route  GET /api/auth/me
// @desc   Get current logged-in farmer
// @access Private
// ══════════════════════════════════════════════
exports.getMe = async (req, res) => {
  res.json({ success: true, farmer: req.farmer });
};

// ══════════════════════════════════════════════
// @route  POST /api/auth/authority/login
// @desc   Authority (admin) login
// @access Public
// ══════════════════════════════════════════════
exports.authorityLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (
      username !== process.env.AUTHORITY_USERNAME ||
      password !== process.env.AUTHORITY_PASSWORD
    ) {
      return res.status(401).json({ success: false, msg: 'Invalid authority credentials.' });
    }
    const token = jwt.sign(
      { role: 'authority', username },
      process.env.AUTHORITY_JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ success: true, token, role: 'authority' });
  } catch (err) {
    next(err);
  }
};
