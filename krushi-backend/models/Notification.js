// models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  farmer:   { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  title:    { type: String, required: true },
  title_mr: { type: String },
  msg:      { type: String, required: true },
  msg_mr:   { type: String },
  type:     { type: String, enum: ['success','info','warning','error'], default: 'info' },
  read:     { type: Boolean, default: false },
  link:     { type: String }, // optional page to redirect to
}, { timestamps: true });

// Auto-delete notifications older than 90 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('Notification', NotificationSchema);
