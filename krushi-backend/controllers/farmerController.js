// controllers/farmerController.js
const Farmer = require('../models/Farmer');
const bcrypt = require('bcryptjs');

// ══════════════════════════════════════════════
// @route  GET /api/farmer/profile
// @desc   Get farmer profile
// @access Private
// ══════════════════════════════════════════════
exports.getProfile = async (req, res) => {
  res.json({ success: true, farmer: req.farmer });
};

// ══════════════════════════════════════════════
// @route  PUT /api/farmer/personal
// @desc   Update personal + address details
// @access Private
// ══════════════════════════════════════════════
exports.updatePersonal = async (req, res, next) => {
  try {
    const { name, category, district, taluka, village, pincode } = req.body;

    const updated = await Farmer.findByIdAndUpdate(
      req.farmer._id,
      { name, category, district, taluka, village, pincode },
      { new: true, runValidators: true }
    );
    res.json({ success: true, msg: 'Personal details updated.', farmer: updated });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
// @route  PUT /api/farmer/farm
// @desc   Update farm details
// @access Private
// ══════════════════════════════════════════════
exports.updateFarm = async (req, res, next) => {
  try {
    const { landSize, landType, mainCrop, irrigation, hasCattle, cattleCount } = req.body;

    const updated = await Farmer.findByIdAndUpdate(
      req.farmer._id,
      {
        landSize: parseFloat(landSize),
        landType, mainCrop, irrigation,
        hasCattle: hasCattle || 'no',
        cattleCount: parseInt(cattleCount) || 0,
      },
      { new: true, runValidators: true }
    );
    res.json({ success: true, msg: 'Farm details updated.', farmer: updated });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
// @route  PUT /api/farmer/bank
// @desc   Update bank details
// @access Private
// ══════════════════════════════════════════════
exports.updateBank = async (req, res, next) => {
  try {
    const { bankName, accountHolder, accountNumber, ifscCode } = req.body;

    if (accountNumber.length < 8) {
      return res.status(400).json({ success: false, msg: 'Enter valid account number.' });
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test((ifscCode || '').toUpperCase())) {
      return res.status(400).json({ success: false, msg: 'Enter valid IFSC code (e.g. SBIN0001234).' });
    }

    const updated = await Farmer.findByIdAndUpdate(
      req.farmer._id,
      { bankName, accountHolder, accountNumber, ifscCode: ifscCode.toUpperCase() },
      { new: true }
    );
    res.json({ success: true, msg: 'Bank details updated.', farmer: updated });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════
// @route  PUT /api/farmer/password
// @desc   Change password
// @access Private
// ══════════════════════════════════════════════
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, msg: 'Enter current and new password.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, msg: 'New password must be at least 6 characters.' });
    }

    const farmer = await Farmer.findById(req.farmer._id).select('+password');
    const isMatch = await farmer.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, msg: 'Current password is incorrect.' });
    }

    farmer.password = newPassword;
    await farmer.save();

    res.json({ success: true, msg: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};
