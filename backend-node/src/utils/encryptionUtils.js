const crypto = require('crypto');
const config = require('../config/env');

/**
 * AES-256-GCM End-to-End Encryption Utilities
 *
 * Format: iv (12 bytes) + authTag (16 bytes) + ciphertext  — all base64url encoded
 * The key must be a 32-byte (256-bit) Buffer derived from the hex string in env.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;       // 96-bit IV (recommended for GCM)
const AUTH_TAG_LENGTH = 16; // 128-bit auth tag

function getKey() {
  const hexKey = config.encryption.key;
  if (!hexKey || hexKey.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  return Buffer.from(hexKey, 'hex');
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a single base64url string: iv + authTag + ciphertext.
 */
function encrypt(plaintext) {
  if (plaintext === null || plaintext === undefined) return null;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const encrypted = Buffer.concat([
    cipher.update(String(plaintext), 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Concatenate: iv (12) + authTag (16) + ciphertext
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString('base64url');
}

/**
 * Decrypt an AES-256-GCM encrypted string.
 * Input must be base64url format produced by encrypt().
 */
function decrypt(encryptedData) {
  if (encryptedData === null || encryptedData === undefined) return null;
  const key = getKey();
  const combined = Buffer.from(encryptedData, 'base64url');

  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  try {
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch (err) {
    throw new Error('Decryption failed — data may be tampered or key is incorrect.');
  }
}

/**
 * Encrypt a database field value (for PII storage).
 * Returns null if value is null/undefined/empty.
 */
function encryptField(value) {
  if (value === null || value === undefined || value === '') return value;
  return encrypt(String(value));
}

/**
 * Decrypt a database field value.
 * Returns original value if not encrypted (backward compat).
 */
function decryptField(value) {
  if (value === null || value === undefined || value === '') return value;
  try {
    return decrypt(value);
  } catch {
    // Return as-is if decryption fails (plaintext field)
    return value;
  }
}

/**
 * Encrypt an entire request body object for API-level E2EE.
 * Returns { encrypted: "<base64url>", iv: "<hex>" }
 */
function encryptPayload(payload) {
  const json = JSON.stringify(payload);
  const encrypted = encrypt(json);
  return { encrypted };
}

/**
 * Decrypt an API-level encrypted payload.
 */
function decryptPayload(encryptedObj) {
  if (!encryptedObj || !encryptedObj.encrypted) return encryptedObj;
  const json = decrypt(encryptedObj.encrypted);
  return JSON.parse(json);
}

/**
 * Create a SHA-256 hash (for token storage — not reversible).
 * Used for refreshToken and passwordResetToken storage.
 */
function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

module.exports = {
  encrypt,
  decrypt,
  encryptField,
  decryptField,
  encryptPayload,
  decryptPayload,
  hashValue,
};
