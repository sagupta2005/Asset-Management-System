const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AssetCategory = sequelize.define('AssetCategory', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  code: { type: DataTypes.STRING(20), unique: true },
  usefulLife: { type: DataTypes.INTEGER, defaultValue: 5, field: 'usefulLife' },
  depreciationRate: { type: DataTypes.DECIMAL(5, 2), field: 'depreciationRate' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'isActive' },
}, {
  tableName: 'asset_categories',
  timestamps: true,
});

module.exports = AssetCategory;
