const { AuditLog } = require('../models');
const logger = require('../utils/logger');

/**
 * Audit Log Service.
 * Records all significant actions (AOP-equivalent via explicit calls).
 */

async function log(action, entityType, entityId, oldValues, newValues, description, userId = null, req = null) {
  try {
    await AuditLog.create({
      action,
      entityType,
      entityId,
      oldValues: oldValues || null,
      newValues: newValues || null,
      description,
      performedById: userId,
      ipAddress: req ? (req.ip || req.connection?.remoteAddress) : null,
      userAgent: req ? req.headers?.['user-agent'] : null,
    });
  } catch (err) {
    // Don't let audit logging failures break business logic
    logger.error(`Audit log failed: ${err.message}`);
  }
}

async function getAll({ page = 0, size = 20, entityType, action } = {}) {
  const where = {};
  if (entityType) where.entityType = entityType;
  if (action) where.action = action;

  const { count, rows } = await AuditLog.findAndCountAll({
    where,
    limit: size,
    offset: page * size,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: require('../models').User,
        as: 'performedBy',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        required: false,
      },
    ],
  });

  return { content: rows, total: count, page, size };
}

module.exports = { log, getAll };
