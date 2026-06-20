const express = require('express');
const router = express.Router();
const assetService = require('../services/assetService');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { ApiResponse } = require('../utils/apiResponse');

router.get('/', authenticate, async (req, res) => {
  const { search, status, categoryId, departmentId, page = 0, size = 10, sortBy, sortDir } = req.query;
  const data = await assetService.getAssets({ search, status, categoryId, departmentId, page: parseInt(page), size: parseInt(size), sortBy, sortDir });
  res.status(200).json(ApiResponse.success(data));
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const data = await assetService.createAsset(req.body, req.user.id);
  res.status(201).json(ApiResponse.created(data, 'Asset created successfully'));
});

router.get('/stats', authenticate, async (req, res) => {
  const data = await assetService.getStatusCounts();
  res.status(200).json(ApiResponse.success(data));
});

router.get('/public/passport/:assetTag', async (req, res) => {
  const { assetTag } = req.params;
  const asset = await assetService.getAssetByTag(assetTag);

  const { AssetAllocation, MaintenanceRequest, WarrantyTracking, DepreciationRecord, Employee } = require('../models');

  const [allocations, maintenance, warranty, depreciation] = await Promise.all([
    AssetAllocation.findAll({
      where: { assetId: asset.id },
      include: [{ model: Employee, as: 'employee', attributes: ['firstName', 'lastName'] }],
      order: [['allocatedDate', 'DESC']],
      limit: 10
    }),
    MaintenanceRequest.findAll({
      where: { assetId: asset.id },
      order: [['startDate', 'DESC']],
      limit: 10
    }),
    WarrantyTracking.findOne({
      where: { assetId: asset.id }
    }),
    DepreciationRecord.findAll({
      where: { assetId: asset.id },
      order: [['financialYear', 'DESC']],
      limit: 10
    })
  ]);

  res.status(200).json(ApiResponse.success({
    asset,
    allocations,
    maintenance,
    warranty,
    depreciation
  }));
});

router.get('/tag/:assetTag', authenticate, async (req, res) => {
  const data = await assetService.getAssetByTag(req.params.assetTag);
  res.status(200).json(ApiResponse.success(data));
});

router.get('/:id', authenticate, async (req, res) => {
  const data = await assetService.getAsset(req.params.id);
  res.status(200).json(ApiResponse.success(data));
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const data = await assetService.updateAsset(req.params.id, req.body, req.user.id);
  res.status(200).json(ApiResponse.success(data, 'Asset updated successfully'));
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await assetService.deleteAsset(req.params.id, req.user.id);
  res.status(200).json(ApiResponse.noContent('Asset deleted successfully'));
});

router.get('/:id/movements', authenticate, async (req, res) => {
  const { page = 0, size = 20 } = req.query;
  const data = await assetService.getMovementHistory(req.params.id, parseInt(page), parseInt(size));
  res.status(200).json(ApiResponse.success(data));
});

module.exports = router;
