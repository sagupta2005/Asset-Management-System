const express = require('express');
const router = express.Router();
const { Department } = require('../models');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { ApiResponse } = require('../utils/apiResponse');
const { ResourceNotFoundError } = require('../middleware/errorHandler');
const auditLogService = require('../services/auditLogService');
const { generateDepartmentCode } = require('../utils/assetTagGenerator');

router.get('/', authenticate, async (req, res) => {
  const departments = await Department.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
  res.status(200).json(ApiResponse.success(departments));
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const dept = await Department.create({ ...req.body, isActive: true });
  dept.code = generateDepartmentCode(dept.id);
  await dept.save();
  await auditLogService.log('CREATE', 'DEPARTMENT', dept.id, null, { name: dept.name }, 'Department created', req.user.id);
  res.status(201).json(ApiResponse.created(dept, 'Department created'));
});

router.get('/:id', authenticate, async (req, res) => {
  const dept = await Department.findByPk(req.params.id);
  if (!dept) throw new ResourceNotFoundError('Department', 'id', req.params.id);
  res.status(200).json(ApiResponse.success(dept));
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const dept = await Department.findByPk(req.params.id);
  if (!dept) throw new ResourceNotFoundError('Department', 'id', req.params.id);
  await dept.update(req.body);
  res.status(200).json(ApiResponse.success(dept, 'Department updated'));
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const dept = await Department.findByPk(req.params.id);
  if (!dept) throw new ResourceNotFoundError('Department', 'id', req.params.id);
  await dept.update({ isActive: false });
  res.status(200).json(ApiResponse.noContent('Department deactivated'));
});

module.exports = router;
