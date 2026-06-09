const express = require('express');
const router = express.Router();
const employeeService = require('../services/employeeService');
const allocationService = require('../services/allocationService');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { ApiResponse } = require('../utils/apiResponse');

/**
 * Employee Routes.
 */

// GET /api/employees — list all employees with optional filters
router.get('/', authenticate, async (req, res) => {
  const { search, departmentId, page = 0, size = 10 } = req.query;
  const data = await employeeService.getEmployees({
    search, departmentId, page: parseInt(page), size: parseInt(size),
  });
  res.status(200).json(ApiResponse.success(data));
});

// POST /api/employees — create employee (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const data = await employeeService.createEmployee(req.body, req.user.id);
  res.status(201).json(ApiResponse.created(data, 'Employee created'));
});

// GET /api/employees/:id — get one employee
router.get('/:id', authenticate, async (req, res) => {
  const data = await employeeService.getEmployee(req.params.id);
  res.status(200).json(ApiResponse.success(data));
});

// PUT /api/employees/:id — update employee (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const data = await employeeService.updateEmployee(req.params.id, req.body, req.user.id);
  res.status(200).json(ApiResponse.success(data, 'Employee updated'));
});

// DELETE /api/employees/:id — deactivate employee (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await employeeService.deleteEmployee(req.params.id, req.user.id);
  res.status(200).json(ApiResponse.noContent('Employee deactivated'));
});

// GET /api/employees/:id/allocations — get allocation history for employee
// Mirrors frontend: employeeApi.getAllocations(id, params)
router.get('/:id/allocations', authenticate, async (req, res) => {
  const { page = 0, size = 20 } = req.query;
  const data = await allocationService.getByEmployee(
    req.params.id, parseInt(page), parseInt(size)
  );
  res.status(200).json(ApiResponse.success(data));
});

module.exports = router;
