// server/src/utils/encryption.js
const crypto = require('crypto');
const config = require('../config/env');

const GCM_IV_LENGTH = 12; // Standard recommended 96-bit IV for AES-GCM
const CBC_IV_LENGTH = 16; // AES block size for legacy CBC

/**
 * Derives a guaranteed 32-byte encryption key for AES-256
 * Preserves exact bytes if raw key is already 32 bytes, otherwise derives via SHA-256
 * @returns {Buffer}
 */
function getKey() {
  const rawKey = config.encryptionKey;
  const buf = Buffer.from(rawKey);
  if (buf.length === 32) {
    return buf;
  }
  return crypto.createHash('sha256').update(String(rawKey)).digest();
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
 * Decrypts an encrypted string value safely with error boundary
 * Supports both modern AES-256-GCM (3 parts) and legacy AES-256-CBC (2 parts)
 * @param {string} text - The encrypted text
 * @returns {string} - The decrypted text or fallback to original text on error/tampering
 */
function decrypt(text) {
  if (!text || typeof text !== 'string' || !text.includes(':')) {
    return text;
  }
  
  try {
    const textParts = text.split(':');
    
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
      
      const key = getKey();
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString('utf8');
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
      
      const key = getKey();
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString('utf8');
    }
    
    return text;
  } catch {
    // Decryption failure (e.g. invalid key, authentication tag mismatch, or corrupted payload) fails safely
    return text;
  }
}

module.exports = {
  encrypt,
  decrypt,
  getKey
};