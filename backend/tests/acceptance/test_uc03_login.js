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

test('AT-UC-03-01 successful login', async () => {
  await registerUser();
  const response = await request(app)
    .post('/api/login')
    .send({ email: 'login@example.com', password: 'Strong!23' });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
});

test('AT-UC-03-02 login with nonexistent email', async () => {
  const response = await request(app)
    .post('/api/login')
    .send({ email: 'missing@example.com', password: 'Strong!23' });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error.code, 'invalid_credentials');
});

test('AT-UC-03-03 login with incorrect password', async () => {
  await registerUser();
  const response = await request(app)
    .post('/api/login')
    .send({ email: 'login@example.com', password: 'Wrong!23' });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error.code, 'invalid_credentials');
});

test('AT-UC-03-04 authentication service failure', async () => {
  process.env.SIMULATE_AUTH_FAILURE = 'true';
  const response = await request(app)
    .post('/api/login')
    .send({ email: 'login@example.com', password: 'Strong!23' });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'auth_unavailable');
});

test('AT-UC-03-05 no dashboard access on failed login', async () => {
  const agent = request.agent(app);
  await agent
    .post('/api/login')
    .send({ email: 'missing@example.com', password: 'Strong!23' });

  const response = await agent
    .post('/api/password')
    .send({ currentPassword: 'Strong!23', newPassword: 'NewStrong!23' });

  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, '/login');
});
