// routes/notifications.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications, markRead, markAllRead, deleteOne
} = require('../controllers/notificationController');

router.get( '/',              protect, getNotifications);
router.put( '/read-all',      protect, markAllRead);
router.put( '/:id/read',      protect, markRead);
router.delete('/:id',         protect, deleteOne);

module.exports = router;
