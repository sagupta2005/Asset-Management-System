const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AssetHealthScore = sequelize.define('AssetHealthScore', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  assetId: { type: DataTypes.BIGINT, field: 'asset_id', unique: true, allowNull: false },
  healthScore: { type: DataTypes.DECIMAL(5, 2), field: 'healthScore' },
  healthLevel: {
    type: DataTypes.ENUM('EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', 'CRITICAL'),
    field: 'healthLevel',
  },
  ageScore: { type: DataTypes.DECIMAL(5, 2), field: 'ageScore' },
  maintenanceScore: { type: DataTypes.DECIMAL(5, 2), field: 'maintenanceScore' },
  repairCostScore: { type: DataTypes.DECIMAL(5, 2), field: 'repairCostScore' },
  downtimeScore: { type: DataTypes.DECIMAL(5, 2), field: 'downtimeScore' },
  warrantyScore: { type: DataTypes.DECIMAL(5, 2), field: 'warrantyScore' },
  riskLevel: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
    field: 'riskLevel',
  },
  riskScore: { type: DataTypes.DECIMAL(5, 2), field: 'riskScore' },
  nextMaintenanceDate: { type: DataTypes.DATEONLY, field: 'nextMaintenanceDate' },
  recommendations: { type: DataTypes.TEXT },
  calculatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'calculatedAt' },
}, {
  tableName: 'asset_health_scores',
  timestamps: true,
});

module.exports = AssetHealthScore;
