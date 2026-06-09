const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VendorRating = sequelize.define('VendorRating', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  vendorId: { type: DataTypes.BIGINT, field: 'vendor_id', allowNull: false },
  ratedById: { type: DataTypes.BIGINT, field: 'rated_by_id' },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  review: { type: DataTypes.TEXT },
}, {
  tableName: 'vendor_ratings',
  timestamps: true,
});

module.exports = VendorRating;
