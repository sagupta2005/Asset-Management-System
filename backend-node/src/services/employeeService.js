const { Op } = require('sequelize');
const { Employee, Department, User, Asset } = require('../models');
const { ResourceNotFoundError, BadRequestError } = require('../middleware/errorHandler');
const { generateEmployeeCode } = require('../utils/assetTagGenerator');
const { PagedResponse } = require('../utils/apiResponse');
const auditLogService = require('./auditLogService');

async function createEmployee(data, currentUserId) {
  const existing = await Employee.findOne({ where: { email: data.email } });
  if (existing) throw new BadRequestError(`Employee email already exists: ${data.email}`);

  let department = null;
  if (data.departmentId) {
    department = await Department.findByPk(data.departmentId);
    if (!department) throw new ResourceNotFoundError('Department', 'id', data.departmentId);
  }

  let user = null;
  if (data.userId) {
    user = await User.findByPk(data.userId);
    if (!user) throw new ResourceNotFoundError('User', 'id', data.userId);
  }

  const employee = await Employee.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone || null,
    departmentId: department?.id || null,
    designation: data.designation || null,
    joinDate: data.joinDate || null,
    isActive: data.isActive !== undefined ? data.isActive : true,
    userId: user?.id || null,
  });

  employee.employeeCode = generateEmployeeCode(employee.id);
  await employee.save();

  await auditLogService.log('CREATE', 'EMPLOYEE', employee.id, null,
    { email: employee.email }, 'Employee created', currentUserId);

  return toResponse(await findById(employee.id));
}

async function updateEmployee(id, data, currentUserId) {
  const employee = await findById(id);

  if (employee.email !== data.email) {
    const existing = await Employee.findOne({ where: { email: data.email } });
    if (existing) throw new BadRequestError(`Email already in use: ${data.email}`);
  }

  let department = null;
  if (data.departmentId) {
    department = await Department.findByPk(data.departmentId);
    if (!department) throw new ResourceNotFoundError('Department', 'id', data.departmentId);
  }

  await employee.update({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    departmentId: department?.id || employee.departmentId,
    designation: data.designation,
    joinDate: data.joinDate,
    isActive: data.isActive !== undefined ? data.isActive : employee.isActive,
  });

  await auditLogService.log('UPDATE', 'EMPLOYEE', id, null,
    { email: employee.email }, 'Employee updated', currentUserId);

  return toResponse(await findById(id));
}

async function deleteEmployee(id, currentUserId) {
  const employee = await findById(id);
  const assignedCount = await Asset.count({ where: { assignedToId: id } });
  if (assignedCount > 0) {
    throw new BadRequestError(`Employee has ${assignedCount} assigned assets. Return them first.`);
  }
  await employee.update({ isActive: false });
  await auditLogService.log('DELETE', 'EMPLOYEE', id, null, null, 'Employee deactivated', currentUserId);
}

async function getEmployee(id) {
  return toResponse(await findById(id));
}

async function getEmployees({ search, departmentId, page = 0, size = 10 } = {}) {
  const where = { isActive: true };

  if (departmentId) where.departmentId = departmentId;

  if (search) {
    where[Op.or] = [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { employeeCode: { [Op.like]: `%${search}%` } },
      { designation: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Employee.findAndCountAll({
    where,
    include: [{ model: Department, as: 'department', attributes: ['id', 'name'], required: false }],
    order: [['firstName', 'ASC']],
    limit: size,
    offset: page * size,
    distinct: true,
  });

  const responses = await Promise.all(rows.map(toResponse));
  return PagedResponse.from(responses, count, page, size);
}

async function findById(id) {
  const employee = await Employee.findByPk(id, {
    include: [{ model: Department, as: 'department', attributes: ['id', 'name'], required: false }],
  });
  if (!employee) throw new ResourceNotFoundError('Employee', 'id', id);
  return employee;
}

async function toResponse(e) {
  const obj = e.toJSON ? e.toJSON() : e;
  const assetCount = await Asset.count({ where: { assignedToId: obj.id } });
  return {
    id: obj.id,
    employeeCode: obj.employeeCode,
    userId: obj.userId,
    firstName: obj.firstName,
    lastName: obj.lastName,
    fullName: `${obj.firstName} ${obj.lastName}`,
    email: obj.email,
    phone: obj.phone,
    departmentId: obj.department?.id || obj.departmentId,
    departmentName: obj.department?.name || null,
    designation: obj.designation,
    joinDate: obj.joinDate,
    isActive: obj.isActive,
    avatarUrl: obj.avatarUrl,
    assignedAssetCount: assetCount,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

module.exports = { createEmployee, updateEmployee, deleteEmployee, getEmployee, getEmployees };
