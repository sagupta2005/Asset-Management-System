const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BudgetForecast = sequelize.define('BudgetForecast', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  departmentId: { type: DataTypes.BIGINT, field: 'department_id' },
  forecastType: {
    type: DataTypes.ENUM('REPLACEMENT', 'MAINTENANCE', 'UPGRADE', 'NEW_PURCHASE'),
    field: 'forecastType',
  },
  financialYear: { type: DataTypes.STRING(10), field: 'financialYear' },
  quarter: { type: DataTypes.INTEGER },
  estimatedAmount: { type: DataTypes.DECIMAL(15, 2), field: 'estimatedAmount' },
  actualAmount: { type: DataTypes.DECIMAL(15, 2), field: 'actualAmount' },
  description: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM('DRAFT', 'APPROVED', 'REJECTED', 'COMPLETED'),
    defaultValue: 'DRAFT',
  },
}, {
  tableName: 'budget_forecasts',
  timestamps: true,
});

module.exports = BudgetForecast;
