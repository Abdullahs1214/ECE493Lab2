const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise } = require('../helpers/test_app');

before(async () => {
  await migratePromise;
});

test('returns structured 404 for unknown API endpoint', async () => {
  const response = await request(app).get('/api/not-a-route');

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error.code, 'endpoint_not_found');
});

test('returns structured 400 for malformed JSON payload', async () => {
  const response = await request(app)
    .post('/api/login')
    .set('Content-Type', 'application/json')
    .send('{"email":"a@example.com",');

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'invalid_json');
});
