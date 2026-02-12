const { test, before, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise, resetDatabase, db } = require('../helpers/test_app');

before(async () => {
  await migratePromise;
});

afterEach(async () => {
  process.env.SIMULATE_EMAIL_FAILURE = 'false';
  process.env.SIMULATE_NOTIFICATION_LOG_FAILURE = 'false';
  await resetDatabase();
});

async function register(email) {
  await request(app)
    .post('/api/register')
    .send({ email, password: 'Strong!23' });
}

async function loginAgent(email) {
  const agent = request.agent(app);
  await agent
    .post('/api/login')
    .send({ email, password: 'Strong!23' });
  return agent;
}

function getUserId(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row.id);
    });
  });
}

function setReviewerEmail(reviewerId, email) {
  return new Promise((resolve, reject) => {
    db.run('UPDATE users SET email = ? WHERE id = ?', [email, reviewerId], (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function notificationCountForReviewer(reviewerId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) AS count FROM reviewer_notifications WHERE reviewer_id = ?', [reviewerId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row.count);
    });
  });
}

async function prepareNotifyContext() {
  await register('editor-notify@example.com');
  await register('author-notify@example.com');
  await register('reviewer-notify@example.com');

  const authorAgent = await loginAgent('author-notify@example.com');
  const submissionResponse = await authorAgent.post('/api/submissions').send({
    metadata: {
      title: 'Notify Submission',
      abstract: 'A',
      authors: 'Author',
      keywords: 'k'
    },
    manuscriptFile: {
      filename: 'notify.pdf',
      sizeBytes: 1024
    }
  });

  const editorAgent = await loginAgent('editor-notify@example.com');
  const reviewerId = await getUserId('reviewer-notify@example.com');
  return { editorAgent, reviewerId, submissionId: submissionResponse.body.submissionId };
}

test('AT-UC-10-01 successful reviewer notification', async () => {
  const { editorAgent, reviewerId, submissionId } = await prepareNotifyContext();

  const response = await editorAgent.post('/api/reviewers/notify').send({
    submissionId,
    reviewerIds: [reviewerId]
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(await notificationCountForReviewer(reviewerId), 1);
});

test('AT-UC-10-02 missing email address', async () => {
  const { editorAgent, reviewerId, submissionId } = await prepareNotifyContext();
  await setReviewerEmail(reviewerId, 'invalid-email');

  const response = await editorAgent.post('/api/reviewers/notify').send({
    submissionId,
    reviewerIds: [reviewerId]
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'missing_email');
});

test('AT-UC-10-03 email system failure', async () => {
  const { editorAgent, reviewerId, submissionId } = await prepareNotifyContext();
  process.env.SIMULATE_EMAIL_FAILURE = 'true';

  const response = await editorAgent.post('/api/reviewers/notify').send({
    submissionId,
    reviewerIds: [reviewerId]
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'email_failure');
});

test('AT-UC-10-04 notification logging failure', async () => {
  const { editorAgent, reviewerId, submissionId } = await prepareNotifyContext();
  process.env.SIMULATE_NOTIFICATION_LOG_FAILURE = 'true';

  const response = await editorAgent.post('/api/reviewers/notify').send({
    submissionId,
    reviewerIds: [reviewerId]
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'logging_failure');
});

test('AT-UC-10-05 notification enables response workflow', async () => {
  const { editorAgent, reviewerId, submissionId } = await prepareNotifyContext();

  const response = await editorAgent.post('/api/reviewers/notify').send({
    submissionId,
    reviewerIds: [reviewerId]
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.notified, 1);
  assert.equal(await notificationCountForReviewer(reviewerId), 1);
});
