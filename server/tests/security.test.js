// server/tests/security.test.js
const { app, setDb } = require('../src/index');
const http = require('http');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { encrypt, decrypt, getKey } = require('../src/utils/encryption');

// Comprehensive In-Memory Mock DB to allow reliable testing in any environment
class MockCollection {
  constructor(name) {
    this.name = name;
    this.docs = [];
  }

  async findOne(query) {
    return this.docs.find(doc => this._match(doc, query)) || null;
  }

  find(query = {}) {
    const matched = this.docs.filter(doc => this._match(doc, query));
    return {
      sort: () => ({
        toArray: async () => matched.map(d => ({ ...d }))
      }),
      toArray: async () => matched.map(d => ({ ...d }))
    };
  }

  async insertOne(doc) {
    const insertedId = doc._id || new ObjectId();
    const newDoc = { ...doc, _id: insertedId };
    this.docs.push(newDoc);
    return { insertedId };
  }

  async updateOne(query, update) {
    const index = this.docs.findIndex(doc => this._match(doc, query));
    if (index === -1) {
      return { matchedCount: 0, modifiedCount: 0 };
    }
    if (update.$set) {
      this.docs[index] = { ...this.docs[index], ...update.$set };
    }
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(query) {
    const index = this.docs.findIndex(doc => this._match(doc, query));
    if (index === -1) {
      return { deletedCount: 0 };
    }
    this.docs.splice(index, 1);
    return { deletedCount: 1 };
  }

  async createIndex() {
    return 'index_created';
  }

  _match(doc, query) {
    for (const [key, val] of Object.entries(query)) {
      if (key === '_id') {
        const docIdStr = doc._id ? doc._id.toString() : '';
        const queryIdStr = val ? val.toString() : '';
        if (docIdStr !== queryIdStr) return false;
      } else if (doc[key] !== val) {
        return false;
      }
    }
    return true;
  }
}

class MockDb {
  constructor() {
    this.databaseName = 'StudyTrack_Test';
    this.collections = {
      users: new MockCollection('users'),
      AcadTasks: new MockCollection('AcadTasks')
    };
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new MockCollection(name);
    }
    return this.collections[name];
  }

  listCollections() {
    return {
      toArray: async () => Object.keys(this.collections).map(name => ({ name }))
    };
  }

  async createCollection(name) {
    return this.collection(name);
  }
}

// HTTP request helper
function makeRequest(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const reqOptions = {
      hostname: '127.0.0.1',
      port: port,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

// Test Runner
let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedCount++;
  }
}

async function runSecurityTests() {
  console.log('========================================================');
  console.log('   IskoTasks Backend Security & Quality Test Suite');
  console.log('========================================================\n');

  const mockDb = new MockDb();
  setDb(mockDb);

  // Start test server on random free port
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`Test server running on port ${port}\n`);

  try {
    // -------------------------------------------------------------
    // 1. REGISTRATION SECURITY TESTS
    // -------------------------------------------------------------
    console.log('--- 1. User Registration Security Tests ---');

    // Test 1.1: Registration hashes passwords and does not return password hash
    const signupResA = await makeRequest(server, { method: 'POST', path: '/auth/signup' }, {
      name: 'User A',
      email: 'userA@example.com',
      password: 'SecurePassword123!'
    });

    assert(signupResA.status === 201, 'User A registration returns 201 Created');
    assert(signupResA.body.token && typeof signupResA.body.token === 'string', 'Registration returns a valid JWT token');
    assert(signupResA.body.id, 'Registration returns user ID');
    assert(signupResA.body.password === undefined, 'Signup response does NOT leak password');
    assert(signupResA.body.hashedPassword === undefined, 'Signup response does NOT leak password hash');

    const userInDbA = await mockDb.collection('users').findOne({ email: 'usera@example.com' });
    assert(userInDbA !== null, 'User A is stored in the database');
    assert(userInDbA.password !== 'SecurePassword123!', 'Plaintext password is NEVER stored');
    const isBcryptHash = await bcrypt.compare('SecurePassword123!', userInDbA.password);
    assert(isBcryptHash === true, 'Password in database is hashed properly with bcrypt');

    // Test 1.2: Duplicate email registration is safely rejected
    const duplicateRes = await makeRequest(server, { method: 'POST', path: '/auth/signup' }, {
      name: 'Duplicate User',
      email: 'USERA@example.com', // Case-insensitive duplicate
      password: 'AnotherPassword123!'
    });
    assert(duplicateRes.status === 409, 'Duplicate email registration returns 409 Conflict');

    // Test 1.3: Input validation on registration
    const shortPasswordRes = await makeRequest(server, { method: 'POST', path: '/auth/signup' }, {
      name: 'Short Pass',
      email: 'short@example.com',
      password: '123'
    });
    assert(shortPasswordRes.status === 400, 'Registration with weak/short password (<8 chars) returns 400 Bad Request');

    const longPasswordRes = await makeRequest(server, { method: 'POST', path: '/auth/signup' }, {
      name: 'Long Pass',
      email: 'long@example.com',
      password: 'A'.repeat(150)
    });
    assert(longPasswordRes.status === 400, 'Registration with oversized password (>128 chars) returns 400 (Bcrypt DoS Protection)');

    const invalidEmailRes = await makeRequest(server, { method: 'POST', path: '/auth/signup' }, {
      name: 'Invalid Email',
      email: 'not-an-email',
      password: 'ValidPassword123!'
    });
    assert(invalidEmailRes.status === 400, 'Registration with invalid email format returns 400 Bad Request');

    // Register User B for authorization / IDOR testing
    const signupResB = await makeRequest(server, { method: 'POST', path: '/auth/signup' }, {
      name: 'User B',
      email: 'userB@example.com',
      password: 'UserBPassword123!'
    });
    const tokenA = signupResA.body.token;
    const userAId = signupResA.body.id;
    const tokenB = signupResB.body.token;
    const userBId = signupResB.body.id;

    // -------------------------------------------------------------
    // 2. LOGIN & AUTHENTICATION TESTS
    // -------------------------------------------------------------
    console.log('\n--- 2. User Login Security Tests ---');

    // Test 2.1: Correct credentials authenticate successfully
    const loginResA = await makeRequest(server, { method: 'POST', path: '/auth/login' }, {
      email: 'usera@example.com',
      password: 'SecurePassword123!'
    });
    assert(loginResA.status === 200, 'Login with correct credentials returns 200 OK');
    assert(loginResA.body.token && typeof loginResA.body.token === 'string', 'Login returns valid JWT token');
    assert(loginResA.body.password === undefined, 'Login response does NOT expose password');
    assert(loginResA.headers['x-ratelimit-limit'] !== undefined, 'Rate limiting header X-RateLimit-Limit is attached');

    // Test 2.2: Case-insensitive email login
    const loginUpperRes = await makeRequest(server, { method: 'POST', path: '/auth/login' }, {
      email: 'USERA@EXAMPLE.COM',
      password: 'SecurePassword123!'
    });
    assert(loginUpperRes.status === 200, 'Login handles case-insensitive email normalization');

    // Test 2.3: Incorrect credentials fail
    const wrongPassRes = await makeRequest(server, { method: 'POST', path: '/auth/login' }, {
      email: 'usera@example.com',
      password: 'WrongPassword!'
    });
    assert(wrongPassRes.status === 401, 'Login with incorrect password returns 401 Unauthorized');

    const nonexistentUserRes = await makeRequest(server, { method: 'POST', path: '/auth/login' }, {
      email: 'nonexistent@example.com',
      password: 'SecurePassword123!'
    });
    assert(nonexistentUserRes.status === 401, 'Login with non-existent user returns 401 Unauthorized');

    // -------------------------------------------------------------
    // 3. ROUTE PROTECTION & TOKEN ENFORCEMENT
    // -------------------------------------------------------------
    console.log('\n--- 3. Protected Route & Token Enforcement Tests ---');

    // Test 3.1: Protected requests without token are rejected
    const unauthGetRes = await makeRequest(server, { method: 'GET', path: '/acadtasks' });
    assert(unauthGetRes.status === 401, 'GET /acadtasks without token returns 401 Unauthorized');

    const unauthPostRes = await makeRequest(server, { method: 'POST', path: '/acadtasks' }, { title: 'Test' });
    assert(unauthPostRes.status === 401, 'POST /acadtasks without token returns 401 Unauthorized');

    const unauthProfileRes = await makeRequest(server, { method: 'POST', path: '/auth/update-profile' }, { name: 'Hacker' });
    assert(unauthProfileRes.status === 401, 'POST /auth/update-profile without token returns 401 Unauthorized');

    // Test 3.2: Tampered / invalid token is rejected
    const invalidTokenRes = await makeRequest(server, {
      method: 'GET',
      path: '/acadtasks',
      headers: { 'Authorization': 'Bearer invalid.token.payload' }
    });
    assert(invalidTokenRes.status === 401, 'Request with tampered/invalid token returns 401 Unauthorized');

    // -------------------------------------------------------------
    // 4. AUTHORIZATION & IDOR / BOLA PROTECTION TESTS
    // -------------------------------------------------------------
    console.log('\n--- 4. Authorization & IDOR / BOLA Prevention Tests ---');

    // Test 4.1: User A creates a task (with attempt to spoof userId)
    const createTaskResA = await makeRequest(server, {
      method: 'POST',
      path: '/acadtasks',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    }, {
      userId: userBId, // Malicious attempt: User A tries to spoof User B's ID in body
      title: 'User A Secret Task',
      description: 'User A confidential notes',
      priority: 'high',
      subject: 'Computer Science'
    });

    assert(createTaskResA.status === 201, 'User A creates task successfully');
    assert(createTaskResA.body.userId === userAId, 'Backend forces task.userId to authenticated user (spoofing prevented)');
    const taskAId = createTaskResA.body.id;

    // User B creates a task
    const createTaskResB = await makeRequest(server, {
      method: 'POST',
      path: '/acadtasks',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    }, {
      title: 'User B Secret Task',
      description: 'User B private project',
      priority: 'medium',
      subject: 'Math'
    });
    assert(createTaskResB.status === 201, 'User B creates task successfully');
    const taskBId = createTaskResB.body.id;

    // Test 4.2: User A can access User A's task list
    const getTasksResA = await makeRequest(server, {
      method: 'GET',
      path: '/acadtasks',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(getTasksResA.status === 200, 'User A retrieves their task list');
    assert(Array.isArray(getTasksResA.body) && getTasksResA.body.length === 1, 'User A receives only 1 task');
    assert(getTasksResA.body[0].id === taskAId, 'User A task list contains Task A');

    // Test 4.3: User A CANNOT see User B's task in GET /acadtasks (BOLA protection)
    const userBTaskVisibleToA = getTasksResA.body.some(t => t.id === taskBId);
    assert(userBTaskVisibleToA === false, 'User B task is NOT visible in User A task list (BOLA prevented)');

    // Test 4.4: User A CAN fetch their own single task via GET /acadtasks/:id
    const getSingleTaskA = await makeRequest(server, {
      method: 'GET',
      path: `/acadtasks/${taskAId}`,
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(getSingleTaskA.status === 200, 'User A can fetch their own task by ID via GET /acadtasks/:id');
    assert(getSingleTaskA.body.title === 'User A Secret Task', 'Single task fetch properly decrypts task fields');

    // Test 4.5: User A CANNOT fetch User B's single task via GET /acadtasks/:id (Single task IDOR protection)
    const idorSingleTaskB = await makeRequest(server, {
      method: 'GET',
      path: `/acadtasks/${taskBId}`,
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(idorSingleTaskB.status === 403, 'User A fetching User B task by ID returns 403 Forbidden');

    // Test 4.6: Invalid task ID format returns 400
    const invalidIdRes = await makeRequest(server, {
      method: 'GET',
      path: '/acadtasks/invalid-objectid-123',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(invalidIdRes.status === 400, 'Invalid task ID format returns 400 Bad Request');

    // Test 4.7: Non-existent task returns 404
    const nonExistentId = new ObjectId().toString();
    const notFoundTaskRes = await makeRequest(server, {
      method: 'GET',
      path: `/acadtasks/${nonExistentId}`,
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(notFoundTaskRes.status === 404, 'Non-existent task ID returns 404 Not Found');

    // Test 4.8: User A CANNOT access User B's task list via /acadtasks/user/:userId (IDOR protection)
    const idorUserTasksRes = await makeRequest(server, {
      method: 'GET',
      path: `/acadtasks/user/${userBId}`,
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(idorUserTasksRes.status === 403, 'User A querying /acadtasks/user/:userBId returns 403 Forbidden');

    // Test 4.9: User A CANNOT update User B's task (IDOR PUT protection)
    const idorUpdateRes = await makeRequest(server, {
      method: 'PUT',
      path: `/acadtasks/${taskBId}`,
      headers: { 'Authorization': `Bearer ${tokenA}` }
    }, {
      title: 'Hacked by User A',
      priority: 'low'
    });
    assert(idorUpdateRes.status === 403, 'User A attempting to PUT User B task returns 403 Forbidden');

    // Test 4.10: User A CANNOT toggle completion of User B's task (IDOR PATCH protection)
    const idorToggleRes = await makeRequest(server, {
      method: 'PATCH',
      path: `/acadtasks/${taskBId}/toggle`,
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(idorToggleRes.status === 403, 'User A attempting to PATCH /toggle User B task returns 403 Forbidden');

    // Test 4.11: User A CANNOT delete User B's task (IDOR DELETE protection)
    const idorDeleteRes = await makeRequest(server, {
      method: 'DELETE',
      path: `/acadtasks/${taskBId}`,
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(idorDeleteRes.status === 403, 'User A attempting to DELETE User B task returns 403 Forbidden');

    // Verify User B's task is intact and unmodified in database
    const userBTaskInDb = await mockDb.collection('AcadTasks').findOne({ _id: new ObjectId(taskBId) });
    assert(userBTaskInDb !== null, 'User B task remains intact in database');
    assert(decrypt(userBTaskInDb.title) === 'User B Secret Task', 'User B task title was NOT modified by unauthorized attempts');

    // Test 4.12: User A CAN update their own task
    const legitimateUpdateRes = await makeRequest(server, {
      method: 'PUT',
      path: `/acadtasks/${taskAId}`,
      headers: { 'Authorization': `Bearer ${tokenA}` }
    }, {
      title: 'User A Updated Task',
      priority: 'medium'
    });
    assert(legitimateUpdateRes.status === 200, 'User A successfully updates their own task');

    // Test 4.13: User A CAN toggle completion of their own task
    const legitimateToggleRes = await makeRequest(server, {
      method: 'PATCH',
      path: `/acadtasks/${taskAId}/toggle`,
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(legitimateToggleRes.status === 200, 'User A successfully toggles their own task completion');
    assert(legitimateToggleRes.body.completed === true, 'Task completion status updated to true');

    // Test 4.14: User A CAN delete their own task
    const legitimateDeleteRes = await makeRequest(server, {
      method: 'DELETE',
      path: `/acadtasks/${taskAId}`,
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(legitimateDeleteRes.status === 200, 'User A successfully deletes their own task');

    // Test 4.15: User A CANNOT spoof userId on Profile Update
    const spoofProfileRes = await makeRequest(server, {
      method: 'POST',
      path: '/auth/update-profile',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    }, {
      userId: userBId, // Attempt to rename User B
      name: 'User A Renamed'
    });
    assert(spoofProfileRes.status === 200, 'Profile update returns 200');
    
    const userAAfterUpdate = await mockDb.collection('users').findOne({ _id: new ObjectId(userAId) });
    const userBAfterUpdate = await mockDb.collection('users').findOne({ _id: new ObjectId(userBId) });
    assert(userAAfterUpdate.name === 'User A Renamed', 'User A profile was updated with new name');
    assert(userBAfterUpdate.name === 'User B', 'User B profile was NOT modified by User A (Profile IDOR prevented)');

    // -------------------------------------------------------------
    // 5. INPUT VALIDATION EDGE CASE TESTS
    // -------------------------------------------------------------
    console.log('\n--- 5. Input Validation Edge Cases ---');

    // Test 5.1: Invalid deadline date format returns 400
    const invalidDateRes = await makeRequest(server, {
      method: 'POST',
      path: '/acadtasks',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    }, {
      title: 'Invalid Date Task',
      deadline: 'not-a-valid-date-string'
    });
    assert(invalidDateRes.status === 400, 'Task creation with invalid date returns 400 Bad Request');

    // Test 5.2: Invalid priority on update returns 400
    const invalidPriorityRes = await makeRequest(server, {
      method: 'PUT',
      path: `/acadtasks/${taskBId}`,
      headers: { 'Authorization': `Bearer ${tokenB}` }
    }, {
      priority: 'extreme'
    });
    assert(invalidPriorityRes.status === 400, 'Task update with invalid priority returns 400 Bad Request');

    // Test 5.3: Empty title on task update returns 400
    const emptyTitleRes = await makeRequest(server, {
      method: 'PUT',
      path: `/acadtasks/${taskBId}`,
      headers: { 'Authorization': `Bearer ${tokenB}` }
    }, {
      title: '   '
    });
    assert(emptyTitleRes.status === 400, 'Task update with empty/whitespace title returns 400 Bad Request');

    // -------------------------------------------------------------
    // 6. ENCRYPTION (AES-256-GCM & BACKWARD COMPATIBILITY) TESTS
    // -------------------------------------------------------------
    console.log('\n--- 6. Task Data Authenticated Encryption (AEAD) Tests ---');

    // Test 6.1: Direct AES-256-GCM encryption produces 3-part hex format
    const secretText = 'Confidential Exam Notes 2026';
    const encryptedGcm = encrypt(secretText);
    const gcmParts = encryptedGcm.split(':');
    assert(gcmParts.length === 3, 'AES-256-GCM produces 3-part format (IV:CIPHERTEXT:AUTHTAG)');
    assert(gcmParts[0].length === 24, 'AES-256-GCM IV is 12 bytes (24 hex characters)');
    assert(gcmParts[2].length === 32, 'AES-256-GCM AuthTag is 16 bytes (32 hex characters)');
    assert(decrypt(encryptedGcm) === secretText, 'Decryption of AES-256-GCM recovers original secret plaintext');

    // Test 6.2: Fresh IV generated per encryption
    const encryptedGcm2 = encrypt(secretText);
    assert(encryptedGcm !== encryptedGcm2, 'Encrypting the same text twice produces different ciphertexts due to fresh IV');
    assert(decrypt(encryptedGcm2) === secretText, 'Both ciphertexts decrypt to the same original text');

    // Test 6.3: Tampering detection (GCM Integrity Authentication)
    // Flip bytes in ciphertext
    const tamperedCipher = `${gcmParts[0]}:ff${gcmParts[1].substring(2)}:${gcmParts[2]}`;
    assert(decrypt(tamperedCipher) === tamperedCipher, 'Tampered ciphertext fails GCM auth tag check and safely falls back without throwing');

    // Flip bytes in auth tag
    const tamperedTag = `${gcmParts[0]}:${gcmParts[1]}:00${gcmParts[2].substring(2)}`;
    assert(decrypt(tamperedTag) === tamperedTag, 'Forged authentication tag fails GCM check and safely falls back');

    // Test 6.4: Legacy AES-256-CBC 2-part decryption backward compatibility
    const legacyIv = crypto.randomBytes(16);
    const legacyKey = getKey();
    const legacyCipher = crypto.createCipheriv('aes-256-cbc', legacyKey, legacyIv);
    let legacyEncrypted = legacyCipher.update('Legacy CBC Data', 'utf8');
    legacyEncrypted = Buffer.concat([legacyEncrypted, legacyCipher.final()]);
    const legacyPayload = `${legacyIv.toString('hex')}:${legacyEncrypted.toString('hex')}`;

    assert(legacyPayload.split(':').length === 2, 'Legacy payload has 2 parts (IV:CIPHERTEXT)');
    assert(decrypt(legacyPayload) === 'Legacy CBC Data', 'Decrypt module successfully handles legacy AES-256-CBC payloads for backward compatibility');

    // Test 6.5: Database storage verification of GCM ciphertext
    const taskInDb = await mockDb.collection('AcadTasks').findOne({ _id: new ObjectId(taskBId) });
    assert(taskInDb.title.split(':').length === 3, 'Task title stored in MongoDB uses 3-part AES-256-GCM authenticated format');
    assert(taskInDb.title !== 'User B Secret Task', 'Plaintext title is NOT stored in MongoDB');

    // -------------------------------------------------------------
    // 7. CORS WHITELISTING & CONFIGURATION TESTS
    // -------------------------------------------------------------
    console.log('\n--- 7. CORS Whitelisting & Origin Security Tests ---');

    // Test 7.1: Allowed origin (e.g. Vite frontend http://localhost:5174)
    const allowedCorsRes = await makeRequest(server, {
      method: 'GET',
      path: '/test',
      headers: { 'Origin': 'http://localhost:5174' }
    });
    assert(allowedCorsRes.headers['access-control-allow-origin'] === 'http://localhost:5174', 'Allowed origin http://localhost:5174 is reflected in Access-Control-Allow-Origin');
    assert(allowedCorsRes.headers['access-control-allow-credentials'] === 'true', 'Access-Control-Allow-Credentials is true for allowed origins');

    // Test 7.2: Allowed origin http://localhost:5173
    const allowed5173Res = await makeRequest(server, {
      method: 'GET',
      path: '/test',
      headers: { 'Origin': 'http://localhost:5173' }
    });
    assert(allowed5173Res.headers['access-control-allow-origin'] === 'http://localhost:5173', 'Allowed origin http://localhost:5173 is accepted');

    // Test 7.3: Disallowed origin (e.g. malicious-attacker.com)
    const disallowedCorsRes = await makeRequest(server, {
      method: 'GET',
      path: '/test',
      headers: { 'Origin': 'http://malicious-attacker.com' }
    });
    assert(disallowedCorsRes.status === 403, 'Disallowed origin http://malicious-attacker.com is blocked by CORS with 403 Forbidden');
    assert(disallowedCorsRes.headers['access-control-allow-origin'] === undefined, 'Disallowed origin does NOT receive Access-Control-Allow-Origin header');

    // Test 7.4: Non-browser request without Origin header (curl, mobile, backend-to-backend)
    const noOriginRes = await makeRequest(server, { method: 'GET', path: '/test' });
    assert(noOriginRes.status === 200, 'Requests without Origin header (server-to-server/mobile) are permitted');

    // -------------------------------------------------------------
    // 8. RESILIENCE, HEADERS & ERROR HANDLING TESTS
    // -------------------------------------------------------------
    console.log('\n--- 8. Resilience, Headers & Centralized Error Handling Tests ---');

    // Test 8.1: Corrupted ciphertext in database decrypts safely without crashing
    const corruptedTask = {
      userId: userBId,
      title: 'corrupted:cipher:data:not:hex',
      description: 'plain unencrypted text',
      priority: 'high',
      deadline: new Date(),
      subject: 'Math',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const corruptedInsert = await mockDb.collection('AcadTasks').insertOne(corruptedTask);
    
    const corruptedFetchRes = await makeRequest(server, {
      method: 'GET',
      path: `/acadtasks/${corruptedInsert.insertedId.toString()}`,
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(corruptedFetchRes.status === 200, 'Corrupted ciphertext in DB falls back safely without HTTP 500 crash');
    assert(corruptedFetchRes.body.title === 'corrupted:cipher:data:not:hex', 'Fallback returns uncorrupted original value');

    // Test 8.2: Security headers present
    const testHeaderRes = await makeRequest(server, { method: 'GET', path: '/test' });
    assert(testHeaderRes.headers['x-content-type-options'] === 'nosniff', 'Security header X-Content-Type-Options is nosniff');
    assert(testHeaderRes.headers['x-frame-options'] === 'DENY', 'Security header X-Frame-Options is DENY');
    assert(testHeaderRes.headers['x-powered-by'] === undefined, 'X-Powered-By header is stripped');

    // Test 8.3: Unknown route returns structured JSON 404
    const notFoundRouteRes = await makeRequest(server, { method: 'GET', path: '/non-existent-api-path' });
    assert(notFoundRouteRes.status === 404, 'Unknown route returns 404 status');
    assert(notFoundRouteRes.body && notFoundRouteRes.body.message.includes('Route not found'), 'Unknown route returns structured JSON error');

    // Test 8.4: Malformed JSON body returns 400 Bad Request
    const malformedJsonRes = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: port,
        path: '/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          let json;
          try { json = JSON.parse(data); } catch { json = data; }
          resolve({ status: res.statusCode, body: json });
        });
      });
      req.on('error', reject);
      req.write('{ "badJson": missingQuote }');
      req.end();
    });
    assert(malformedJsonRes.status === 400, 'Malformed JSON payload caught by error handler and returns 400 Bad Request');

  } catch (err) {
    console.error('Test execution error:', err);
    failedCount++;
  } finally {
    server.close();
  }

  console.log('\n========================================================');
  console.log(`Test Results: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('========================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSecurityTests();
