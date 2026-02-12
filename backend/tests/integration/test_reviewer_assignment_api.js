const { test, before, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise, resetDatabase, db } = require('../helpers/test_app');

before(async () => {
  await migratePromise;
});

afterEach(async () => {
  process.env.SIMULATE_DB_FAILURE = 'false';
  process.env.SIMULATE_NO_ELIGIBLE_REVIEWERS = 'false';
  process.env.SIMULATE_WORKLOAD_DATA_FAILURE = 'false';
  process.env.SIMULATE_EMAIL_FAILURE = 'false';
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

async function createSubmissionForAuthor(authorEmail) {
  const authorAgent = await loginAgent(authorEmail);
  const response = await authorAgent.post('/api/submissions').send({
    metadata: {
      title: 'Submission',
      abstract: 'Abstract',
      authors: 'A',
      keywords: 'k'
    },
    manuscriptFile: {
      filename: 'paper.pdf',
      sizeBytes: 1024
    }
  });
  return response.body.submissionId;
}

function assignmentCountForReviewer(reviewerId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) AS count FROM review_assignments WHERE reviewer_id = ?', [reviewerId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row.count);
    });
  });
}

function notificationCountForSubmission(submissionId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) AS count FROM reviewer_notifications WHERE submission_id = ?', [submissionId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row.count);
    });
  });
}

function seedSubmissionAndAssignment(reviewerId) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN');
      for (let i = 0; i < 5; i += 1) {
        db.run(
          "INSERT INTO submissions (user_id, title, abstract, authors, keywords, manuscript_file, status) VALUES (1, 't', 'a', 'au', 'k', 'p.pdf', 'submitted')"
        );
      }
      db.all('SELECT id FROM submissions ORDER BY id DESC LIMIT 5', (selectErr, rows) => {
        if (selectErr) {
          db.run('ROLLBACK');
          reject(selectErr);
          return;
        }

        for (const row of rows) {
          db.run('INSERT INTO review_assignments (submission_id, reviewer_id) VALUES (?, ?)', [row.id, reviewerId]);
        }

        db.run('COMMIT', (commitErr) => {
          if (commitErr) {
            db.run('ROLLBACK');
            reject(commitErr);
            return;
          }
          resolve();
        });
      });
    });
  });
}

async function prepareAssignmentContext() {
  await register('editor@example.com');
  await register('author@example.com');
  await register('reviewer1@example.com');
  await register('reviewer2@example.com');

  const editorAgent = await loginAgent('editor@example.com');
  const submissionId = await createSubmissionForAuthor('author@example.com');
  const reviewer1Id = await getUserId('reviewer1@example.com');
  const reviewer2Id = await getUserId('reviewer2@example.com');

  return { editorAgent, submissionId, reviewer1Id, reviewer2Id };
}

test('stores assignments and notifies reviewers when assignment is valid', async () => {
  const { editorAgent, submissionId, reviewer1Id, reviewer2Id } = await prepareAssignmentContext();

  const response = await editorAgent.post('/api/reviewer-assignments').send({
    submissionId,
    reviewerIds: [reviewer1Id, reviewer2Id]
  });

  assert.equal(response.statusCode, 200);
  assert.equal(await assignmentCountForReviewer(reviewer1Id), 1);
  assert.equal(await assignmentCountForReviewer(reviewer2Id), 1);
  assert.equal(await notificationCountForSubmission(submissionId), 2);
});

test('returns no eligible reviewers error when no reviewers are provided', async () => {
  const { editorAgent, submissionId } = await prepareAssignmentContext();

  const response = await editorAgent.post('/api/reviewer-assignments').send({
    submissionId,
    reviewerIds: []
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'no_eligible_reviewers');
});

test('returns invalid selection error for duplicate reviewer selection', async () => {
  const { editorAgent, submissionId, reviewer1Id } = await prepareAssignmentContext();

  const response = await editorAgent.post('/api/reviewer-assignments').send({
    submissionId,
    reviewerIds: [reviewer1Id, reviewer1Id]
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'invalid_selection');
});

test('prevents assignment when reviewer workload limit is reached', async () => {
  const { editorAgent, submissionId, reviewer1Id } = await prepareAssignmentContext();
  await seedSubmissionAndAssignment(reviewer1Id);

  const response = await editorAgent.post('/api/reviewer-assignments').send({
    submissionId,
    reviewerIds: [reviewer1Id]
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'workload_limit');
});

test('prevents assignment when workload data retrieval fails', async () => {
  const { editorAgent, submissionId, reviewer1Id } = await prepareAssignmentContext();
  process.env.SIMULATE_WORKLOAD_DATA_FAILURE = 'true';

  const response = await editorAgent.post('/api/reviewer-assignments').send({
    submissionId,
    reviewerIds: [reviewer1Id]
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'workload_data_failure');
});

test('returns assignment failure on database error', async () => {
  const { editorAgent, submissionId, reviewer1Id } = await prepareAssignmentContext();
  process.env.SIMULATE_DB_FAILURE = 'true';

  const response = await editorAgent.post('/api/reviewer-assignments').send({
    submissionId,
    reviewerIds: [reviewer1Id]
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'db_error');
});

test('keeps assignments when notification system fails', async () => {
  const { editorAgent, submissionId, reviewer1Id } = await prepareAssignmentContext();
  process.env.SIMULATE_EMAIL_FAILURE = 'true';

  const response = await editorAgent.post('/api/reviewer-assignments').send({
    submissionId,
    reviewerIds: [reviewer1Id]
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.warning, 'notification_warning');
  assert.equal(await assignmentCountForReviewer(reviewer1Id), 1);
});
