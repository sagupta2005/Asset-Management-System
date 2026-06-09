const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AssetDocument = sequelize.define('AssetDocument', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  assetId: { type: DataTypes.BIGINT, field: 'asset_id', allowNull: false },
  uploadedById: { type: DataTypes.BIGINT, field: 'uploaded_by_id' },
  documentType: {
    type: DataTypes.ENUM('INVOICE', 'WARRANTY_CARD', 'MANUAL', 'INSURANCE', 'PHOTO', 'OTHER'),
    field: 'documentType',
  },
  fileName: { type: DataTypes.STRING(255), allowNull: false, field: 'fileName' },
  filePath: { type: DataTypes.STRING(500), allowNull: false, field: 'filePath' },
  fileSize: { type: DataTypes.BIGINT, field: 'fileSize' },
  mimeType: { type: DataTypes.STRING(100), field: 'mimeType' },
  description: { type: DataTypes.TEXT },
}, {
  tableName: 'asset_documents',
  timestamps: true,
});

module.exports = AssetDocument;
