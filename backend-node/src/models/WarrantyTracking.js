const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WarrantyTracking = sequelize.define('WarrantyTracking', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  assetId: { type: DataTypes.BIGINT, field: 'asset_id', allowNull: false },
  warrantyType: {
    type: DataTypes.ENUM('MANUFACTURER', 'EXTENDED', 'THIRD_PARTY', 'ON_SITE', 'COMPREHENSIVE'),
    field: 'warrantyType',
  },
  startDate: { type: DataTypes.DATEONLY, field: 'startDate' },
  expiryDate: { type: DataTypes.DATEONLY, field: 'expiryDate' },
  providerName: { type: DataTypes.STRING(200), field: 'providerName' },
  contractNumber: { type: DataTypes.STRING(100), field: 'contractNumber' },
  notes: { type: DataTypes.TEXT },
  alertSent30: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'alertSent30' },
  alertSent7: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'alertSent7' },
}, {
  tableName: 'warranty_trackings',
  timestamps: true,
});

module.exports = WarrantyTracking;
