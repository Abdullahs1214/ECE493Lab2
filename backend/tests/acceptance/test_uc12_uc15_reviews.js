const { test, before, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise, resetDatabase, db } = require('../helpers/test_app');

before(async () => {
  await migratePromise;
});

beforeEach(() => {
  process.env.SIMULATE_AUTH_FAILURE = 'false';
  process.env.SIMULATE_REVIEW_PERIOD_CLOSED = 'false';
  process.env.SIMULATE_REVIEW_VALIDATION_FAILURE = 'false';
  process.env.SIMULATE_EDITOR_ACCESS_FAILURE = 'false';
  process.env.SIMULATE_DB_FAILURE = 'false';
  process.env.SIMULATE_EMAIL_FAILURE = 'false';
  process.env.SIMULATE_NOTIFICATION_LOG_FAILURE = 'false';
});

afterEach(async () => {
  process.env.SIMULATE_AUTH_FAILURE = 'false';
  process.env.SIMULATE_REVIEW_PERIOD_CLOSED = 'false';
  process.env.SIMULATE_REVIEW_VALIDATION_FAILURE = 'false';
  process.env.SIMULATE_EDITOR_ACCESS_FAILURE = 'false';
  process.env.SIMULATE_DB_FAILURE = 'false';
  process.env.SIMULATE_EMAIL_FAILURE = 'false';
  process.env.SIMULATE_NOTIFICATION_LOG_FAILURE = 'false';
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
      if (!row) return reject(new Error(`user not found in setup: ${email}`));
      resolve(row.id);
    });
  });
}

function setAuthorEmail(submissionId, email) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE users SET email = ? WHERE id = (SELECT user_id FROM submissions WHERE id = ?)';
    db.run(sql, [email, submissionId], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function setupReviewToDecisionContext() {
  await register('editor5@example.com');
  await register('author5@example.com');
  await register('reviewer51@example.com');

  const authorAgent = await loginAgent('author5@example.com');
  const editorAgent = await loginAgent('editor5@example.com');
  const reviewerAgent = await loginAgent('reviewer51@example.com');

  const submission = await authorAgent.post('/api/submissions').send({
    metadata: { title: 'Paper', abstract: 'A', authors: 'Au', keywords: 'k' },
    manuscriptFile: { filename: 'paper.pdf', sizeBytes: 1024 }
  });

  const reviewerId = await getUserId('reviewer51@example.com');
  const assignResponse = await editorAgent.post('/api/reviewer-assignments').send({
    submissionId: submission.body.submissionId,
    reviewerIds: [reviewerId]
  });
  if (assignResponse.statusCode !== 200 || !assignResponse.body.success) {
    throw new Error(`reviewer assignment setup failed: ${assignResponse.statusCode}`);
  }

  const assignmentId = await new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM review_assignments WHERE submission_id = ? AND reviewer_id = ? ORDER BY id DESC LIMIT 1',
      [submission.body.submissionId, reviewerId],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error('review assignment not found in setup'));
        resolve(row.id);
      }
    );
  });

  return { reviewerAgent, editorAgent, submissionId: submission.body.submissionId, assignmentId };
}

test('AT-UC-12-01 and AT-UC-13-01 successful review submission and storage', async () => {
  const { reviewerAgent, assignmentId } = await setupReviewToDecisionContext();

  const response = await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: { summary: 'Strong paper', recommendation: 'accept' }
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
});

test('AT-UC-12-02 and AT-UC-13-02 incomplete review rejected', async () => {
  const { reviewerAgent, assignmentId } = await setupReviewToDecisionContext();

  const response = await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: {}
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'review_incomplete');
});

test('AT-UC-12-03 review period closed prevents submission', async () => {
  const { reviewerAgent, assignmentId } = await setupReviewToDecisionContext();
  process.env.SIMULATE_REVIEW_PERIOD_CLOSED = 'true';

  const response = await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: { summary: 'Strong paper', recommendation: 'accept' }
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'review_period_closed');
});

test('AT-UC-12-04 and AT-UC-13-03 database failure during review storage', async () => {
  const { reviewerAgent, assignmentId } = await setupReviewToDecisionContext();
  process.env.SIMULATE_DB_FAILURE = 'true';

  const response = await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: { summary: 'Strong paper', recommendation: 'accept' }
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'db_error');
});

test('AT-UC-13-04 editor access failure', async () => {
  const { reviewerAgent, assignmentId } = await setupReviewToDecisionContext();
  process.env.SIMULATE_EDITOR_ACCESS_FAILURE = 'true';

  const response = await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: { summary: 'Strong paper', recommendation: 'accept' }
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'editor_access_failure');
});

test('AT-UC-14-01 and AT-UC-14-05 successful decision recording', async () => {
  const { reviewerAgent, editorAgent, assignmentId, submissionId } = await setupReviewToDecisionContext();

  await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: { summary: 'Strong paper', recommendation: 'accept' }
  });

  const response = await editorAgent.post('/api/decisions').send({ submissionId, decisionOutcome: 'accept' });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
});

test('AT-UC-14-02 reviews incomplete prevents decision', async () => {
  const { editorAgent, submissionId } = await setupReviewToDecisionContext();

  const response = await editorAgent.post('/api/decisions').send({ submissionId, decisionOutcome: 'accept' });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'reviews_incomplete');
});

test('AT-UC-14-03 review validation failure prevents decision', async () => {
  const { reviewerAgent, editorAgent, assignmentId, submissionId } = await setupReviewToDecisionContext();

  await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: { summary: 'Strong paper', recommendation: 'accept' }
  });

  process.env.SIMULATE_REVIEW_VALIDATION_FAILURE = 'true';
  const response = await editorAgent.post('/api/decisions').send({ submissionId, decisionOutcome: 'accept' });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'validation_failure');
});

test('AT-UC-14-04 decision database failure', async () => {
  const { reviewerAgent, editorAgent, assignmentId, submissionId } = await setupReviewToDecisionContext();

  await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: { summary: 'Strong paper', recommendation: 'accept' }
  });

  process.env.SIMULATE_DB_FAILURE = 'true';
  const response = await editorAgent.post('/api/decisions').send({ submissionId, decisionOutcome: 'accept' });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'db_error');
});

test('AT-UC-15-01 and AT-UC-15-05 successful author notification with outcome', async () => {
  const { reviewerAgent, editorAgent, assignmentId, submissionId } = await setupReviewToDecisionContext();

  await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: { summary: 'Strong paper', recommendation: 'accept' }
  });
  await editorAgent.post('/api/decisions').send({ submissionId, decisionOutcome: 'accept' });

  const response = await editorAgent.post('/api/author-notifications').send({ submissionId });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.outcome, 'accept');
});

test('AT-UC-15-02 missing author contact information', async () => {
  const { reviewerAgent, editorAgent, assignmentId, submissionId } = await setupReviewToDecisionContext();

  await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: { summary: 'Strong paper', recommendation: 'accept' }
  });
  await editorAgent.post('/api/decisions').send({ submissionId, decisionOutcome: 'accept' });
  await setAuthorEmail(submissionId, 'invalid-email');

  const response = await editorAgent.post('/api/author-notifications').send({ submissionId });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'missing_contact');
});

test('AT-UC-15-03 email system failure', async () => {
  const { reviewerAgent, editorAgent, assignmentId, submissionId } = await setupReviewToDecisionContext();

  await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: { summary: 'Strong paper', recommendation: 'accept' }
  });
  await editorAgent.post('/api/decisions').send({ submissionId, decisionOutcome: 'accept' });
  process.env.SIMULATE_EMAIL_FAILURE = 'true';

  const response = await editorAgent.post('/api/author-notifications').send({ submissionId });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'email_failure');
});

test('AT-UC-15-04 notification logging failure', async () => {
  const { reviewerAgent, editorAgent, assignmentId, submissionId } = await setupReviewToDecisionContext();

  await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: { summary: 'Strong paper', recommendation: 'accept' }
  });
  await editorAgent.post('/api/decisions').send({ submissionId, decisionOutcome: 'accept' });
  process.env.SIMULATE_NOTIFICATION_LOG_FAILURE = 'true';

  const response = await editorAgent.post('/api/author-notifications').send({ submissionId });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'logging_failure');
});
