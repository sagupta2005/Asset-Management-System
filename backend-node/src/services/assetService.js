const { Op } = require('sequelize');
const {
  Asset, AssetCategory, Vendor, Department, Employee, User,
  AssetMovement, AssetHealthScore,
} = require('../models');
const { generateAssetTag } = require('../utils/assetTagGenerator');
const { generateQrCode } = require('../utils/qrCodeGenerator');
const { calculate: calcDepreciation } = require('../utils/depreciationCalculator');
const { PagedResponse } = require('../utils/apiResponse');
const {
  ResourceNotFoundError,
  BadRequestError,
  BusinessError,
} = require('../middleware/errorHandler');
const auditLogService = require('./auditLogService');
const logger = require('../utils/logger');

/**
 * Asset Service.
 * Full CRUD, search, QR generation, depreciation, movement history.
 */

// ─── Create Asset ───────────────────────────────────────────────────────────

async function createAsset(data, currentUserId) {
  if (data.serialNumber) {
    const exists = await Asset.findOne({ where: { serialNumber: data.serialNumber } });
    if (exists) throw new BadRequestError(`Serial number already exists: ${data.serialNumber}`);
  }

  const category = await AssetCategory.findByPk(data.categoryId);
  if (!category) throw new ResourceNotFoundError('Category', 'id', data.categoryId);

  // Calculate depreciation
  let currentValue = null;
  if (data.purchaseCost && data.purchaseDate) {
    const dep = calcDepreciation(
      data.purchaseCost,
      category.usefulLife || 5,
      data.purchaseDate
    );
    currentValue = dep.currentValue;
  }

  // Count for sequential tag
  const count = await Asset.count();
  const assetTag = generateAssetTag(count + 1);

  const asset = await Asset.create({
    assetTag,
    name: data.name,
    categoryId: data.categoryId,
    brand: data.brand || null,
    model: data.model || null,
    serialNumber: data.serialNumber || null,
    purchaseDate: data.purchaseDate || null,
    purchaseCost: data.purchaseCost || null,
    currentValue,
    vendorId: data.vendorId || null,
    departmentId: data.departmentId || null,
    assignedToId: data.assignedToEmployeeId || null,
    currentLocation: data.currentLocation || null,
    warrantyExpiry: data.warrantyExpiry || null,
    status: data.status || 'AVAILABLE',
    description: data.description || null,
    specifications: data.specifications || null,
    isActive: true,
    createdById: currentUserId,
  });

  // Generate QR code
  try {
    const qrUrl = await generateQrCode(assetTag);
    asset.qrCodeUrl = qrUrl;
    await asset.save();
  } catch (err) {
    logger.warn(`QR generation failed for ${assetTag}: ${err.message}`);
  }

  await auditLogService.log('CREATE', 'ASSET', asset.id, null,
    { assetTag: asset.assetTag, name: asset.name }, 'Asset created', currentUserId);

  logger.info(`Asset created: ${assetTag} (${data.name})`);
  return toResponse(await findById(asset.id));
}

// ─── Update Asset ───────────────────────────────────────────────────────────

async function updateAsset(id, data, currentUserId) {
  const asset = await findById(id);
  const oldValues = { status: asset.status, name: asset.name };

  const category = await AssetCategory.findByPk(data.categoryId);
  if (!category) throw new ResourceNotFoundError('Category', 'id', data.categoryId);

  // Recalculate depreciation
  let currentValue = asset.currentValue;
  if (data.purchaseCost && data.purchaseDate) {
    const dep = calcDepreciation(
      data.purchaseCost,
      category.usefulLife || 5,
      data.purchaseDate
    );
    currentValue = dep.currentValue;
  }

  await asset.update({
    name: data.name,
    categoryId: data.categoryId,
    brand: data.brand,
    model: data.model,
    serialNumber: data.serialNumber,
    purchaseDate: data.purchaseDate,
    purchaseCost: data.purchaseCost,
    currentValue,
    currentLocation: data.currentLocation,
    warrantyExpiry: data.warrantyExpiry,
    description: data.description,
    specifications: data.specifications,
    vendorId: data.vendorId || asset.vendorId,
    departmentId: data.departmentId || asset.departmentId,
  });

  await auditLogService.log('UPDATE', 'ASSET', id, oldValues,
    { status: asset.status, name: asset.name }, 'Asset updated', currentUserId);

  return toResponse(await findById(id));
}

// ─── Delete Asset ───────────────────────────────────────────────────────────

async function deleteAsset(id, currentUserId) {
  const asset = await findById(id);
  if (asset.status === 'ASSIGNED') {
    throw new BusinessError('Cannot delete an asset that is currently assigned. Return it first.');
  }

  await asset.update({
    isActive: false,
    status: 'DISPOSED',
    disposedAt: new Date(),
  });

  await auditLogService.log('DELETE', 'ASSET', id, null, null,
    `Asset soft-deleted: ${asset.assetTag}`, currentUserId);
}

// ─── Get Asset ──────────────────────────────────────────────────────────────

async function getAsset(id) {
  return toResponse(await findById(id));
}

async function getAssetByTag(assetTag) {
  const asset = await Asset.findOne({
    where: { assetTag, isActive: true },
    include: getIncludes(),
  });
  if (!asset) throw new ResourceNotFoundError('Asset', 'tag', assetTag);
  return toResponse(asset);
}

// ─── List & Search ──────────────────────────────────────────────────────────

async function getAssets({ search, status, categoryId, departmentId, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' } = {}) {
  const where = { isActive: true };

  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (departmentId) where.departmentId = departmentId;

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { assetTag: { [Op.like]: `%${search}%` } },
      { brand: { [Op.like]: `%${search}%` } },
      { model: { [Op.like]: `%${search}%` } },
      { serialNumber: { [Op.like]: `%${search}%` } },
    ];
  }

  const allowedSort = ['createdAt', 'name', 'assetTag', 'status', 'purchaseCost', 'currentValue'];
  const orderField = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
  const orderDir = sortDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const { count, rows } = await Asset.findAndCountAll({
    where,
    include: getIncludes(),
    limit: size,
    offset: page * size,
    order: [[orderField, orderDir]],
    distinct: true,
  });

  return PagedResponse.from(rows.map(toResponse), count, page, size);
}

// ─── Movement History ───────────────────────────────────────────────────────

async function getMovementHistory(assetId, page = 0, size = 20) {
  await findById(assetId); // validate exists

  const { count, rows } = await AssetMovement.findAndCountAll({
    where: { assetId },
    include: [{ model: User, as: 'movedBy', attributes: ['id', 'firstName', 'lastName'] }],
    order: [['movementDate', 'DESC']],
    limit: size,
    offset: page * size,
  });

  return PagedResponse.from(rows, count, page, size);
}

// ─── Record Movement ────────────────────────────────────────────────────────

async function recordMovement(assetId, type, options = {}, movedById) {
  const { fromLocation, toLocation, fromDept, toDept, fromEmployee, toEmployee, reason } = options;
  await AssetMovement.create({
    assetId,
    movementType: type,
    fromLocation: fromLocation || null,
    toLocation: toLocation || null,
    fromDepartment: fromDept || null,
    toDepartment: toDept || null,
    fromEmployee: fromEmployee || null,
    toEmployee: toEmployee || null,
    movedById: movedById || null,
    reason: reason || null,
    movementDate: new Date(),
  });
}

// ─── Status Counts ──────────────────────────────────────────────────────────

async function getStatusCounts() {
  const [total, available, assigned, underRepair, disposed] = await Promise.all([
    Asset.count({ where: { isActive: true } }),
    Asset.count({ where: { isActive: true, status: 'AVAILABLE' } }),
    Asset.count({ where: { isActive: true, status: 'ASSIGNED' } }),
    Asset.count({ where: { isActive: true, status: 'UNDER_REPAIR' } }),
    Asset.count({ where: { isActive: true, status: 'DISPOSED' } }),
  ]);
  return { total, available, assigned, underRepair, disposed };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function findById(id) {
  const asset = await Asset.findOne({
    where: { id, isActive: true },
    include: getIncludes(),
  });
  if (!asset) throw new ResourceNotFoundError('Asset', 'id', id);
  return asset;
}

function getIncludes() {
  return [
    { model: AssetCategory, as: 'category', attributes: ['id', 'name', 'usefulLife'] },
    { model: Vendor, as: 'vendor', attributes: ['id', 'name'], required: false },
    { model: Department, as: 'department', attributes: ['id', 'name'], required: false },
    { model: Employee, as: 'assignedTo', attributes: ['id', 'firstName', 'lastName'], required: false },
    { model: User, as: 'createdBy', attributes: ['id', 'firstName', 'lastName'], required: false },
    { model: AssetHealthScore, as: 'healthScore', required: false },
  ];
}

function toResponse(asset) {
  const a = asset.toJSON ? asset.toJSON() : asset;
  return {
    id: a.id,
    assetTag: a.assetTag,
    name: a.name,
    brand: a.brand,
    model: a.model,
    serialNumber: a.serialNumber,
    purchaseDate: a.purchaseDate,
    purchaseCost: a.purchaseCost ? parseFloat(a.purchaseCost) : null,
    currentValue: a.currentValue ? parseFloat(a.currentValue) : null,
    currentLocation: a.currentLocation,
    warrantyExpiry: a.warrantyExpiry,
    status: a.status,
    qrCodeUrl: a.qrCodeUrl,
    imageUrl: a.imageUrl,
    description: a.description,
    specifications: a.specifications,
    isActive: a.isActive,
    categoryId: a.category?.id || a.categoryId,
    categoryName: a.category?.name || null,
    vendorId: a.vendor?.id || a.vendorId,
    vendorName: a.vendor?.name || null,
    departmentId: a.department?.id || a.departmentId,
    departmentName: a.department?.name || null,
    assignedToId: a.assignedTo?.id || a.assignedToId,
    assignedToName: a.assignedTo
      ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}` : null,
    healthScore: a.healthScore?.healthScore ? parseFloat(a.healthScore.healthScore) : null,
    healthLevel: a.healthScore?.healthLevel || null,
    riskLevel: a.healthScore?.riskLevel || null,
    createdByName: a.createdBy
      ? `${a.createdBy.firstName} ${a.createdBy.lastName}` : null,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

module.exports = {
  createAsset,
  updateAsset,
  deleteAsset,
  getAsset,
  getAssetByTag,
  getAssets,
  getMovementHistory,
  recordMovement,
  getStatusCounts,
  findById,
  toResponse,
};
