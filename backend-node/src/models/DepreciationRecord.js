const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DepreciationRecord = sequelize.define('DepreciationRecord', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  assetId: { type: DataTypes.BIGINT, field: 'asset_id', allowNull: false },
  calculatedById: { type: DataTypes.BIGINT, field: 'calculated_by_id' },
  financialYear: { type: DataTypes.STRING(10), allowNull: false, field: 'financialYear' },
  openingValue: { type: DataTypes.DECIMAL(15, 2), field: 'openingValue' },
  depreciationRate: { type: DataTypes.DECIMAL(6, 4), field: 'depreciationRate' },
  depreciationAmt: { type: DataTypes.DECIMAL(15, 2), field: 'depreciationAmt' },
  closingValue: { type: DataTypes.DECIMAL(15, 2), field: 'closingValue' },
  method: {
    type: DataTypes.ENUM('STRAIGHT_LINE', 'DOUBLE_DECLINING', 'SUM_OF_YEARS'),
    defaultValue: 'STRAIGHT_LINE',
  },
  calculatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'calculatedAt' },
}, {
  tableName: 'depreciation_records',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['asset_id', 'financialYear'] },
  ],
});

module.exports = DepreciationRecord;
