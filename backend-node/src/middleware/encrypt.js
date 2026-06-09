const { decryptPayload, encryptPayload } = require('../utils/encryptionUtils');
const logger = require('../utils/logger');

/**
 * API-level AES-256-GCM Encryption Middleware
 *
 * For endpoints where req.headers['x-encrypted'] === 'true':
 *  - decryptRequest: decrypts incoming { encrypted: "..." } body
 *  - encryptResponse: wraps outgoing response in encrypted form
 *
 * This enables optional API-level E2EE on top of HTTPS transport security.
 * Frontend must use the same AES-256-GCM key (shared secret) to encrypt/decrypt.
 */

/**
 * Middleware to decrypt encrypted request body.
 * Only activates when 'x-encrypted: true' header is present.
 */
function decryptRequest(req, res, next) {
  if (req.headers['x-encrypted'] !== 'true') {
    return next();
  }

  try {
    if (req.body && req.body.encrypted) {
      req.body = decryptPayload(req.body);
      logger.debug('Request body decrypted successfully');
    }
    next();
  } catch (err) {
    logger.warn('Request decryption failed:', err.message);
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Invalid encrypted payload — decryption failed',
    });
  }
}

/**
 * Middleware factory to encrypt response JSON.
 * Wraps res.json() to encrypt outgoing data.
 * Only activates when client sends 'x-encrypted: true' header.
 */
function encryptResponse(req, res, next) {
  if (req.headers['x-encrypted'] !== 'true') {
    return next();
  }

  const originalJson = res.json.bind(res);

  res.json = function (data) {
    try {
      const encrypted = encryptPayload(data);
      res.setHeader('x-encrypted', 'true');
      return originalJson(encrypted);
    } catch (err) {
      logger.error('Response encryption failed:', err.message);
      return originalJson(data); // Fallback to plaintext
    }
  };

  next();
}

/**
 * Combined middleware: decrypt request + encrypt response.
 */
function e2eEncryption(req, res, next) {
  decryptRequest(req, res, () => {
    encryptResponse(req, res, next);
  });
}

module.exports = { decryptRequest, encryptResponse, e2eEncryption };
