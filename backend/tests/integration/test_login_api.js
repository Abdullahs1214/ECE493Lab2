const { test, before, afterEach, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise, resetDatabase } = require('../helpers/test_app');

before(async () => {
  await migratePromise;
});

afterEach(async () => {
  process.env.SIMULATE_AUTH_FAILURE = 'false';
  await resetDatabase();
});


async function registerUser() {
  await request(app)
    .post('/api/register')
    .send({ email: 'login@example.com', password: 'Strong!23' });
}

test('logs in with valid credentials', async () => {
  await registerUser();
  const response = await request(app)
    .post('/api/login')
    .send({ email: 'login@example.com', password: 'Strong!23' });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
});

test('rejects nonexistent email', async () => {
  const response = await request(app)
    .post('/api/login')
    .send({ email: 'missing@example.com', password: 'Strong!23' });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error.code, 'invalid_credentials');
});

test('rejects incorrect password', async () => {
  await registerUser();
  const response = await request(app)
    .post('/api/login')
    .send({ email: 'login@example.com', password: 'Wrong!23' });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error.code, 'invalid_credentials');
});

test('returns auth error when service unavailable', async () => {
  process.env.SIMULATE_AUTH_FAILURE = 'true';
  const response = await request(app)
    .post('/api/login')
    .send({ email: 'login@example.com', password: 'Strong!23' });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'auth_unavailable');
});
