const { ApiResponse } = require('../utils/apiResponse');

/**
 * Role-Based Access Control middleware.
 *
 * Usage:
 *   router.post('/admin', authenticate, requireRoles('ROLE_ADMIN', 'ROLE_SUPER_ADMIN'), handler)
 */
function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.error(401, 'Authentication required'));
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json(
        ApiResponse.error(403, `Access denied. Required roles: ${roles.join(', ')}`)
      );
    }

    next();
  };
}

/**
 * Convenience: admin or super admin access.
 */
const requireAdmin = requireRoles('ROLE_ADMIN', 'ROLE_SUPER_ADMIN');

/**
 * Convenience: only super admin.
 */
const requireSuperAdmin = requireRoles('ROLE_SUPER_ADMIN');

module.exports = { requireRoles, requireAdmin, requireSuperAdmin };
