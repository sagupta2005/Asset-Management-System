const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vendor = sequelize.define('Vendor', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  vendorCode: { type: DataTypes.STRING(30), unique: true, field: 'vendorCode' },
  name: { type: DataTypes.STRING(200), allowNull: false },
  contactPerson: { type: DataTypes.STRING(100), field: 'contactPerson' },
  email: { type: DataTypes.STRING(500) },
  phone: { type: DataTypes.STRING(500) },
  address: { type: DataTypes.TEXT },
  city: { type: DataTypes.STRING(100) },
  state: { type: DataTypes.STRING(100) },
  country: { type: DataTypes.STRING(100), defaultValue: 'India' },
  pincode: { type: DataTypes.STRING(20) },
  gstin: { type: DataTypes.STRING(30) },
  website: { type: DataTypes.STRING(500) },
  avgRating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0.00, field: 'avgRating' },
  totalRatings: { type: DataTypes.INTEGER, defaultValue: 0, field: 'totalRatings' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'isActive' },
  notes: { type: DataTypes.TEXT },
}, {
  tableName: 'vendors',
  timestamps: true,
});

module.exports = Vendor;
