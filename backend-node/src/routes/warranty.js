const express = require('express');
const router = express.Router();
const warrantyService = require('../services/warrantyService');
const { authenticate } = require('../middleware/auth');
const { ApiResponse } = require('../utils/apiResponse');

router.get('/', authenticate, async (req, res) => {
  const { page = 0, size = 10 } = req.query;
  const data = await warrantyService.getAll(parseInt(page), parseInt(size));
  res.status(200).json(ApiResponse.success(data));
});

router.get('/expiring', authenticate, async (req, res) => {
  const { days = 30, page = 0, size = 10 } = req.query;
  const data = await warrantyService.getExpiring(parseInt(days), parseInt(page), parseInt(size));
  res.status(200).json(ApiResponse.success(data));
});

router.get('/asset/:assetId', authenticate, async (req, res) => {
  const data = await warrantyService.getForAsset(req.params.assetId);
  res.status(200).json(ApiResponse.success(data));
});

router.put('/asset/:assetId', authenticate, async (req, res) => {
  const data = await warrantyService.createOrUpdate(req.params.assetId, req.body);
  res.status(200).json(ApiResponse.success(data, 'Warranty updated'));
});

module.exports = router;
