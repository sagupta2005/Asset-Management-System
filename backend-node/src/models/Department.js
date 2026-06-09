const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('Department', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  code: { type: DataTypes.STRING(20), unique: true },
  description: { type: DataTypes.TEXT },
  location: { type: DataTypes.STRING(200) },
  managerName: { type: DataTypes.STRING(100), field: 'managerName' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'isActive' },
}, {
  tableName: 'departments',
  timestamps: true,
});

module.exports = Department;
