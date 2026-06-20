const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  employeeCode: { type: DataTypes.STRING(30), unique: true, field: 'employeeCode' },
  firstName: { type: DataTypes.STRING(50), allowNull: false, field: 'firstName' },
  lastName: { type: DataTypes.STRING(50), allowNull: false, field: 'lastName' },
  // Encrypted PII
  email: { type: DataTypes.STRING(500), allowNull: false, unique: true },
  phone: { type: DataTypes.STRING(500) },
  designation: { type: DataTypes.STRING(100) },
  joinDate: { type: DataTypes.DATEONLY, field: 'joinDate' },
  avatarUrl: { type: DataTypes.STRING(500), field: 'avatarUrl' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'isActive' },
  departmentId: { type: DataTypes.BIGINT, field: 'department_id' },
  userId: { type: DataTypes.BIGINT, field: 'user_id' },
}, {
  tableName: 'employees',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['employeeCode'] },
    { unique: true, fields: ['email'] },
    { fields: ['department_id'] },
    { fields: ['user_id'] },
  ]
});

module.exports = Employee;
