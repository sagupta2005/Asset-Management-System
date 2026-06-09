const express = require('express');
const router = express.Router();
const auditLogService = require('../services/auditLogService');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { ApiResponse } = require('../utils/apiResponse');

router.get('/', authenticate, requireAdmin, async (req, res) => {
  const { page = 0, size = 20, entityType, action } = req.query;
  const data = await auditLogService.getAll({ page: parseInt(page), size: parseInt(size), entityType, action });
  res.status(200).json(ApiResponse.success(data));
});

module.exports = router;
