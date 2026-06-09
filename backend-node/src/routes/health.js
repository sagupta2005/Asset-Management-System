const express = require('express');
const router = express.Router();
const assetHealthService = require('../services/assetHealthService');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { ApiResponse } = require('../utils/apiResponse');

/**
 * Asset Health Routes.
 * Matches frontend healthApi endpoints.
 */

// GET /api/health/high-risk — list high-risk assets
router.get('/high-risk', authenticate, async (req, res) => {
  const { page = 0, size = 10 } = req.query;
  const data = await assetHealthService.getHighRiskAssets(parseInt(page), parseInt(size));
  res.status(200).json(ApiResponse.success(data));
});

// POST /api/health/recalculate-all — trigger full recalculation
router.post('/recalculate-all', authenticate, requireAdmin, async (req, res) => {
  await assetHealthService.recalculateAll();
  res.status(200).json(ApiResponse.success(null, 'Health scores recalculated for all assets'));
});

// GET /api/health/asset/:id — get health score for specific asset
router.get('/asset/:id', authenticate, async (req, res) => {
  const data = await assetHealthService.getHealthScore(req.params.id);
  res.status(200).json(ApiResponse.success(data));
});

// POST /api/health/calculate/:assetId — calculate score for specific asset (frontend: calculateForAsset)
router.post('/calculate/:assetId', authenticate, async (req, res) => {
  const data = await assetHealthService.calculateForAsset(req.params.assetId);
  res.status(200).json(ApiResponse.success(data, 'Health score calculated'));
});

// POST /api/health/asset/:id — also support this (legacy route)
router.post('/asset/:id', authenticate, async (req, res) => {
  const data = await assetHealthService.calculateForAsset(req.params.id);
  res.status(200).json(ApiResponse.success(data, 'Health score calculated'));
});

module.exports = router;
