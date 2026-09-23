# Task Encryption Implementation

This document explains how sensitive task data is encrypted in the IskoTasks application.

## Overview

The following task fields are encrypted before database storage:
- Title (`title`)
- Description (`description`)
- Priority (`priority`)
- Subject (`subject`)

## How It Works

1. **Encryption Utility**: A utility module (`server/src/utils/encryption.js`) provides `encrypt` and `decrypt` functions using modern Authenticated Encryption (AES-256-GCM) with random initialization vectors and authentication tags.

2. **Task Service Layer**: The `task.service.js` automatically encrypts sensitive fields before creating or updating records in MongoDB, and decrypts them when returning responses to authorized users.

3. **Backward Compatibility**: The decryption module automatically detects and handles both modern AES-256-GCM format (`IV:CIPHERTEXT:AUTHTAG`) and legacy AES-256-CBC format (`IV:CIPHERTEXT`), as well as plain text fallback without crashing.

## Security Details

- **Encryption Algorithm**: AES-256-GCM (Authenticated Encryption with Associated Data - AEAD)
- **Key Storage**: The 256-bit encryption key is loaded from the environment variable (`ENCRYPTION_KEY`)
- **IV/Nonce Handling**: A cryptographically random 12-byte IV is generated per field encryption
- **Integrity Tag**: A 16-byte authentication tag is generated and validated upon decryption to prevent ciphertext tampering and malleability
- **Error Boundary**: If decryption fails (due to key mismatch or corrupted/tampered bytes), it falls back safely without throwing an internal server error

## Technical Implementation

1. **Format**:
   - AES-256-GCM: `<12-byte IV Hex>:<Ciphertext Hex>:<16-byte AuthTag Hex>`
   - Legacy AES-256-CBC: `<16-byte IV Hex>:<Ciphertext Hex>`

2. **Data is encrypted before storage**:
   ```javascript
   title: encrypt(trimmedTitle),
   description: encrypt(description || ''),
   priority: encrypt(sanitizedPriority),
   subject: encrypt(subject || '')
   ```

3. **Data is decrypted when returned to authorized user**:
   ```javascript
   title: decrypt(task.title),
   description: decrypt(task.description || ''),
   priority: decrypt(task.priority) || 'medium',
   subject: decrypt(task.subject || '')
   ```
