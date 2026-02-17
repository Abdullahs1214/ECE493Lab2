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

function insertDecision(submissionId, outcome = 'accept') {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO decisions (submission_id, decision_outcome) VALUES (?, ?)', [submissionId, outcome], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function countScheduleItems() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) AS count FROM schedule_items', (err, row) => {
      if (err) return reject(err);
      resolve(row.count);
    });
  });
}

function hasDuplicateTimeRoom() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT time_assignment, room_assignment, COUNT(*) AS count
      FROM schedule_items
      GROUP BY time_assignment, room_assignment
      HAVING COUNT(*) > 1
      LIMIT 1
    `;
    db.get(sql, (err, row) => {
      if (err) return reject(err);
      resolve(!!row);
    });
  });
}

async function setupScheduleContext(papers = 2) {
  await register('admin6@example.com');
  await register('author6@example.com');
  const adminAgent = await loginAgent('admin6@example.com');
  const authorAgent = await loginAgent('author6@example.com');

  const submissionIds = [];
  for (let i = 0; i < papers; i += 1) {
    const response = await authorAgent.post('/api/submissions').send({
      metadata: { title: `Sched ${i}`, abstract: 'A', authors: 'Au', keywords: 'k' },
      manuscriptFile: { filename: `sched-${i}.pdf`, sizeBytes: 1024 }
    });
    submissionIds.push(response.body.submissionId);
    await insertDecision(response.body.submissionId, 'accept');
  }

  return { adminAgent, submissionIds };
}

test('AT-UC-16-01 and AT-UC-16-06 successful schedule generation and completeness', async () => {
  const { adminAgent } = await setupScheduleContext(2);

  const response = await adminAgent.post('/api/schedule/generate').send({});

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(await countScheduleItems(), 2);
});

test('AT-UC-16-02 no accepted papers', async () => {
  await register('admin6@example.com');
  const adminAgent = await loginAgent('admin6@example.com');

  const response = await adminAgent.post('/api/schedule/generate').send({});

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'no_accepted_papers');
});

test('AT-UC-16-03 no scheduling resources', async () => {
  const { adminAgent } = await setupScheduleContext(1);
  process.env.SIMULATE_NO_SCHEDULING_RESOURCES = 'true';

  const response = await adminAgent.post('/api/schedule/generate').send({});

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'no_resources');
});

test('AT-UC-16-04 unsatisfied constraints', async () => {
  const { adminAgent } = await setupScheduleContext(1);
  process.env.SIMULATE_UNSATISFIED_CONSTRAINTS = 'true';

  const response = await adminAgent.post('/api/schedule/generate').send({});

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'unsatisfied_constraints');
});

test('AT-UC-16-05 database failure', async () => {
  const { adminAgent } = await setupScheduleContext(1);
  process.env.SIMULATE_DB_FAILURE = 'true';

  const response = await adminAgent.post('/api/schedule/generate').send({});

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'db_error');
});

test('AT-UC-17-01 and AT-UC-17-05 successful schedule modification and integrity', async () => {
  const { adminAgent, submissionIds } = await setupScheduleContext(2);
  await adminAgent.post('/api/schedule/generate').send({});

  const response = await adminAgent.post('/api/schedule/modify').send({
    items: [{ submissionId: submissionIds[0], timeAssignment: '16:00', roomAssignment: 'Room C' }]
  });

  assert.equal(response.statusCode, 200);
  assert.equal(await hasDuplicateTimeRoom(), false);
});

test('AT-UC-17-02 conflict introduced', async () => {
  const { adminAgent, submissionIds } = await setupScheduleContext(2);
  await adminAgent.post('/api/schedule/generate').send({});

  const response = await adminAgent.post('/api/schedule/modify').send({
    items: [
      { submissionId: submissionIds[0], timeAssignment: '09:00', roomAssignment: 'Room A' },
      { submissionId: submissionIds[1], timeAssignment: '09:00', roomAssignment: 'Room A' }
    ]
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'conflict');
});

test('AT-UC-17-03 constraint violation', async () => {
  const { adminAgent, submissionIds } = await setupScheduleContext(1);
  await adminAgent.post('/api/schedule/generate').send({});
  process.env.SIMULATE_SCHEDULE_CONSTRAINT_VIOLATION = 'true';

  const response = await adminAgent.post('/api/schedule/modify').send({
    items: [{ submissionId: submissionIds[0], timeAssignment: '14:00', roomAssignment: 'Room B' }]
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'constraint_violation');
});

test('AT-UC-17-04 database failure on save', async () => {
  const { adminAgent, submissionIds } = await setupScheduleContext(1);
  await adminAgent.post('/api/schedule/generate').send({});
  process.env.SIMULATE_DB_FAILURE = 'true';

  const response = await adminAgent.post('/api/schedule/modify').send({
    items: [{ submissionId: submissionIds[0], timeAssignment: '14:00', roomAssignment: 'Room B' }]
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'db_error');
});

test('AT-UC-18-01 and AT-UC-18-05 successful schedule publication and visibility', async () => {
  const { adminAgent } = await setupScheduleContext(1);
  await adminAgent.post('/api/schedule/generate').send({});

  const response = await adminAgent.post('/api/schedule/publish').send({});

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.published, true);
  assert.equal(response.body.visibleToAuthors, true);
});

test('AT-UC-18-02 schedule retrieval failure', async () => {
  const { adminAgent } = await setupScheduleContext(1);
  await adminAgent.post('/api/schedule/generate').send({});
  process.env.SIMULATE_SCHEDULE_RETRIEVAL_FAILURE = 'true';

  const response = await adminAgent.post('/api/schedule/publish').send({});

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'retrieval_failure');
});

test('AT-UC-18-03 web publishing failure', async () => {
  const { adminAgent } = await setupScheduleContext(1);
  await adminAgent.post('/api/schedule/generate').send({});
  process.env.SIMULATE_WEB_PUBLISH_FAILURE = 'true';

  const response = await adminAgent.post('/api/schedule/publish').send({});

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'publishing_failure');
});

test('AT-UC-18-04 author access failure', async () => {
  const { adminAgent } = await setupScheduleContext(1);
  await adminAgent.post('/api/schedule/generate').send({});
  process.env.SIMULATE_AUTHOR_ACCESS_FAILURE = 'true';

  const response = await adminAgent.post('/api/schedule/publish').send({});

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'author_access_failure');
});
