const { test, before, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise, resetDatabase, db } = require('../helpers/test_app');

before(async () => {
  await migratePromise;
});

afterEach(async () => {
  process.env.SIMULATE_DB_FAILURE = 'false';
  process.env.SIMULATE_WORKLOAD_DATA_FAILURE = 'false';
  process.env.SIMULATE_EMAIL_FAILURE = 'false';
  process.env.SIMULATE_EDITOR_NOTIFICATION_FAILURE = 'false';
  process.env.SIMULATE_INVITATION_INVALID = 'false';
  process.env.SIMULATE_AUTH_FAILURE = 'false';
  await resetDatabase();
});

async function register(email) {
  await request(app).post('/api/register').send({ email, password: 'Strong!23' });
}

async function loginAgent(email) {
  const agent = request.agent(app);
  const loginResponse = await agent.post('/api/login').send({ email, password: 'Strong!23' });
  assert.equal(loginResponse.statusCode, 200);
  assert.equal(loginResponse.body.success, true);
  return agent;
}

function getUserId(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
      if (err) return reject(err);
      resolve(row.id);
    });
  });
}

function getLastAssignmentId(submissionId, reviewerId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM review_assignments WHERE submission_id = ? AND reviewer_id = ? ORDER BY id DESC LIMIT 1',
      [submissionId, reviewerId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row ? row.id : null);
      }
    );
  });
}

function getInvitationResponse(assignmentId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT response FROM invitation_responses WHERE review_assignment_id = ? ORDER BY id DESC LIMIT 1',
      [assignmentId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row ? row.response : null);
      }
    );
  });
}

function seedFiveAssignments(reviewerId) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN');
      for (let i = 0; i < 5; i += 1) {
        db.run(
          "INSERT INTO submissions (user_id, title, abstract, authors, keywords, manuscript_file, status) VALUES (1, 't', 'a', 'au', 'k', 'p.pdf', 'submitted')"
        );
      }
      db.all('SELECT id FROM submissions ORDER BY id DESC LIMIT 5', (selErr, rows) => {
        if (selErr) {
          db.run('ROLLBACK');
          return reject(selErr);
        }
        for (const row of rows) {
          db.run('INSERT INTO review_assignments (submission_id, reviewer_id) VALUES (?, ?)', [row.id, reviewerId]);
        }
        db.run('COMMIT', (commitErr) => {
          if (commitErr) {
            db.run('ROLLBACK');
            return reject(commitErr);
          }
          resolve();
        });
      });
    });
  });
}

async function setupAssignmentContext() {
  await register('editor3@example.com');
  await register('author3@example.com');
  await register('reviewer31@example.com');

  const authorAgent = await loginAgent('author3@example.com');
  const editorAgent = await loginAgent('editor3@example.com');
  const reviewerId = await getUserId('reviewer31@example.com');

  const submissionResponse = await authorAgent.post('/api/submissions').send({
    metadata: { title: 'Paper', abstract: 'A', authors: 'Au', keywords: 'k' },
    manuscriptFile: { filename: 'paper.pdf', sizeBytes: 1024 }
  });

  return { editorAgent, reviewerId, submissionId: submissionResponse.body.submissionId };
}

test('AT-UC-08-01 and AT-UC-11-01 accept invitation flow', async () => {
  const { editorAgent, reviewerId, submissionId } = await setupAssignmentContext();

  const assign = await editorAgent.post('/api/reviewer-assignments').send({ submissionId, reviewerIds: [reviewerId] });
  assert.equal(assign.statusCode, 200);

  const assignmentId = await getLastAssignmentId(submissionId, reviewerId);
  const reviewerAgent = await loginAgent('reviewer31@example.com');
  const response = await reviewerAgent
    .post(`/api/reviewer-invitations/${assignmentId}/response`)
    .send({ response: 'accept' });

  assert.equal(response.statusCode, 200);
  assert.equal(await getInvitationResponse(assignmentId), 'accept');
});

test('AT-UC-11-02 reject invitation flow', async () => {
  const { editorAgent, reviewerId, submissionId } = await setupAssignmentContext();
  await editorAgent.post('/api/reviewer-assignments').send({ submissionId, reviewerIds: [reviewerId] });
  const assignmentId = await getLastAssignmentId(submissionId, reviewerId);

  const reviewerAgent = await loginAgent('reviewer31@example.com');
  const response = await reviewerAgent
    .post(`/api/reviewer-invitations/${assignmentId}/response`)
    .send({ response: 'reject' });

  assert.equal(response.statusCode, 200);
  assert.equal(await getInvitationResponse(assignmentId), 'reject');
});

test('AT-UC-11-03 invitation expired or withdrawn', async () => {
  const { editorAgent, reviewerId, submissionId } = await setupAssignmentContext();
  await editorAgent.post('/api/reviewer-assignments').send({ submissionId, reviewerIds: [reviewerId] });
  const assignmentId = await getLastAssignmentId(submissionId, reviewerId);

  process.env.SIMULATE_INVITATION_INVALID = 'true';
  const reviewerAgent = await loginAgent('reviewer31@example.com');
  const response = await reviewerAgent
    .post(`/api/reviewer-invitations/${assignmentId}/response`)
    .send({ response: 'accept' });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'invalid_invitation');
});

test('AT-UC-11-04 database failure while recording response', async () => {
  const { editorAgent, reviewerId, submissionId } = await setupAssignmentContext();
  await editorAgent.post('/api/reviewer-assignments').send({ submissionId, reviewerIds: [reviewerId] });
  const assignmentId = await getLastAssignmentId(submissionId, reviewerId);

  process.env.SIMULATE_DB_FAILURE = 'true';
  const reviewerAgent = await loginAgent('reviewer31@example.com');
  const response = await reviewerAgent
    .post(`/api/reviewer-invitations/${assignmentId}/response`)
    .send({ response: 'accept' });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'db_error');
});

test('AT-UC-11-05 notification failure keeps response recorded', async () => {
  const { editorAgent, reviewerId, submissionId } = await setupAssignmentContext();
  await editorAgent.post('/api/reviewer-assignments').send({ submissionId, reviewerIds: [reviewerId] });
  const assignmentId = await getLastAssignmentId(submissionId, reviewerId);

  process.env.SIMULATE_EDITOR_NOTIFICATION_FAILURE = 'true';
  const reviewerAgent = await loginAgent('reviewer31@example.com');
  const response = await reviewerAgent
    .post(`/api/reviewer-invitations/${assignmentId}/response`)
    .send({ response: 'accept' });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.warning, 'notification_warning');
  assert.equal(await getInvitationResponse(assignmentId), 'accept');
});

test('AT-UC-09-02 workload limit violation prevents over-assignment', async () => {
  const { editorAgent, reviewerId, submissionId } = await setupAssignmentContext();
  await seedFiveAssignments(reviewerId);

  const response = await editorAgent
    .post('/api/reviewer-assignments')
    .send({ submissionId, reviewerIds: [reviewerId] });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'workload_limit');
});
