const { ApiResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Custom Error Classes.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ResourceNotFoundError extends AppError {
  constructor(resource, field, value) {
    super(`${resource} not found with ${field}: ${value}`, 404);
    this.resource = resource;
  }
}

class BadRequestError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class BusinessError extends AppError {
  constructor(message) {
    super(message, 422);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

/**
 * Global error handler middleware — replaces @ControllerAdvice.
 * Must be registered last: app.use(errorHandler)
 */
function errorHandler(err, req, res, next) {
  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors ? err.errors.map(e => ({ field: e.path, message: e.message })) : null;
    logger.warn(`Validation error: ${err.message}`);
    return res.status(400).json(ApiResponse.error(400, 'Validation failed', errors));
  }

  // Sequelize Foreign Key Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    logger.warn(`FK constraint error: ${err.message}`);
    return res.status(400).json(ApiResponse.error(400, 'Referenced resource does not exist'));
  }

  // Custom App Errors
  if (err instanceof AppError) {
    logger.warn(`${err.name}: ${err.message}`);
    return res.status(err.statusCode).json(ApiResponse.error(err.statusCode, err.message));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(ApiResponse.error(401, 'Invalid token'));
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(ApiResponse.error(401, 'Token expired'));
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json(ApiResponse.error(400, 'File too large. Maximum size is 50MB'));
  }

  // Generic server error
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  return res.status(500).json(ApiResponse.error(500, 'Internal server error'));
}

/**
 * 404 handler for unknown routes.
 */
function notFoundHandler(req, res) {
  return res.status(404).json(ApiResponse.error(404, `Route ${req.method} ${req.path} not found`));
}

module.exports = {
  errorHandler,
  notFoundHandler,
  AppError,
  ResourceNotFoundError,
  BadRequestError,
  BusinessError,
  UnauthorizedError,
  ForbiddenError,
};
