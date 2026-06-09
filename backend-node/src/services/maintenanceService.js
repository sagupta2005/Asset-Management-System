const {
  MaintenanceRequest, Asset, User, AssetMovement,
} = require('../models');
const {
  ResourceNotFoundError, BusinessError,
} = require('../middleware/errorHandler');
const notificationService = require('./notificationService');
const auditLogService = require('./auditLogService');
const { generateMaintenanceNumber } = require('../utils/assetTagGenerator');
const { PagedResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Maintenance Service.
 */

async function createRequest(data, currentUserId) {
  const asset = await Asset.findByPk(data.assetId);
  if (!asset) throw new ResourceNotFoundError('Asset', 'id', data.assetId);

  const prevStatus = asset.status;
  await asset.update({ status: 'UNDER_REPAIR' });

  // Record movement
  await AssetMovement.create({
    assetId: asset.id,
    movementType: 'REPAIR_CENTER',
    reason: 'Sent to repair center',
    movedById: currentUserId,
    movementDate: new Date(),
  });

  const count = await MaintenanceRequest.count();
  const request = await MaintenanceRequest.create({
    requestNumber: generateMaintenanceNumber(count + 1),
    assetId: asset.id,
    requestedById: currentUserId,
    assignedToId: data.assignedToUserId || null,
    issueType: data.issueType || null,
    priority: data.priority || 'MEDIUM',
    status: 'OPEN',
    title: data.title,
    description: data.description || null,
    estimatedCost: data.estimatedCost || null,
  });

  await auditLogService.log('CREATE', 'MAINTENANCE', request.id, null,
    { requestNumber: request.requestNumber }, 'Maintenance request created', currentUserId);

  return toResponse(await findById(request.id));
}

async function assignTechnician(requestId, technicianId, currentUserId) {
  const request = await findById(requestId);
  const technician = await User.findByPk(technicianId);
  if (!technician) throw new ResourceNotFoundError('User', 'id', technicianId);

  await request.update({
    assignedToId: technicianId,
    status: 'IN_PROGRESS',
    startedAt: new Date(),
  });

  await notificationService.createNotification(
    technicianId, 'MAINTENANCE_ASSIGNED',
    `Maintenance Assigned: ${request.requestNumber}`,
    `You have been assigned maintenance request: ${request.title}`,
    'MAINTENANCE', requestId, true
  );

  return toResponse(await findById(requestId));
}

async function completeRequest(requestId, resolutionNotes, actualCost, currentUserId) {
  const request = await findById(requestId);
  if (request.status === 'COMPLETED') {
    throw new BusinessError('Maintenance request is already completed.');
  }

  const now = new Date();
  let downtimeHours = null;
  if (request.startedAt) {
    downtimeHours = (now - new Date(request.startedAt)) / (1000 * 60 * 60);
  }

  await request.update({
    status: 'COMPLETED',
    completedAt: now,
    resolutionNotes: resolutionNotes || null,
    actualCost: actualCost || request.actualCost,
    downtimeHours: downtimeHours ? parseFloat(downtimeHours.toFixed(2)) : null,
  });

  const asset = await Asset.findByPk(request.assetId);
  if (asset) {
    await asset.update({ status: 'AVAILABLE' });
    await AssetMovement.create({
      assetId: asset.id,
      movementType: 'REPAIR_CENTER',
      reason: 'Returned from repair center',
      movedById: currentUserId,
      movementDate: now,
    });
  }

  if (request.requestedById) {
    await notificationService.createNotification(
      request.requestedById, 'MAINTENANCE_COMPLETE',
      `Maintenance Completed: ${request.requestNumber}`,
      `The maintenance request for ${asset?.name} has been completed.`,
      'MAINTENANCE', requestId, true
    );
  }

  await auditLogService.log('COMPLETE', 'MAINTENANCE', requestId, null,
    { status: 'COMPLETED' }, 'Maintenance completed', currentUserId);

  return toResponse(await findById(requestId));
}

async function updateStatus(requestId, status, currentUserId) {
  const request = await findById(requestId);
  await request.update({ status });
  return toResponse(await findById(requestId));
}

async function getRequests({ status, assetId, page = 0, size = 10 } = {}) {
  const where = {};
  if (status) where.status = status;
  if (assetId) where.assetId = assetId;

  const { count, rows } = await MaintenanceRequest.findAndCountAll({
    where,
    include: getIncludes(),
    order: [['createdAt', 'DESC']],
    limit: size,
    offset: page * size,
    distinct: true,
  });

  return PagedResponse.from(rows.map(toResponse), count, page, size);
}

async function getRequest(id) {
  return toResponse(await findById(id));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function findById(id) {
  const request = await MaintenanceRequest.findByPk(id, { include: getIncludes() });
  if (!request) throw new ResourceNotFoundError('Maintenance Request', 'id', id);
  return request;
}

function getIncludes() {
  return [
    { model: Asset, as: 'asset', attributes: ['id', 'assetTag', 'name'] },
    { model: User, as: 'requestedBy', attributes: ['id', 'firstName', 'lastName'], required: false },
    { model: User, as: 'assignedTo', attributes: ['id', 'firstName', 'lastName'], required: false },
  ];
}

function toResponse(r) {
  const obj = r.toJSON ? r.toJSON() : r;
  return {
    id: obj.id,
    requestNumber: obj.requestNumber,
    assetId: obj.asset?.id || obj.assetId,
    assetTag: obj.asset?.assetTag,
    assetName: obj.asset?.name,
    requestedById: obj.requestedBy?.id || obj.requestedById,
    requestedByName: obj.requestedBy
      ? `${obj.requestedBy.firstName} ${obj.requestedBy.lastName}` : null,
    assignedToId: obj.assignedTo?.id || obj.assignedToId,
    assignedToName: obj.assignedTo
      ? `${obj.assignedTo.firstName} ${obj.assignedTo.lastName}` : null,
    issueType: obj.issueType,
    priority: obj.priority,
    status: obj.status,
    title: obj.title,
    description: obj.description,
    estimatedCost: obj.estimatedCost ? parseFloat(obj.estimatedCost) : null,
    actualCost: obj.actualCost ? parseFloat(obj.actualCost) : null,
    startedAt: obj.startedAt,
    completedAt: obj.completedAt,
    downtimeHours: obj.downtimeHours ? parseFloat(obj.downtimeHours) : null,
    resolutionNotes: obj.resolutionNotes,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

module.exports = {
  createRequest,
  assignTechnician,
  completeRequest,
  updateStatus,
  getRequests,
  getRequest,
};
