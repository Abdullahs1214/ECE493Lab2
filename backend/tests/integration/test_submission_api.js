const { test, before, afterEach, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise, resetDatabase } = require('../helpers/test_app');

before(async () => {
  await migratePromise;
});

afterEach(async () => {
  process.env.SIMULATE_DB_FAILURE = 'false';
  process.env.SIMULATE_FILE_STORAGE_FAILURE = 'false';
  await resetDatabase();
});


async function registerAndLogin(agent) {
  await agent
    .post('/api/register')
    .send({ email: 'submit@example.com', password: 'Strong!23' });
  await agent
    .post('/api/login')
    .send({ email: 'submit@example.com', password: 'Strong!23' });
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

test('submits paper with valid metadata and file', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const response = await agent.post('/api/submissions').send(validPayload());

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.ok(response.body.submissionId);
});

test('rejects missing metadata', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const payload = validPayload();
  delete payload.metadata.title;

  const response = await agent.post('/api/submissions').send(payload);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'metadata_missing');
});

test('rejects missing manuscript file', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const payload = validPayload();
  delete payload.manuscriptFile;

  const response = await agent.post('/api/submissions').send(payload);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'file_missing');
});

test('rejects invalid manuscript file format', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const payload = validPayload();
  payload.manuscriptFile.filename = 'paper.txt';

  const response = await agent.post('/api/submissions').send(payload);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'file_format');
});

test('rejects manuscript file size limit', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const payload = validPayload();
  payload.manuscriptFile.sizeBytes = 26 * 1024 * 1024;

  const response = await agent.post('/api/submissions').send(payload);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'file_size');
});

test('returns error on database failure', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);
  process.env.SIMULATE_DB_FAILURE = 'true';

  const response = await agent.post('/api/submissions').send(validPayload());

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'db_error');
});

test('returns error on file storage failure', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);
  process.env.SIMULATE_FILE_STORAGE_FAILURE = 'true';

  const response = await agent.post('/api/submissions').send(validPayload());

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'file_storage_error');
});
