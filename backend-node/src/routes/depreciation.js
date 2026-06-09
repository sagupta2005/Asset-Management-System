const express = require('express');
const router = express.Router();
const depreciationService = require('../services/depreciationService');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { ApiResponse } = require('../utils/apiResponse');

/**
 * Depreciation Routes.
 * Matches frontend depreciationApi endpoints.
 */

// GET /api/depreciation/records — list records with filters
router.get('/records', authenticate, async (req, res) => {
  const { assetId, financialYear, page = 0, size = 20 } = req.query;
  const data = await depreciationService.getRecords({
    assetId: assetId ? parseInt(assetId) : null,
    financialYear,
    page: parseInt(page),
    size: parseInt(size),
  });
  res.status(200).json(ApiResponse.success(data));
});

// POST /api/depreciation/calculate/:assetId — calculate for one asset
router.post('/calculate/:assetId', authenticate, async (req, res) => {
  const data = await depreciationService.calculateForAsset(req.params.assetId, req.user.id);
  res.status(200).json(ApiResponse.success(data, 'Depreciation calculated'));
});

// POST /api/depreciation/calculate-all — bulk calculate
router.post('/calculate-all', authenticate, requireAdmin, async (req, res) => {
  const result = await depreciationService.bulkCalculate(req.user.id);
  res.status(200).json(ApiResponse.success(result, 'Bulk depreciation calculation completed'));
});

// Legacy routes for backward compatibility
router.get('/', authenticate, async (req, res) => {
  const { assetId, financialYear, page = 0, size = 20 } = req.query;
  const data = await depreciationService.getRecords({ assetId, financialYear, page: parseInt(page), size: parseInt(size) });
  res.status(200).json(ApiResponse.success(data));
});

router.post('/asset/:id', authenticate, async (req, res) => {
  const data = await depreciationService.calculateForAsset(req.params.id, req.user.id);
  res.status(200).json(ApiResponse.success(data, 'Depreciation calculated'));
});

router.post('/bulk', authenticate, requireAdmin, async (req, res) => {
  const result = await depreciationService.bulkCalculate(req.user.id);
  res.status(200).json(ApiResponse.success(result, 'Bulk depreciation calculation completed'));
});

module.exports = router;
