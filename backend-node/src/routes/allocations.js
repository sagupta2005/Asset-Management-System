const express = require('express');
const router = express.Router();
const allocationService = require('../services/allocationService');
const { authenticate } = require('../middleware/auth');
const { ApiResponse } = require('../utils/apiResponse');

/**
 * Allocation Routes.
 * Matches frontend allocationApi endpoints exactly.
 */

// GET /api/allocations — list allocations with optional filters
router.get('/', authenticate, async (req, res) => {
  const { status, page = 0, size = 10 } = req.query;
  const data = await allocationService.getAllocations({
    status, page: parseInt(page), size: parseInt(size),
  });
  res.status(200).json(ApiResponse.success(data));
});

// GET /api/allocations/:id — get single allocation
router.get('/:id', authenticate, async (req, res) => {
  const data = await allocationService.getAllocation(req.params.id);
  res.status(200).json(ApiResponse.success(data));
});

// POST /api/allocations/assign — assign asset to employee
router.post('/assign', authenticate, async (req, res) => {
  const data = await allocationService.assignAsset(req.body, req.user.id);
  res.status(201).json(ApiResponse.created(data, 'Asset assigned successfully'));
});

// POST /api/allocations/:id/return — return asset (frontend uses POST)
router.post('/:id/return', authenticate, async (req, res) => {
  const data = await allocationService.returnAsset(req.params.id, req.body.notes, req.user.id);
  res.status(200).json(ApiResponse.success(data, 'Asset returned successfully'));
});

// PUT /api/allocations/:id/return — also support PUT for backward compatibility
router.put('/:id/return', authenticate, async (req, res) => {
  const data = await allocationService.returnAsset(req.params.id, req.body.notes, req.user.id);
  res.status(200).json(ApiResponse.success(data, 'Asset returned successfully'));
});

// POST /api/allocations/:id/transfer — transfer to another employee
router.post('/:id/transfer', authenticate, async (req, res) => {
  const data = await allocationService.transferAsset(req.params.id, req.body, req.user.id);
  res.status(201).json(ApiResponse.created(data, 'Asset transferred successfully'));
});

// GET /api/allocations/asset/:assetId — get allocations by asset
router.get('/asset/:assetId', authenticate, async (req, res) => {
  const { page = 0, size = 10 } = req.query;
  const data = await allocationService.getAssetAllocations(
    req.params.assetId, parseInt(page), parseInt(size)
  );
  res.status(200).json(ApiResponse.success(data));
});

// GET /api/allocations/employee/:employeeId — get allocations by employee
router.get('/employee/:employeeId', authenticate, async (req, res) => {
  const { page = 0, size = 10 } = req.query;
  const data = await allocationService.getByEmployee(
    req.params.employeeId, parseInt(page), parseInt(size)
  );
  res.status(200).json(ApiResponse.success(data));
});

module.exports = router;
