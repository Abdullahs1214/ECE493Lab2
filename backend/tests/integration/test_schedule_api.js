const { test, before, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise, resetDatabase, db } = require('../helpers/test_app');

before(async () => {
  await migratePromise;
});

afterEach(async () => {
  process.env.SIMULATE_DB_FAILURE = 'false';
  process.env.SIMULATE_NO_SCHEDULING_RESOURCES = 'false';
  process.env.SIMULATE_UNSATISFIED_CONSTRAINTS = 'false';
  process.env.SIMULATE_SCHEDULE_CONSTRAINT_VIOLATION = 'false';
  process.env.SIMULATE_SCHEDULE_RETRIEVAL_FAILURE = 'false';
  process.env.SIMULATE_WEB_PUBLISH_FAILURE = 'false';
  process.env.SIMULATE_AUTHOR_ACCESS_FAILURE = 'false';
  await resetDatabase();
});

async function register(email) {
  await request(app).post('/api/register').send({ email, password: 'Strong!23' });
}

async function loginAgent(email) {
  const agent = request.agent(app);
  await agent.post('/api/login').send({ email, password: 'Strong!23' });
  return agent;
}

function getUserId(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
      if (err) return reject(err);
      if (!row) return reject(new Error(`user missing for ${email}`));
      resolve(row.id);
    });
  });
}

function getScheduleItems() {
  return new Promise((resolve, reject) => {
    db.all('SELECT submission_id, time_assignment, room_assignment FROM schedule_items ORDER BY id', (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function insertAcceptDecision(submissionId) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO decisions (submission_id, decision_outcome) VALUES (?, ?)', [submissionId, 'accept'], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function setupAcceptedSubmissions(count = 2) {
  await register('admin-schedule@example.com');
  await register('author-schedule@example.com');
  const adminAgent = await loginAgent('admin-schedule@example.com');
  const authorAgent = await loginAgent('author-schedule@example.com');

  const createdIds = [];
  for (let i = 0; i < count; i += 1) {
    const response = await authorAgent.post('/api/submissions').send({
      metadata: {
        title: `Paper ${i + 1}`,
        abstract: 'A',
        authors: 'Author',
        keywords: 'k'
      },
      manuscriptFile: { filename: `paper-${i + 1}.pdf`, sizeBytes: 1024 }
    });
    createdIds.push(response.body.submissionId);
    await insertAcceptDecision(response.body.submissionId);
  }

  return { adminAgent, submissionIds: createdIds };
}

test('generates schedule successfully', async () => {
  const { adminAgent, submissionIds } = await setupAcceptedSubmissions(2);

  const response = await adminAgent.post('/api/schedule/generate').send({});

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.generatedCount, submissionIds.length);
  const items = await getScheduleItems();
  assert.equal(items.length, submissionIds.length);
});

test('returns no accepted papers when none are available', async () => {
  await register('admin-schedule@example.com');
  const adminAgent = await loginAgent('admin-schedule@example.com');

  const response = await adminAgent.post('/api/schedule/generate').send({});

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'no_accepted_papers');
});

test('returns no scheduling resources error', async () => {
  const { adminAgent } = await setupAcceptedSubmissions(1);
  process.env.SIMULATE_NO_SCHEDULING_RESOURCES = 'true';

  const response = await adminAgent.post('/api/schedule/generate').send({});

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'no_resources');
});

test('returns unsatisfied constraints error', async () => {
  const { adminAgent } = await setupAcceptedSubmissions(1);
  process.env.SIMULATE_UNSATISFIED_CONSTRAINTS = 'true';

  const response = await adminAgent.post('/api/schedule/generate').send({});

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'unsatisfied_constraints');
});

test('returns db error when schedule generation fails', async () => {
  const { adminAgent } = await setupAcceptedSubmissions(1);
  process.env.SIMULATE_DB_FAILURE = 'true';

  const response = await adminAgent.post('/api/schedule/generate').send({});

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'db_error');
});

test('modifies schedule successfully', async () => {
  const { adminAgent } = await setupAcceptedSubmissions(2);
  await adminAgent.post('/api/schedule/generate').send({});
  const beforeItems = await getScheduleItems();

  const response = await adminAgent.post('/api/schedule/modify').send({
    items: [
      {
        submissionId: beforeItems[0].submission_id,
        timeAssignment: '16:00',
        roomAssignment: 'Room C'
      }
    ]
  });

  assert.equal(response.statusCode, 200);
  const afterItems = await getScheduleItems();
  const updated = afterItems.find((item) => item.submission_id === beforeItems[0].submission_id);
  assert.equal(updated.time_assignment, '16:00');
  assert.equal(updated.room_assignment, 'Room C');
});

test('prevents schedule modification with conflicts', async () => {
  const { adminAgent } = await setupAcceptedSubmissions(2);
  await adminAgent.post('/api/schedule/generate').send({});
  const beforeItems = await getScheduleItems();

  const response = await adminAgent.post('/api/schedule/modify').send({
    items: [
      {
        submissionId: beforeItems[0].submission_id,
        timeAssignment: '11:00',
        roomAssignment: 'Room A'
      },
      {
        submissionId: beforeItems[1].submission_id,
        timeAssignment: '11:00',
        roomAssignment: 'Room A'
      }
    ]
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'conflict');
});

test('prevents schedule modification on constraint violation', async () => {
  const { adminAgent } = await setupAcceptedSubmissions(1);
  await adminAgent.post('/api/schedule/generate').send({});
  const beforeItems = await getScheduleItems();
  process.env.SIMULATE_SCHEDULE_CONSTRAINT_VIOLATION = 'true';

  const response = await adminAgent.post('/api/schedule/modify').send({
    items: [
      {
        submissionId: beforeItems[0].submission_id,
        timeAssignment: '14:00',
        roomAssignment: 'Room B'
      }
    ]
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'constraint_violation');
});

test('returns db error on schedule modification failure', async () => {
  const { adminAgent } = await setupAcceptedSubmissions(1);
  await adminAgent.post('/api/schedule/generate').send({});
  const beforeItems = await getScheduleItems();
  process.env.SIMULATE_DB_FAILURE = 'true';

  const response = await adminAgent.post('/api/schedule/modify').send({
    items: [
      {
        submissionId: beforeItems[0].submission_id,
        timeAssignment: '14:00',
        roomAssignment: 'Room B'
      }
    ]
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'db_error');
});

test('publishes schedule successfully', async () => {
  const { adminAgent } = await setupAcceptedSubmissions(1);
  await adminAgent.post('/api/schedule/generate').send({});

  const response = await adminAgent.post('/api/schedule/publish').send({});

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.published, true);
  assert.equal(response.body.visibleToAuthors, true);
});

test('returns retrieval failure when schedule cannot be loaded', async () => {
  await register('admin-schedule@example.com');
  const adminAgent = await loginAgent('admin-schedule@example.com');
  process.env.SIMULATE_SCHEDULE_RETRIEVAL_FAILURE = 'true';

  const response = await adminAgent.post('/api/schedule/publish').send({});

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'retrieval_failure');
});

test('returns publishing failure when web publish fails', async () => {
  const { adminAgent } = await setupAcceptedSubmissions(1);
  await adminAgent.post('/api/schedule/generate').send({});
  process.env.SIMULATE_WEB_PUBLISH_FAILURE = 'true';

  const response = await adminAgent.post('/api/schedule/publish').send({});

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'publishing_failure');
});

test('returns author access failure when author visibility update fails', async () => {
  const { adminAgent } = await setupAcceptedSubmissions(1);
  await adminAgent.post('/api/schedule/generate').send({});
  process.env.SIMULATE_AUTHOR_ACCESS_FAILURE = 'true';

  const response = await adminAgent.post('/api/schedule/publish').send({});

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'author_access_failure');
});
