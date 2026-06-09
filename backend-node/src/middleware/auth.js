const { verifyToken } = require('../utils/jwtUtils');
const { ApiResponse } = require('../utils/apiResponse');
const { User, Role } = require('../models');
const logger = require('../utils/logger');

/**
 * JWT Authentication Middleware.
 * Extracts Bearer token, verifies it, and attaches req.user.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(ApiResponse.error(401, 'No authentication token provided'));
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // Load user from DB to ensure they still exist and are active
    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Role, through: { attributes: [] } }],
    });

    if (!user) {
      return res.status(401).json(ApiResponse.error(401, 'User not found'));
    }

    if (!user.isActive) {
      return res.status(403).json(ApiResponse.error(403, 'Account is deactivated. Contact administrator.'));
    }

    // Attach user context to request (mirrors SecurityContextHolder)
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.Roles ? user.Roles.map(r => r.name) : decoded.roles || [],
      departmentId: user.departmentId,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json(ApiResponse.error(401, 'Token has expired. Please login again.'));
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json(ApiResponse.error(401, 'Invalid authentication token'));
    }
    logger.error('Auth middleware error:', err);
    return res.status(500).json(ApiResponse.error(500, 'Authentication error'));
  }
}

/**
 * Optional authentication — attaches req.user if token present, doesn't fail if not.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return authenticate(req, res, next);
}

module.exports = { authenticate, optionalAuth };
