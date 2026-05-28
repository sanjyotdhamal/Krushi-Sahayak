// models/Farmer.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const FarmerSchema = new mongoose.Schema({

  // ── Identity ──
  name:     { type: String, required: [true, 'Name is required'], trim: true },
  mobile:   { type: String, required: [true, 'Mobile is required'], unique: true, trim: true, match: [/^\d{10}$/, 'Enter valid 10-digit mobile'] },
  aadhaar:  { type: String, required: [true, 'Aadhaar is required'], unique: true, trim: true },
  category: { type: String, enum: ['general','obc','sc','st','nt'], default: 'general' },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },

  // ── Address ──
  district: { type: String, required: [true, 'District is required'] },
  taluka:   { type: String, required: [true, 'Taluka is required'] },
  village:  { type: String, required: [true, 'Village is required'] },
  pincode:  { type: String, match: [/^\d{6}$/, 'Enter valid 6-digit pincode'] },

  // ── Farm Details ──
  landSize:   { type: Number, required: [true, 'Land size is required'], min: 0.1 },
  landType:   { type: String, enum: ['owned','leased','both'], default: 'owned' },
  mainCrop:   { type: String, required: [true, 'Main crop is required'] },
  irrigation: { type: String, enum: ['well','borewell','canal','drip','rain','none'], default: 'well' },
  hasCattle:  { type: String, enum: ['yes','no'], default: 'no' },
  cattleCount:{ type: Number, default: 0 },

  // ── Bank Details ──
  bankName:      { type: String },
  accountHolder: { type: String },
  accountNumber: { type: String },
  ifscCode:      { type: String },

  // ── System Fields ──
  farmerId:     { type: String, unique: true },
  isVerified:   { type: Boolean, default: false },
  registeredOn: { type: Date, default: Date.now },

  // ── OTP (for mobile login) ──
  otp:          { type: String, select: false },
  otpExpire:    { type: Date,   select: false },

}, { timestamps: true });

// ── Auto-generate farmerId before save ──
FarmerSchema.pre('save', async function (next) {

  // Generate Farmer ID like KS-2024-54321
  if (!this.farmerId) {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    this.farmerId = `KS-${year}-${rand}`;
  }

  // Hash password if modified
  if (this.isModified('password')) {
    const salt  = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// ── Compare password ──
FarmerSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

// ── Generate OTP ──
FarmerSchema.methods.generateOTP = function () {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  this.otp       = otp;
  this.otpExpire = new Date(Date.now() + (process.env.OTP_EXPIRE_MINUTES || 10) * 60 * 1000);
  return otp;
};

module.exports = mongoose.model('Farmer', FarmerSchema);
