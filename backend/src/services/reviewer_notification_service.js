const { isValidEmail } = require('./validation');
const userModel = require('../models/user');
const notificationModel = require('../models/reviewer_notification');

async function notifyReviewers({ submissionId, reviewerIds }) {
  if (process.env.SIMULATE_EMAIL_FAILURE === 'true') {
    return { ok: false, code: 'email_failure', message: 'Email system failure.' };
  }

  let users;
  try {
    users = await userModel.findUsersByIds(reviewerIds);
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Database unavailable.' };
  }

  const usersById = new Map(users.map((u) => [u.id, u]));
  for (const reviewerId of reviewerIds) {
    const user = usersById.get(reviewerId);
    if (!user || !isValidEmail(user.email)) {
      return { ok: false, code: 'missing_email', message: 'Reviewer email missing or invalid.' };
    }
  }

  if (process.env.SIMULATE_NOTIFICATION_LOG_FAILURE === 'true') {
    return { ok: false, code: 'logging_failure', message: 'Notification logging failed.' };
  }

  try {
    for (const reviewerId of reviewerIds) {
      await notificationModel.createNotification({ submissionId, reviewerId });
    }
  } catch (err) {
    return { ok: false, code: 'logging_failure', message: 'Notification logging failed.' };
  }

  return { ok: true, notified: reviewerIds.length };
}

module.exports = { notifyReviewers };
