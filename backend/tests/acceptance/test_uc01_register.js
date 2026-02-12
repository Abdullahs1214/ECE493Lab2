const { test, before, afterEach, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise, resetDatabase, db } = require('../helpers/test_app');

before(async () => {
  await migratePromise;
});

afterEach(async () => {
  process.env.SIMULATE_DB_FAILURE = 'false';
  process.env.PASSWORD_POLICY_AVAILABLE = 'true';
  await resetDatabase();
});


function countUsers() {
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

test('AT-UC-01-01 successful registration', async () => {
  const response = await request(app)
    .post('/api/register')
    .send({ email: 'new@example.com', password: 'Strong!23' });

  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, '/login');
  assert.equal(await countUsers(), 1);
});

test('AT-UC-01-02 invalid email format', async () => {
  const response = await request(app)
    .post('/api/register')
    .send({ email: 'bad', password: 'Strong!23' });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'invalid_email');
  assert.equal(await countUsers(), 0);
});

test('AT-UC-01-03 duplicate email', async () => {
  await request(app)
    .post('/api/register')
    .send({ email: 'dup@example.com', password: 'Strong!23' });

  const response = await request(app)
    .post('/api/register')
    .send({ email: 'dup@example.com', password: 'Strong!23' });

  assert.equal(response.statusCode, 409);
  assert.equal(response.body.error.code, 'duplicate_email');
  assert.equal(await countUsers(), 1);
});

test('AT-UC-01-04 invalid password', async () => {
  const response = await request(app)
    .post('/api/register')
    .send({ email: 'weak@example.com', password: 'weak' });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'weak_password');
  assert.equal(await countUsers(), 0);
});

test('AT-UC-01-05 system or database failure', async () => {
  process.env.SIMULATE_DB_FAILURE = 'true';
  const response = await request(app)
    .post('/api/register')
    .send({ email: 'fail@example.com', password: 'Strong!23' });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'db_error');
  assert.equal(await countUsers(), 0);
});

test('AT-UC-01-07 registration enables login', async () => {
  await request(app)
    .post('/api/register')
    .send({ email: 'ready@example.com', password: 'Strong!23' });

  const response = await request(app)
    .post('/api/login')
    .send({ email: 'ready@example.com', password: 'Strong!23' });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
});
