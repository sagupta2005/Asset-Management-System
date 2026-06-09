const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  performedById: { type: DataTypes.BIGINT, field: 'performed_by_id' },
  action: { type: DataTypes.STRING(50), allowNull: false },
  entityType: { type: DataTypes.STRING(50), allowNull: false, field: 'entityType' },
  entityId: { type: DataTypes.BIGINT, field: 'entityId' },
  oldValues: { type: DataTypes.JSON, field: 'oldValues' },
  newValues: { type: DataTypes.JSON, field: 'newValues' },
  description: { type: DataTypes.TEXT },
  ipAddress: { type: DataTypes.STRING(50), field: 'ipAddress' },
  userAgent: { type: DataTypes.STRING(500), field: 'userAgent' },
}, {
  tableName: 'audit_logs',
  timestamps: true,
  updatedAt: false,
});

module.exports = AuditLog;
