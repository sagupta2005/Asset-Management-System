const express = require('express');
const router = express.Router();
const vendorService = require('../services/vendorService');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { ApiResponse } = require('../utils/apiResponse');

/**
 * Vendor Routes.
 */

router.get('/', authenticate, async (req, res) => {
  const { search, page = 0, size = 10 } = req.query;
  const data = await vendorService.getVendors({ search, page: parseInt(page), size: parseInt(size) });
  res.status(200).json(ApiResponse.success(data));
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const data = await vendorService.createVendor(req.body, req.user.id);
  res.status(201).json(ApiResponse.created(data, 'Vendor created'));
});

router.get('/:id', authenticate, async (req, res) => {
  const data = await vendorService.getVendor(req.params.id);
  res.status(200).json(ApiResponse.success(data));
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const data = await vendorService.updateVendor(req.params.id, req.body, req.user.id);
  res.status(200).json(ApiResponse.success(data, 'Vendor updated'));
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await vendorService.deleteVendor(req.params.id, req.user.id);
  res.status(200).json(ApiResponse.noContent('Vendor deactivated'));
});

// POST /api/vendors/:id/ratings — add a rating (frontend: addRating)
// Also supports POST /api/vendors/:id/rate for compatibility
router.post('/:id/ratings', authenticate, async (req, res) => {
  const data = await vendorService.rateVendor(req.params.id, req.body, req.user.id);
  res.status(200).json(ApiResponse.success(data, 'Vendor rated successfully'));
});

router.post('/:id/rate', authenticate, async (req, res) => {
  const data = await vendorService.rateVendor(req.params.id, req.body, req.user.id);
  res.status(200).json(ApiResponse.success(data, 'Vendor rated successfully'));
});

module.exports = router;
