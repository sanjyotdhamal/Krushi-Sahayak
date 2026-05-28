// models/Application.js
const mongoose = require('mongoose');

const StatusHistorySchema = new mongoose.Schema({
  status: { type: String },
  note:   { type: String },
  date:   { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'system' },
}, { _id: false });

const ApplicationSchema = new mongoose.Schema({

  // ── References ──
  farmer:     { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  farmerId:   { type: String }, // KS-2024-XXXXX (denormalised for quick display)
  farmerName: { type: String },

  // ── Scheme Info ──
  schemeId:   { type: String, required: true },
  schemeName: { type: String, required: true },
  schemeAmount: { type: String },
  schemeDept:   { type: String },

  // ── Application Details ──
  appId:        { type: String, unique: true },
  status: {
    type: String,
    enum: ['submitted','under_review','pending_docs','approved','rejected'],
    default: 'submitted',
  },
  statusHistory: [StatusHistorySchema],

  // ── Documents Uploaded ──
  documents: [{
    name: String,
    url:  String,
    uploadedOn: { type: Date, default: Date.now },
  }],

  // ── Remarks ──
  farmerNote:    { type: String },
  authorityNote: { type: String },

  // ── Dates ──
  appliedOn:  { type: Date, default: Date.now },
  reviewedOn: { type: Date },
  approvedOn: { type: Date },

  // ── Amount Disbursed ──
  disbursedAmount: { type: Number, default: 0 },
  disbursedOn:     { type: Date },

}, { timestamps: true });

// ── Auto-generate appId before save ──
ApplicationSchema.pre('save', async function (next) {
  if (!this.appId) {
    const count = await mongoose.model('Application').countDocuments();
    this.appId = `KS-APP-2024-${String(count + 1).padStart(3, '0')}`;
  }
  // Push initial status history entry
  if (this.isNew) {
    this.statusHistory = [{
      status: 'submitted',
      note:   'Application submitted successfully',
      date:   new Date(),
    }];
  }
  next();
});

module.exports = mongoose.model('Application', ApplicationSchema);
