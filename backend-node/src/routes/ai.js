const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { ApiResponse } = require('../utils/apiResponse');
const aiService = require('../services/aiService');

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-powered asset management assistant (Gemini)
 */

/**
 * POST /api/ai/chat
 * Send a natural language message to the AI assistant.
 * AI chat routes.
 */
router.post('/chat', authenticate, async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json(ApiResponse.error(400, 'Message is required'));
  }
  const result = await aiService.chat(message.trim(), req.user.id);
  res.status(200).json(ApiResponse.success(result, 'AI response generated'));
});

/**
 * GET /api/ai/history
 * Retrieve chat history for the authenticated user.
 */
router.get('/history', authenticate, async (req, res) => {
  const { page = 0, size = 20 } = req.query;
  const data = await aiService.getChatHistory(req.user.id, parseInt(page), parseInt(size));
  res.status(200).json(ApiResponse.success(data));
});

module.exports = router;
