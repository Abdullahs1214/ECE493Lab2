const { test, before, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise, resetDatabase } = require('../helpers/test_app');

before(async () => {
  await migratePromise;
});

afterEach(async () => {
  process.env.SIMULATE_REVIEW_PERIOD_CLOSED = 'false';
  process.env.SIMULATE_REVIEW_VALIDATION_FAILURE = 'false';
  process.env.SIMULATE_EDITOR_ACCESS_FAILURE = 'false';
  process.env.SIMULATE_DB_FAILURE = 'false';
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

async function setupReviewAssignment() {
  await register('editor4@example.com');
  await register('author4@example.com');
  await register('reviewer41@example.com');

  const authorAgent = await loginAgent('author4@example.com');
  const editorAgent = await loginAgent('editor4@example.com');
  const reviewerAgent = await loginAgent('reviewer41@example.com');

  const submission = await authorAgent.post('/api/submissions').send({
    metadata: { title: 'Paper', abstract: 'A', authors: 'Au', keywords: 'k' },
    manuscriptFile: { filename: 'paper.pdf', sizeBytes: 1024 }
  });

  const db = require('../helpers/test_app').db;
  const reviewerId = await new Promise((resolve, reject) => {
    db.get('SELECT id FROM users WHERE email = ?', ['reviewer41@example.com'], (err, row) => {
      if (err) return reject(err);
      if (!row) return reject(new Error('reviewer user not found in setup'));
      resolve(row.id);
    });
  });

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

  return { reviewerAgent, editorAgent, assignmentId, submissionId: submission.body.submissionId };
}

test('submits review successfully', async () => {
  const { reviewerAgent, assignmentId } = await setupReviewAssignment();

  const response = await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: { summary: 'Good paper', recommendation: 'accept' }
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
});

test('rejects incomplete review form', async () => {
  const { reviewerAgent, assignmentId } = await setupReviewAssignment();

  const response = await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: {}
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'review_incomplete');
});

test('rejects review when period is closed', async () => {
  const { reviewerAgent, assignmentId } = await setupReviewAssignment();
  process.env.SIMULATE_REVIEW_PERIOD_CLOSED = 'true';

  const response = await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: { summary: 'Good paper', recommendation: 'accept' }
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'review_period_closed');
});

test('returns database failure when storing review fails', async () => {
  const { reviewerAgent, assignmentId } = await setupReviewAssignment();
  process.env.SIMULATE_DB_FAILURE = 'true';

  const response = await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: { summary: 'Good paper', recommendation: 'accept' }
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'db_error');
});

test('returns editor access failure when forwarding fails', async () => {
  const { reviewerAgent, assignmentId } = await setupReviewAssignment();
  process.env.SIMULATE_EDITOR_ACCESS_FAILURE = 'true';

  const response = await reviewerAgent.post('/api/reviews').send({
    reviewAssignmentId: assignmentId,
    reviewForm: { summary: 'Good paper', recommendation: 'accept' }
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'editor_access_failure');
});
