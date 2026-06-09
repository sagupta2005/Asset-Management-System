const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AssetMovement = sequelize.define('AssetMovement', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  assetId: { type: DataTypes.BIGINT, field: 'asset_id', allowNull: false },
  movedById: { type: DataTypes.BIGINT, field: 'moved_by_id' },
  movementType: {
    type: DataTypes.ENUM('ALLOCATION', 'RETURN', 'TRANSFER', 'REPAIR_CENTER', 'DISPOSAL', 'LOCATION_CHANGE'),
    field: 'movementType',
  },
  fromLocation: { type: DataTypes.STRING(200), field: 'fromLocation' },
  toLocation: { type: DataTypes.STRING(200), field: 'toLocation' },
  fromDepartment: { type: DataTypes.STRING(100), field: 'fromDepartment' },
  toDepartment: { type: DataTypes.STRING(100), field: 'toDepartment' },
  fromEmployee: { type: DataTypes.STRING(100), field: 'fromEmployee' },
  toEmployee: { type: DataTypes.STRING(100), field: 'toEmployee' },
  reason: { type: DataTypes.TEXT },
  movementDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'movementDate' },
}, {
  tableName: 'asset_movements',
  timestamps: true,
});

module.exports = AssetMovement;
