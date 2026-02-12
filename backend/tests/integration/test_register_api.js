const { test, before, afterEach, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise, resetDatabase } = require('../helpers/test_app');

before(async () => {
  await migratePromise;
});

afterEach(async () => {
  process.env.SIMULATE_DB_FAILURE = 'false';
  process.env.PASSWORD_POLICY_AVAILABLE = 'true';
  await resetDatabase();
});


test('registers a new user with valid credentials', async () => {
  const response = await request(app)
    .post('/api/register')
    .send({ email: 'user@example.com', password: 'Strong!23' });

  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, '/login');
});

test('rejects invalid email format', async () => {
  const response = await request(app)
    .post('/api/register')
    .send({ email: 'invalid-email', password: 'Strong!23' });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'invalid_email');
});

test('rejects duplicate email', async () => {
  await request(app)
    .post('/api/register')
    .send({ email: 'dup@example.com', password: 'Strong!23' });

  const response = await request(app)
    .post('/api/register')
    .send({ email: 'dup@example.com', password: 'Strong!23' });

  assert.equal(response.statusCode, 409);
  assert.equal(response.body.error.code, 'duplicate_email');
});

test('rejects weak password', async () => {
  const response = await request(app)
    .post('/api/register')
    .send({ email: 'user2@example.com', password: 'weak' });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'weak_password');
});

test('returns error on database failure', async () => {
  process.env.SIMULATE_DB_FAILURE = 'true';
  const response = await request(app)
    .post('/api/register')
    .send({ email: 'user3@example.com', password: 'Strong!23' });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'db_error');
});
