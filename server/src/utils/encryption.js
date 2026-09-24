// server/src/utils/encryption.js
const crypto = require('crypto');
const config = require('../config/env');

const GCM_IV_LENGTH = 12; // Standard recommended 96-bit IV for AES-GCM
const CBC_IV_LENGTH = 16; // AES block size for legacy CBC

// Default / fallback keys for legacy records or migrations
const DEFAULT_LEGACY_KEYS = [
  'studytrack_secret_key_32_bytes_!'
];

/**
 * Derives a guaranteed 32-byte encryption key for AES-256
 * @param {string|Buffer} [rawKeyInput]
 * @returns {Buffer|null}
 */
function derive32ByteKey(rawKeyInput) {
  const rawKey = rawKeyInput !== undefined ? rawKeyInput : config.encryptionKey;
  if (!rawKey) return null;

  if (Buffer.isBuffer(rawKey)) {
    if (rawKey.length === 32) return rawKey;
    return crypto.createHash('sha256').update(rawKey).digest();
  }

  const strKey = String(rawKey);
  const buf = Buffer.from(strKey);
  if (buf.length === 32) {
    return buf;
  }
  
  // If 64-hex characters, parse as 32-byte hex buffer
  if (/^[0-9a-fA-F]{64}$/.test(strKey)) {
    return Buffer.from(strKey, 'hex');
  }

  return crypto.createHash('sha256').update(strKey).digest();
}

/**
 * Primary key getter for encrypting new data
 * @returns {Buffer}
 */
function getKey() {
  const key = derive32ByteKey(config.encryptionKey);
  if (key) return key;
  return derive32ByteKey('studytrack_secret_key_32_bytes_!');
}

/**
 * Retrieves all candidate keys to try during decryption (supports key rotation & legacy data)
 * @returns {Buffer[]}
 */
function getDecryptionCandidateKeys() {
  const candidates = [];
  const primaryKey = config.encryptionKey;

  if (primaryKey) {
    const derived = derive32ByteKey(primaryKey);
    if (derived) candidates.push(derived);

    // If 64-hex string, also test sha256 hash variant
    if (typeof primaryKey === 'string' && /^[0-9a-fA-F]{64}$/.test(primaryKey)) {
      candidates.push(crypto.createHash('sha256').update(primaryKey).digest());
    }
  }

  // Add environment fallback keys if configured
  if (process.env.ENCRYPTION_KEY_FALLBACKS) {
    const fallbackList = process.env.ENCRYPTION_KEY_FALLBACKS.split(',').map(k => k.trim()).filter(Boolean);
    for (const fb of fallbackList) {
      const derived = derive32ByteKey(fb);
      if (derived && !candidates.some(c => c.equals(derived))) {
        candidates.push(derived);
      }
    }
  }

  // Add default legacy keys
  for (const legacyKey of DEFAULT_LEGACY_KEYS) {
    const derived = derive32ByteKey(legacyKey);
    if (derived && !candidates.some(c => c.equals(derived))) {
      candidates.push(derived);
    }
  }

  return candidates;
}

/**
 * Encrypts a string value using modern Authenticated Encryption (AES-256-GCM)
 * Format: IV_HEX:CIPHERTEXT_HEX:AUTHTAG_HEX
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted string
 */
function encrypt(text) {
  if (!text || typeof text !== 'string') return text;
  
  try {
    const iv = crypto.randomBytes(GCM_IV_LENGTH);
    const key = getKey();
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
  } catch (err) {
    console.error('Encryption error:', err.message);
    return text;
  }
}

/**
 * Decrypts an encrypted string value safely with error boundary and candidate key fallbacks
 * Supports both modern AES-256-GCM (3 parts) and legacy AES-256-CBC (2 parts)
 * @param {string} text - The encrypted text
 * @returns {string} - The decrypted text or fallback to original text on error/tampering
 */
function decrypt(text) {
  if (!text || typeof text !== 'string' || !text.includes(':')) {
    return text;
  }
  
  const textParts = text.split(':');
  const candidateKeys = getDecryptionCandidateKeys();

  // Mode 1: Modern AES-256-GCM (IV : CIPHERTEXT : AUTHTAG)
  if (textParts.length === 3) {
    const [ivHex, encryptedHex, tagHex] = textParts;
    
    // Validate hex characters
    if (!/^[0-9a-fA-F]+$/.test(ivHex) || !/^[0-9a-fA-F]+$/.test(encryptedHex) || !/^[0-9a-fA-F]+$/.test(tagHex)) {
      return text;
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');
    
    if (iv.length !== GCM_IV_LENGTH && iv.length !== 16) {
      return text;
    }
    if (authTag.length !== 16) {
      return text;
    }

    for (const key of candidateKeys) {
      try {
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted.toString('utf8');
      } catch {
        // Try next candidate key
      }
    }
    
    return text;
  }
  
  // Mode 2: Legacy AES-256-CBC (IV : CIPHERTEXT)
  if (textParts.length === 2) {
    const [ivHex, encryptedHex] = textParts;
    
    if (!/^[0-9a-fA-F]+$/.test(ivHex) || !/^[0-9a-fA-F]+$/.test(encryptedHex)) {
      return text;
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    
    if (iv.length !== CBC_IV_LENGTH) {
      return text;
    }

    for (const key of candidateKeys) {
      try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted.toString('utf8');
      } catch {
        // Try next candidate key
      }
    }
    
    return text;
  }
  
  return text;
}

module.exports = {
  encrypt,
  decrypt,
  getKey,
  derive32ByteKey,
  getDecryptionCandidateKeys
};