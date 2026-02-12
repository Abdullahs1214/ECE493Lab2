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

test('AT-UC-04-01 successful password change', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const response = await agent
    .post('/api/password')
    .send({ currentPassword: 'Strong!23', newPassword: 'NewStrong!23' });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
});

test('AT-UC-04-02 reject incorrect current password', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const response = await agent
    .post('/api/password')
    .send({ currentPassword: 'Wrong!23', newPassword: 'NewStrong!23' });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'current_password_incorrect');
});

test('AT-UC-04-03 validation failure due to auth/db unavailability', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);
  process.env.SIMULATE_AUTH_FAILURE = 'true';

  const response = await agent
    .post('/api/password')
    .send({ currentPassword: 'Strong!23', newPassword: 'NewStrong!23' });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'auth_unavailable');
});

test('AT-UC-04-04 reject new password that fails security rules', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const response = await agent
    .post('/api/password')
    .send({ currentPassword: 'Strong!23', newPassword: 'weak' });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'weak_password');
});

test('AT-UC-04-05 password policy unavailable produces error', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);
  process.env.PASSWORD_POLICY_AVAILABLE = 'false';

  const response = await agent
    .post('/api/password')
    .send({ currentPassword: 'Strong!23', newPassword: 'NewStrong!23' });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'policy_unavailable');
});

test('AT-UC-04-06 update failure does not change stored password', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);
  process.env.SIMULATE_UPDATE_FAILURE = 'true';

  const response = await agent
    .post('/api/password')
    .send({ currentPassword: 'Strong!23', newPassword: 'NewStrong!23' });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'update_failed');
});

test('AT-UC-04-07 session expired prevents password change', async () => {
  const response = await request(app)
    .post('/api/password')
    .send({ currentPassword: 'Strong!23', newPassword: 'NewStrong!23' });

  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, '/login');
});

test('AT-UC-04-08 no login with new password unless change succeeds', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);
  process.env.SIMULATE_UPDATE_FAILURE = 'true';

  await agent
    .post('/api/password')
    .send({ currentPassword: 'Strong!23', newPassword: 'NewStrong!23' });

  const failedLogin = await request(app)
    .post('/api/login')
    .send({ email: 'pw@example.com', password: 'NewStrong!23' });

  const successLogin = await request(app)
    .post('/api/login')
    .send({ email: 'pw@example.com', password: 'Strong!23' });

  assert.equal(failedLogin.statusCode, 401);
  assert.equal(successLogin.statusCode, 200);
});
