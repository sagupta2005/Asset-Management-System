const express = require('express');
const router = express.Router();
const maintenanceService = require('../services/maintenanceService');
const { authenticate } = require('../middleware/auth');
const { ApiResponse } = require('../utils/apiResponse');

/**
 * Maintenance Routes.
 * Matches frontend maintenanceApi endpoints exactly.
 */

// GET /api/maintenance — list all with optional filters
router.get('/', authenticate, async (req, res) => {
  const { status, assetId, page = 0, size = 10 } = req.query;
  const data = await maintenanceService.getRequests({
    status, assetId, page: parseInt(page), size: parseInt(size),
  });
  res.status(200).json(ApiResponse.success(data));
});

// POST /api/maintenance — create new request
router.post('/', authenticate, async (req, res) => {
  const data = await maintenanceService.createRequest(req.body, req.user.id);
  res.status(201).json(ApiResponse.created(data, 'Maintenance request created'));
});

// GET /api/maintenance/:id — get single request
router.get('/:id', authenticate, async (req, res) => {
  const data = await maintenanceService.getRequest(req.params.id);
  res.status(200).json(ApiResponse.success(data));
});

// PUT /api/maintenance/:id — update request fields
router.put('/:id', authenticate, async (req, res) => {
  const data = await maintenanceService.updateStatus(req.params.id, req.body.status, req.user.id);
  res.status(200).json(ApiResponse.success(data, 'Maintenance request updated'));
});

// PATCH /api/maintenance/:id/status — update status only (frontend: updateStatus)
router.patch('/:id/status', authenticate, async (req, res) => {
  const data = await maintenanceService.updateStatus(req.params.id, req.body.status, req.user.id);
  res.status(200).json(ApiResponse.success(data, 'Status updated'));
});

// POST /api/maintenance/:id/complete — mark as completed (frontend: complete)
router.post('/:id/complete', authenticate, async (req, res) => {
  const { resolutionNotes, actualCost } = req.body;
  const data = await maintenanceService.completeRequest(
    req.params.id, resolutionNotes, actualCost, req.user.id
  );
  res.status(200).json(ApiResponse.success(data, 'Maintenance request completed'));
});

// PUT /api/maintenance/:id/assign — assign technician
router.put('/:id/assign', authenticate, async (req, res) => {
  const data = await maintenanceService.assignTechnician(
    req.params.id, req.body.technicianId, req.user.id
  );
  res.status(200).json(ApiResponse.success(data, 'Technician assigned'));
});

// GET /api/maintenance/asset/:assetId — get requests by asset (frontend: getByAsset)
router.get('/asset/:assetId', authenticate, async (req, res) => {
  const { page = 0, size = 10 } = req.query;
  const data = await maintenanceService.getRequests({
    assetId: req.params.assetId,
    page: parseInt(page),
    size: parseInt(size),
  });
  res.status(200).json(ApiResponse.success(data));
});

module.exports = router;
