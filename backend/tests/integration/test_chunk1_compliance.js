const { test, before, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise, resetDatabase, db } = require('../helpers/test_app');

before(async () => {
  await migratePromise;
});

afterEach(async () => {
  process.env.SIMULATE_DB_FAILURE = 'false';
  process.env.PASSWORD_POLICY_AVAILABLE = 'true';
  process.env.SIMULATE_FILE_STORAGE_FAILURE = 'false';
  await resetDatabase();
});

function getUserCount() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row.count);
    });
  });
}

function getSubmissionCount() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) AS count FROM submissions', (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row.count);
    });
  });
}

function getStoredPassword(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT password FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row ? row.password : null);
    });
  });
}

function validSubmissionPayload() {
  return {
    metadata: {
      title: 'Paper Title',
      abstract: 'Abstract text',
      authors: 'Author One',
      keywords: 'keyword1, keyword2'
    },
    manuscriptFile: {
      filename: 'paper.pdf',
      sizeBytes: 1024
    }
  };
}

// Spec semantics check: successful registration should redirect user to login.
test('compliance: register responds with HTTP redirect to login', async () => {
  const response = await request(app)
    .post('/api/register')
    .send({ email: 'redirect@example.com', password: 'Strong!23' });

  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, '/login');
});

// Spec semantics check: expired session should redirect to login page.
test('compliance: unauthenticated password change redirects to login', async () => {
  const response = await request(app)
    .post('/api/password')
    .send({ currentPassword: 'Strong!23', newPassword: 'NewStrong!23' });

  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, '/login');
});

// Security check: stored password should not equal submitted plaintext.
test('compliance: stored password is not plaintext', async () => {
  const email = 'secure@example.com';
  const plaintext = 'Strong!23';

  const response = await request(app)
    .post('/api/register')
    .send({ email, password: plaintext });

  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, '/login');

  const stored = await getStoredPassword(email);
  assert.ok(stored, 'Stored password must exist');
  assert.notEqual(stored, plaintext);
});

// Integrity check: no account is created for failed registration attempts.
test('compliance: failed registration attempts do not create accounts', async () => {
  let response = await request(app)
    .post('/api/register')
    .send({ email: 'bad', password: 'Strong!23' });
  assert.equal(response.statusCode, 400);
  assert.equal(await getUserCount(), 0);

  response = await request(app)
    .post('/api/register')
    .send({ email: 'weak@example.com', password: 'weak' });
  assert.equal(response.statusCode, 400);
  assert.equal(await getUserCount(), 0);

  process.env.SIMULATE_DB_FAILURE = 'true';
  response = await request(app)
    .post('/api/register')
    .send({ email: 'fail@example.com', password: 'Strong!23' });
  assert.equal(response.statusCode, 503);
  assert.equal(await getUserCount(), 0);
});

// Integrity check: failed submission attempts do not leave partial submission rows.
test('compliance: failed submission attempts do not create submission rows', async () => {
  const agent = request.agent(app);

  await agent
    .post('/api/register')
    .send({ email: 'author@example.com', password: 'Strong!23' });
  await agent
    .post('/api/login')
    .send({ email: 'author@example.com', password: 'Strong!23' });

  let response = await agent
    .post('/api/submissions')
    .send({
      metadata: {
        abstract: 'Abstract text',
        authors: 'Author One',
        keywords: 'keyword1, keyword2'
      },
      manuscriptFile: {
        filename: 'paper.pdf',
        sizeBytes: 1024
      }
    });

  assert.equal(response.statusCode, 400);
  assert.equal(await getSubmissionCount(), 0);

  process.env.SIMULATE_FILE_STORAGE_FAILURE = 'true';
  response = await agent.post('/api/submissions').send(validSubmissionPayload());
  assert.equal(response.statusCode, 503);
  assert.equal(await getSubmissionCount(), 0);
});
