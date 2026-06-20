const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Role, Department } = require('../models');
const { authenticate } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/rbac');
const { ApiResponse } = require('../utils/apiResponse');

// List all users with pagination and search
router.get('/', authenticate, requireSuperAdmin, async (req, res) => {
  const { search = '', page = 0, size = 10 } = req.query;
  const pageNum = parseInt(page);
  const sizeNum = parseInt(size);

  const whereClause = search
    ? {
        [Op.or]: [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ]
      }
    : {};

  const { count, rows } = await User.findAndCountAll({
    where: whereClause,
    limit: sizeNum,
    offset: pageNum * sizeNum,
    include: [
      { model: Role, through: { attributes: [] } },
      { model: Department, as: 'department' }
    ],
    distinct: true, // ensures correct count with joins
    order: [['createdAt', 'DESC']]
  });

  const content = rows.map(u => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    avatarUrl: u.avatarUrl,
    isActive: u.isActive,
    isEmailVerified: u.isEmailVerified,
    lastLogin: u.lastLogin,
    department: u.department ? { id: u.department.id, name: u.department.name } : null,
    roles: u.Roles ? u.Roles.map(r => r.name) : [],
    createdAt: u.createdAt
  }));

  res.status(200).json(ApiResponse.success({
    content,
    totalPages: Math.ceil(count / sizeNum),
    totalElements: count,
    number: pageNum,
    size: sizeNum
  }));
});

// Create a new user
router.post('/', authenticate, requireSuperAdmin, async (req, res) => {
  const { firstName, lastName, email, password, phone, departmentId, roles } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json(ApiResponse.error(400, 'Missing required fields'));
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(400).json(ApiResponse.error(400, `Email already registered: ${email}`));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phone,
    departmentId: departmentId || null,
    isActive: true,
    isEmailVerified: true // auto verify when created by admin
  });

  // Assign roles
  if (roles && roles.length > 0) {
    for (const roleName of roles) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (role) {
        await user.addRole(role);
      }
    }
  } else {
    // Default role
    const defaultRole = await Role.findOne({ where: { name: 'ROLE_EMPLOYEE' } });
    if (defaultRole) {
      await user.addRole(defaultRole);
    }
  }

  const reloaded = await User.findByPk(user.id, {
    include: [
      { model: Role, through: { attributes: [] } },
      { model: Department, as: 'department' }
    ]
  });

  res.status(201).json(ApiResponse.created({
    id: reloaded.id,
    firstName: reloaded.firstName,
    lastName: reloaded.lastName,
    email: reloaded.email,
    phone: reloaded.phone,
    isActive: reloaded.isActive,
    department: reloaded.department ? { id: reloaded.department.id, name: reloaded.department.name } : null,
    roles: reloaded.Roles ? reloaded.Roles.map(r => r.name) : []
  }, 'User created successfully'));
});

// Update a user
router.put('/:id', authenticate, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, password, phone, departmentId, roles, isActive } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json(ApiResponse.error(404, 'User not found'));
  }

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (departmentId !== undefined) user.departmentId = departmentId || null;
  if (isActive !== undefined) user.isActive = Boolean(isActive);

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  await user.save();

  // Update roles if provided
  if (roles) {
    // Remove all current roles
    await user.setRoles([]);
    for (const roleName of roles) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (role) {
        await user.addRole(role);
      }
    }
  }

  const reloaded = await User.findByPk(user.id, {
    include: [
      { model: Role, through: { attributes: [] } },
      { model: Department, as: 'department' }
    ]
  });

  res.status(200).json(ApiResponse.success({
    id: reloaded.id,
    firstName: reloaded.firstName,
    lastName: reloaded.lastName,
    email: reloaded.email,
    phone: reloaded.phone,
    isActive: reloaded.isActive,
    department: reloaded.department ? { id: reloaded.department.id, name: reloaded.department.name } : null,
    roles: reloaded.Roles ? reloaded.Roles.map(r => r.name) : []
  }, 'User updated successfully'));
});

// Delete a user (Deactivate)
router.delete('/:id', authenticate, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json(ApiResponse.error(404, 'User not found'));
  }

  // Deactivate instead of hard delete
  user.isActive = false;
  await user.save();

  res.status(200).json(ApiResponse.success(null, 'User deactivated successfully'));
});

module.exports = router;
