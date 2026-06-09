const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AssetAllocation = sequelize.define('AssetAllocation', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  assetId: { type: DataTypes.BIGINT, field: 'asset_id', allowNull: false },
  employeeId: { type: DataTypes.BIGINT, field: 'employee_id', allowNull: false },
  allocatedById: { type: DataTypes.BIGINT, field: 'allocated_by_id' },
  returnedToId: { type: DataTypes.BIGINT, field: 'returned_to_id' },
  allocatedDate: { type: DataTypes.DATE, field: 'allocatedDate' },
  expectedReturn: { type: DataTypes.DATE, field: 'expectedReturn' },
  actualReturn: { type: DataTypes.DATE, field: 'actualReturn' },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'RETURNED', 'TRANSFERRED', 'LOST'),
    defaultValue: 'ACTIVE',
  },
  purpose: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT },
}, {
  tableName: 'asset_allocations',
  timestamps: true,
});

module.exports = AssetAllocation;
