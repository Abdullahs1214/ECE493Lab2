const { test, before, afterEach, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise, resetDatabase } = require('../helpers/test_app');

before(async () => {
  await migratePromise;
});

afterEach(async () => {
  process.env.SIMULATE_AUTH_FAILURE = 'false';
  process.env.SIMULATE_DB_FAILURE = 'false';
  process.env.SIMULATE_UPDATE_FAILURE = 'false';
  process.env.PASSWORD_POLICY_AVAILABLE = 'true';
  await resetDatabase();
});


async function registerAndLogin(agent) {
  await agent
    .post('/api/register')
    .send({ email: 'pw@example.com', password: 'Strong!23' });
  await agent
    .post('/api/login')
    .send({ email: 'pw@example.com', password: 'Strong!23' });
}

test('changes password with valid current and new password', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const response = await agent
    .post('/api/password')
    .send({ currentPassword: 'Strong!23', newPassword: 'NewStrong!23' });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
});

test('rejects incorrect current password', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const response = await agent
    .post('/api/password')
    .send({ currentPassword: 'Wrong!23', newPassword: 'NewStrong!23' });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'current_password_incorrect');
});

test('rejects when password policy unavailable', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);
  process.env.PASSWORD_POLICY_AVAILABLE = 'false';

  const response = await agent
    .post('/api/password')
    .send({ currentPassword: 'Strong!23', newPassword: 'NewStrong!23' });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'policy_unavailable');
});

test('returns error when update fails', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);
  process.env.SIMULATE_UPDATE_FAILURE = 'true';

  const response = await agent
    .post('/api/password')
    .send({ currentPassword: 'Strong!23', newPassword: 'NewStrong!23' });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'update_failed');
});

test('rejects when session expired', async () => {
  const response = await request(app)
    .post('/api/password')
    .send({ currentPassword: 'Strong!23', newPassword: 'NewStrong!23' });

  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, '/login');
});
