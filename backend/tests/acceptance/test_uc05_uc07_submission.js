const { test, before, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise, resetDatabase, db } = require('../helpers/test_app');

before(async () => {
  await migratePromise;
});

afterEach(async () => {
  process.env.SIMULATE_VALIDATION_FAILURE = 'false';
  await resetDatabase();
});

async function registerAndLogin(agent) {
  await agent
    .post('/api/register')
    .send({ email: 'uc07-author@example.com', password: 'Strong!23' });
  await agent
    .post('/api/login')
    .send({ email: 'uc07-author@example.com', password: 'Strong!23' });
}

function validPayload() {
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

function submissionCount() {
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

test('AT-UC-07-01 successful validation allows processing', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const response = await agent.post('/api/submissions/validate').send(validPayload());
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.valid, true);
});

test('AT-UC-07-02 missing required fields halt processing', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const payload = validPayload();
  delete payload.metadata.title;
  const response = await agent.post('/api/submissions/validate').send(payload);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'metadata_missing');
});

test('AT-UC-07-03 invalid field values halt processing', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const payload = validPayload();
  payload.metadata.authors = 42;
  const response = await agent.post('/api/submissions/validate').send(payload);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'field_invalid');
});

test('AT-UC-07-04 invalid file format halts processing', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const payload = validPayload();
  payload.manuscriptFile.filename = 'paper.txt';
  const response = await agent.post('/api/submissions/validate').send(payload);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'file_format');
});

test('AT-UC-07-05 file size exceeded halts processing', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const payload = validPayload();
  payload.manuscriptFile.sizeBytes = 26 * 1024 * 1024;
  const response = await agent.post('/api/submissions/validate').send(payload);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'file_size');
});

test('AT-UC-07-06 validation system failure halts processing', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);
  process.env.SIMULATE_VALIDATION_FAILURE = 'true';

  const response = await agent.post('/api/submissions/validate').send(validPayload());

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'validation_failure');
});

test('AT-UC-07-07 no partial acceptance on validation failure', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const payload = validPayload();
  delete payload.metadata.title;
  const response = await agent.post('/api/submissions/validate').send(payload);

  assert.equal(response.statusCode, 400);
  assert.equal(await submissionCount(), 0);
});
