const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { authenticate } = require('../middleware/auth');
const { ApiResponse } = require('../utils/apiResponse');

router.get('/', authenticate, async (req, res) => {
  const { page = 0, size = 20, unreadOnly = false } = req.query;
  const data = await notificationService.getUserNotifications(req.user.id, parseInt(page), parseInt(size), unreadOnly === 'true');
  res.status(200).json(ApiResponse.success(data));
});

router.get('/unread-count', authenticate, async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  res.status(200).json(ApiResponse.success({ count }));
});

router.put('/:id/read', authenticate, async (req, res) => {
  const data = await notificationService.markAsRead(req.params.id, req.user.id);
  res.status(200).json(ApiResponse.success(data, 'Marked as read'));
});

router.put('/mark-all-read', authenticate, async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  res.status(200).json(ApiResponse.noContent('All notifications marked as read'));
});

router.delete('/:id', authenticate, async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user.id);
  res.status(200).json(ApiResponse.noContent('Notification deleted'));
});

module.exports = router;
