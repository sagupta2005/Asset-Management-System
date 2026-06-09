const axios = require('axios');
const { Asset, MaintenanceRequest, WarrantyTracking, AiChatHistory, User } = require('../models');
const { PagedResponse } = require('../utils/apiResponse');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * AI Service.
 * Processes natural language queries using Gemini API.
 * Falls back to rule-based responses when API key is not configured.
 */

// ─── Main Chat Method ─────────────────────────────────────────────────────────

async function chat(userMessage, currentUserId) {
  logger.info(`AI chat request from user ${currentUserId}: ${userMessage.substring(0, 80)}...`);

  // Build context from database
  const context = await buildDatabaseContext();
  const systemPrompt = buildSystemPrompt(context);
  const fullPrompt = `${systemPrompt}\n\nUser Question: ${userMessage}`;

  let aiResponse;
  const apiKey = config.gemini.apiKey;

  if (!apiKey || apiKey === 'your-gemini-api-key' || apiKey === '') {
    // Fallback: rule-based response
    aiResponse = await generateFallbackResponse(userMessage);
  } else {
    aiResponse = await callGeminiApi(fullPrompt, apiKey);
  }

  // Save chat history
  await saveChatHistory(currentUserId, userMessage, aiResponse);

  return { message: aiResponse, timestamp: new Date() };
}

// ─── Context Builder ─────────────────────────────────────────────────────────

async function buildDatabaseContext() {
  const today = new Date();
  const ninetyDaysLater = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

  const [
    total, available, assigned, underRepair,
    recentAssets, expiringWarranties, openMaintenance,
  ] = await Promise.all([
    Asset.count({ where: { isActive: true } }),
    Asset.count({ where: { isActive: true, status: 'AVAILABLE' } }),
    Asset.count({ where: { isActive: true, status: 'ASSIGNED' } }),
    Asset.count({ where: { isActive: true, status: 'UNDER_REPAIR' } }),
    Asset.findAll({
      where: { isActive: true },
      include: [
        { model: require('../models').AssetCategory, as: 'category', attributes: ['name'], required: false },
        { model: require('../models').Department, as: 'department', attributes: ['name'], required: false },
        { model: require('../models').Employee, as: 'assignedTo', attributes: ['firstName', 'lastName'], required: false },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
    }),
    WarrantyTracking.findAll({
      where: {
        expiryDate: {
          [require('sequelize').Op.between]: [
            today.toISOString().split('T')[0],
            ninetyDaysLater.toISOString().split('T')[0],
          ],
        },
      },
      include: [{ model: Asset, as: 'asset', attributes: ['name', 'assetTag'] }],
      limit: 10,
    }),
    MaintenanceRequest.findAll({
      where: { status: { [require('sequelize').Op.ne]: 'COMPLETED' } },
      include: [{ model: Asset, as: 'asset', attributes: ['assetTag', 'name'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    }),
  ]);

  let ctx = '=== CURRENT DATABASE CONTEXT ===\n\n';
  ctx += `ASSETS: Total=${total}, Available=${available}, Assigned=${assigned}, Under Repair=${underRepair}\n\n`;

  if (recentAssets.length > 0) {
    ctx += 'RECENT ASSETS:\n';
    recentAssets.forEach(a => {
      const assignedToName = a.assignedTo
        ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}`
        : 'Unassigned';
      ctx += `ASSET: [${a.assetTag}] ${a.name} | Category: ${a.category?.name || 'N/A'} | Status: ${a.status} | Dept: ${a.department?.name || 'N/A'} | Assigned To: ${assignedToName}\n`;
    });
  }

  ctx += '\n\nWARRANTY EXPIRING (next 90 days):\n';
  if (expiringWarranties.length === 0) {
    ctx += '- No warranties expiring in the next 90 days.\n';
  } else {
    expiringWarranties.forEach(w => {
      ctx += `- ${w.asset?.name || 'Unknown'} expires ${w.expiryDate}\n`;
    });
  }

  ctx += '\nOPEN MAINTENANCE REQUESTS:\n';
  if (openMaintenance.length === 0) {
    ctx += '- No open maintenance requests.\n';
  } else {
    openMaintenance.forEach(m => {
      ctx += `- [${m.asset?.assetTag || ''}] ${m.asset?.name || ''} | Priority: ${m.priority} | Status: ${m.status}\n`;
    });
  }

  ctx += '\n=== END CONTEXT ===';
  return ctx;
}

function buildSystemPrompt(context) {
  return `You are an intelligent AI assistant for an enterprise Asset Management System.
Your role is to answer questions about assets, employees, maintenance, warranties, and allocations.

Always respond in a clear, professional, and helpful manner.
Use the database context below to provide accurate, data-driven answers.
If the user asks for something not in the context, say "I don't have that information in the current database."
Format your responses with clear structure using bullet points or tables when appropriate.

${context}`;
}

// ─── Gemini API Call ─────────────────────────────────────────────────────────

async function callGeminiApi(prompt, apiKey) {
  try {
    const url = `${config.gemini.baseUrl}/models/${config.gemini.model}:generateContent?key=${apiKey}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
    }, { timeout: 30000 });

    const candidates = response.data?.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0]?.content?.parts;
      if (parts && parts.length > 0) {
        return parts[0].text;
      }
    }
    return 'I encountered an issue processing your request. Please try again.';
  } catch (err) {
    logger.error(`Gemini API call failed: ${err.message}`);
    return `AI service temporarily unavailable. ${await generateFallbackResponse('')}`;
  }
}

// ─── Fallback Rule-Based Responses ───────────────────────────────────────────

async function generateFallbackResponse(query) {
  const q = (query || '').toLowerCase();

  if ((q.includes('available') && (q.includes('laptop') || q.includes('asset'))) || q.includes('how many available')) {
    const count = await Asset.count({ where: { isActive: true, status: 'AVAILABLE' } });
    return `📊 **Available Assets**\n\nThere are currently **${count}** available assets in the system.\n\nTo see the full list, please visit the Assets module and filter by status 'Available'.`;
  }

  if (q.includes('warranty') && (q.includes('expir') || q.includes('month'))) {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const count = await WarrantyTracking.count({
      where: {
        expiryDate: {
          [require('sequelize').Op.between]: [
            today.toISOString().split('T')[0],
            thirtyDaysLater.toISOString().split('T')[0],
          ],
        },
      },
    });
    return `⚠️ **Warranty Alerts**\n\nThere are **${count}** assets with warranties expiring in the next 30 days.\n\nVisit the Warranty Management module to see details and take action.`;
  }

  if (q.includes('repair') || q.includes('maintenance') || q.includes('under repair')) {
    const count = await Asset.count({ where: { isActive: true, status: 'UNDER_REPAIR' } });
    return `🔧 **Assets Under Repair**\n\nCurrently **${count}** assets are under repair.\n\nCheck the Maintenance module for detailed repair status and technician assignments.`;
  }

  if (q.includes('assigned') || q.includes('allocation')) {
    const count = await Asset.count({ where: { isActive: true, status: 'ASSIGNED' } });
    return `👤 **Assigned Assets**\n\n**${count}** assets are currently assigned to employees.\n\nVisit the Allocation module for the complete assignment history and details.`;
  }

  if (q.includes('total') || q.includes('summary') || q.includes('overview')) {
    const [total, available, assigned, repair] = await Promise.all([
      Asset.count({ where: { isActive: true } }),
      Asset.count({ where: { isActive: true, status: 'AVAILABLE' } }),
      Asset.count({ where: { isActive: true, status: 'ASSIGNED' } }),
      Asset.count({ where: { isActive: true, status: 'UNDER_REPAIR' } }),
    ]);
    return `📈 **Asset Summary**\n\n| Status | Count |\n|--------|-------|\n| ✅ Total Active | ${total} |\n| 🟢 Available | ${available} |\n| 👤 Assigned | ${assigned} |\n| 🔧 Under Repair | ${repair} |\n\nUse the Dashboard for visual charts and trends.`;
  }

  return `👋 **Hello! I'm your Asset Management AI Assistant.**\n\nI can help you with:\n- 📦 Finding available assets by category or department\n- ⚠️ Checking warranty expiration alerts\n- 🔧 Viewing assets under repair\n- 👤 Asset allocation status\n- 📊 Getting asset summaries\n\nTry asking me:\n- "Show available laptops"\n- "Which warranties expire this month?"\n- "How many assets are under repair?"\n- "Give me an asset summary"\n\n*Note: Connect a Gemini API key in your .env for full AI capabilities.*`;
}

// ─── Chat History ─────────────────────────────────────────────────────────────

async function saveChatHistory(userId, userMessage, aiResponse) {
  try {
    await AiChatHistory.create({ userId, userMessage, aiResponse });
  } catch (err) {
    logger.warn(`Could not save chat history: ${err.message}`);
  }
}

async function getChatHistory(userId, page = 0, size = 20) {
  const { count, rows } = await AiChatHistory.findAndCountAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit: size,
    offset: page * size,
  });
  return PagedResponse.from(rows.map(h => ({
    id: h.id,
    userMessage: h.userMessage,
    aiResponse: h.aiResponse,
    createdAt: h.createdAt,
  })), count, page, size);
}

module.exports = { chat, getChatHistory };
