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

async function registerAndLogin(agent) {
  await agent
    .post('/api/register')
    .send({ email: 'uc06-author@example.com', password: 'Strong!23' });
  await agent
    .post('/api/login')
    .send({ email: 'uc06-author@example.com', password: 'Strong!23' });
}

function getDraft(submissionId) {
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

test('AT-UC-06-01 successful draft save', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const response = await agent
    .post('/api/submissions/new/draft')
    .send({ metadata: { title: 'Draft UC06', abstract: 'A' } });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.status, 'draft');
});

test('AT-UC-06-02 insufficient draft information', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const response = await agent
    .post('/api/submissions/new/draft')
    .send({ metadata: {}, manuscriptFile: null });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'draft_insufficient');
});

test('AT-UC-06-03 database failure', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);
  process.env.SIMULATE_DB_FAILURE = 'true';

  const response = await agent
    .post('/api/submissions/new/draft')
    .send({ metadata: { title: 'Draft UC06' } });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'db_error');
});

test('AT-UC-06-04 file storage failure', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);
  process.env.SIMULATE_FILE_STORAGE_FAILURE = 'true';

  const response = await agent
    .post('/api/submissions/new/draft')
    .send({ metadata: { title: 'Draft UC06' }, manuscriptFile: { filename: 'draft.pdf', sizeBytes: 1024 } });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'file_storage_error');
});

test('AT-UC-06-05 draft retrieval integrity', async () => {
  const agent = request.agent(app);
  await registerAndLogin(agent);

  const response = await agent
    .post('/api/submissions/new/draft')
    .send({ metadata: { title: 'Draft Keep' }, manuscriptFile: { filename: 'keep.pdf', sizeBytes: 1024 } });

  const draft = await getDraft(response.body.submissionId);
  assert.equal(draft.status, 'draft');
  assert.equal(draft.title, 'Draft Keep');
  assert.equal(draft.manuscript_file, 'keep.pdf');
});
