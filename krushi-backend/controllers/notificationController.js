// controllers/notificationController.js
const Notification = require('../models/Notification');

// GET /api/notifications — get farmer's notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifs = await Notification.find({ farmer: req.farmer._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unread = notifs.filter(n => !n.read).length;
    res.json({ success: true, unread, notifications: notifs });
  } catch (err) { next(err); }
};

// PUT /api/notifications/:id/read — mark one as read
exports.markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, farmer: req.farmer._id },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) { next(err); }
};

// PUT /api/notifications/read-all — mark all as read
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ farmer: req.farmer._id, read: false }, { read: true });
    res.json({ success: true, msg: 'All notifications marked as read.' });
  } catch (err) { next(err); }
};

// DELETE /api/notifications/:id — delete one
exports.deleteOne = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, farmer: req.farmer._id });
    res.json({ success: true });
  } catch (err) { next(err); }
};
