const { Notification, User } = require('../models');
const { ResourceNotFoundError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Notification Service.
 */

async function createNotification(userId, type, title, message, entityType, entityId, sendEmail) {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      entityType,
      entityId,
      isRead: false,
      sendEmail: sendEmail || false,
    });
    logger.debug(`Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (err) {
    logger.error(`Failed to create notification: ${err.message}`);
  }
}

async function getUserNotifications(userId, page = 0, size = 20, unreadOnly = false) {
  const where = { userId };
  if (unreadOnly) where.isRead = false;

  const { count, rows } = await Notification.findAndCountAll({
    where,
    limit: size,
    offset: page * size,
    order: [['createdAt', 'DESC']],
  });

  return { content: rows, total: count, page, size };
}

async function markAsRead(notificationId, userId) {
  const notification = await Notification.findOne({ where: { id: notificationId, userId } });
  if (!notification) throw new ResourceNotFoundError('Notification', 'id', notificationId);

  notification.isRead = true;
  await notification.save();
  return notification;
}

async function markAllAsRead(userId) {
  await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
}

async function deleteNotification(notificationId, userId) {
  const notification = await Notification.findOne({ where: { id: notificationId, userId } });
  if (!notification) throw new ResourceNotFoundError('Notification', 'id', notificationId);
  await notification.destroy();
}

async function getUnreadCount(userId) {
  return Notification.count({ where: { userId, isRead: false } });
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
