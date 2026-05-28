// middleware/auth.js — JWT verification middleware
const jwt     = require('jsonwebtoken');
const Farmer  = require('../models/Farmer');

// ── Protect farmer routes ──
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, msg: 'Not authorised. Please login.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.farmer    = await Farmer.findById(decoded.id);
    if (!req.farmer) {
      return res.status(401).json({ success: false, msg: 'Farmer not found.' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, msg: 'Invalid or expired token. Please login again.' });
  }
};

// ── Protect authority routes ──
exports.protectAuthority = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, msg: 'Authority access required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.AUTHORITY_JWT_SECRET);
    if (decoded.role !== 'authority') {
      return res.status(403).json({ success: false, msg: 'Access denied.' });
    }
    req.authority = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, msg: 'Invalid authority token.' });
  }
};
