const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.BIGINT, field: 'user_id', allowNull: false },
  type: {
    type: DataTypes.ENUM(
      'ASSET_ASSIGNED', 'ASSET_RETURNED', 'MAINTENANCE_ASSIGNED',
      'MAINTENANCE_COMPLETE', 'WARRANTY_EXPIRING', 'WARRANTY_EXPIRED',
      'SYSTEM', 'ALERT'
    ),
  },
  title: { type: DataTypes.STRING(200), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  entityType: { type: DataTypes.STRING(50), field: 'entityType' },
  entityId: { type: DataTypes.BIGINT, field: 'entityId' },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'isRead' },
  sendEmail: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'sendEmail' },
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    { fields: ['user_id', 'isRead'] },
  ]
});

module.exports = Notification;
