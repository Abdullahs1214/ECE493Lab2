const { test, before, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise, resetDatabase, db } = require('../helpers/test_app');

before(async () => {
  await migratePromise;
});

afterEach(async () => {
  process.env.SIMULATE_DB_FAILURE = 'false';
  process.env.SIMULATE_FILE_STORAGE_FAILURE = 'false';
  await resetDatabase();
});

async function registerAndLogin(agent, email = 'draft-author@example.com') {
  await agent
    .post('/api/register')
    .send({ email, password: 'Strong!23' });
  await agent
    .post('/api/login')
    .send({ email, password: 'Strong!23' });
}

function getDraftById(submissionId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, title, manuscript_file, status FROM submissions WHERE id = ?', [submissionId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

test('saves draft with sufficient information', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const response = await agent
    .post('/api/submissions/new/draft')
    .send({ metadata: { title: 'Draft Title' } });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.status, 'draft');
});

test('rejects draft when insufficient information provided', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const response = await agent
    .post('/api/submissions/new/draft')
    .send({ metadata: {}, manuscriptFile: null });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'draft_insufficient');
});

test('returns error on draft metadata storage failure', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);
  process.env.SIMULATE_DB_FAILURE = 'true';

  const response = await agent
    .post('/api/submissions/new/draft')
    .send({ metadata: { title: 'Draft Title' } });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'db_error');
});

test('returns error on draft file storage failure', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);
  process.env.SIMULATE_FILE_STORAGE_FAILURE = 'true';

  const response = await agent
    .post('/api/submissions/new/draft')
    .send({ metadata: { title: 'Draft Title' }, manuscriptFile: { filename: 'draft.pdf', sizeBytes: 1024 } });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'file_storage_error');
});

test('saved draft data is retrievable for later edit', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const response = await agent
    .post('/api/submissions/new/draft')
    .send({ metadata: { title: 'Draft A' }, manuscriptFile: { filename: 'draft.pdf', sizeBytes: 1024 } });

  assert.equal(response.statusCode, 200);
  const draft = await getDraftById(response.body.submissionId);
  assert.equal(draft.status, 'draft');
  assert.equal(draft.title, 'Draft A');
  assert.equal(draft.manuscript_file, 'draft.pdf');
});
