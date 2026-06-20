const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  requestNumber: { type: DataTypes.STRING(30), unique: true, field: 'requestNumber' },
  assetId: { type: DataTypes.BIGINT, field: 'asset_id', allowNull: false },
  requestedById: { type: DataTypes.BIGINT, field: 'requested_by_id' },
  assignedToId: { type: DataTypes.BIGINT, field: 'assigned_to_id' },
  issueType: {
    type: DataTypes.ENUM('HARDWARE', 'SOFTWARE', 'NETWORK', 'PHYSICAL_DAMAGE', 'ROUTINE', 'OTHER'),
    field: 'issueType',
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    defaultValue: 'MEDIUM',
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'OPEN',
  },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  estimatedCost: { type: DataTypes.DECIMAL(12, 2), field: 'estimatedCost' },
  actualCost: { type: DataTypes.DECIMAL(12, 2), field: 'actualCost' },
  assignedTechnician: { type: DataTypes.STRING(100), field: 'assignedTechnician' },
  startedAt: { type: DataTypes.DATE, field: 'startedAt' },
  completedAt: { type: DataTypes.DATE, field: 'completedAt' },
  downtimeHours: { type: DataTypes.DECIMAL(8, 2), field: 'downtimeHours' },
  resolutionNotes: { type: DataTypes.TEXT, field: 'resolutionNotes' },
}, {
  tableName: 'maintenance_requests',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['requestNumber'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['asset_id'] },
  ]
});

module.exports = MaintenanceRequest;
