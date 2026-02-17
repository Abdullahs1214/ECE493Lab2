const db = require('../models/db');
const { isValidEmail } = require('./validation');
const decisionService = require('./decision_service');

function findSubmissionWithAuthor(submissionId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT s.id AS submission_id, s.user_id AS author_id, u.email AS author_email
      FROM submissions s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = ?
    `;
    db.get(sql, [submissionId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

function createAuthorNotification({ submissionId, authorId, outcome }) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO author_notifications (submission_id, author_id, outcome) VALUES (?, ?, ?)',
      [submissionId, authorId, outcome],
      function onInsert(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: this.lastID });
      }
    );
  });
}

async function notifyAuthors({ submissionId }) {
  if (process.env.SIMULATE_DB_FAILURE === 'true') {
    return { ok: false, code: 'db_error', message: 'Notification logging failure.' };
  }

  let decision;
  try {
    decision = await decisionService.getDecisionBySubmissionId(submissionId);
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Notification logging failure.' };
  }

  if (!decision) {
    return { ok: false, code: 'decision_missing', message: 'No decision recorded for this submission.' };
  }

  let submission;
  try {
    submission = await findSubmissionWithAuthor(submissionId);
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Notification logging failure.' };
  }

  if (!submission || !isValidEmail(submission.author_email)) {
    return { ok: false, code: 'missing_contact', message: 'Missing author contact information.' };
  }

  if (process.env.SIMULATE_EMAIL_FAILURE === 'true') {
    return { ok: false, code: 'email_failure', message: 'Email system failure.' };
  }

  if (process.env.SIMULATE_NOTIFICATION_LOG_FAILURE === 'true') {
    return { ok: false, code: 'logging_failure', message: 'Notification logging failure.' };
  }

  try {
    await createAuthorNotification({
      submissionId,
      authorId: submission.author_id,
      outcome: decision.decision_outcome
    });
  } catch (err) {
    return { ok: false, code: 'logging_failure', message: 'Notification logging failure.' };
  }

  return { ok: true, notified: 1, outcome: decision.decision_outcome };
}

module.exports = { notifyAuthors };
