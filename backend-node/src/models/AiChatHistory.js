const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * AiChatHistory — mirrors ai_chat_histories table
 * Stores Gemini AI conversation history per user.
 */
const AiChatHistory = sequelize.define('AiChatHistory', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.BIGINT, field: 'user_id', allowNull: false },
  sessionId: { type: DataTypes.STRING(100), field: 'sessionId', allowNull: true },
  userMessage: { type: DataTypes.TEXT, field: 'userMessage', allowNull: true },
  // Use TEXT with 'long' sub-type for LONGTEXT in MySQL
  aiResponse: {
    type: DataTypes.TEXT('long'),
    field: 'aiResponse',
    allowNull: true,
  },
  tokensUsed: { type: DataTypes.INTEGER, field: 'tokensUsed', allowNull: true },
}, {
  tableName: 'ai_chat_histories',
  timestamps: true,
  updatedAt: false,
});

module.exports = AiChatHistory;
