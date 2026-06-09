const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * JWT utilities.
 * Uses HS256 signing with the configured secret.
 */

/**
 * Generate a signed JWT access token (24h default).
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: Math.floor(config.jwt.accessExpiry / 1000), // ms → seconds
    algorithm: 'HS256',
  });
}

/**
 * Generate a signed JWT refresh token (7d default).
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: Math.floor(config.jwt.refreshExpiry / 1000),
    algorithm: 'HS256',
  });
}

/**
 * Verify a token and return decoded payload.
 * Throws JsonWebTokenError or TokenExpiredError on failure.
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

/**
 * Decode token WITHOUT verifying (for extracting data from expired tokens).
 */
function decodeToken(token) {
  return jwt.decode(token);
}

/**
 * Check if a token is expired without throwing.
 */
function isTokenExpired(token) {
  try {
    jwt.verify(token, config.jwt.secret);
    return false;
  } catch (err) {
    return err.name === 'TokenExpiredError';
  }
}

/**
 * Extract username (email) from token — mirrors extractUsername().
 */
function extractUsername(token) {
  const decoded = verifyToken(token);
  return decoded.sub || decoded.email;
}

/**
 * Build JWT claims.
 */
function buildClaims(user, roles) {
  return {
    sub: user.email,
    userId: user.id,
    firstName: user.firstName,
    roles: roles,
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  extractUsername,
  buildClaims,
};
