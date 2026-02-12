const assignmentModel = require('../models/review_assignment');
const userModel = require('../models/user');
const reviewerNotificationService = require('./reviewer_notification_service');

const MAX_REVIEWER_WORKLOAD = 5;

function hasDuplicates(ids) {
  return new Set(ids).size !== ids.length;
}

async function assignReviewers({ submissionId, reviewerIds }) {
  if (!Number.isInteger(submissionId) || submissionId <= 0) {
    return { ok: false, code: 'invalid_selection', message: 'Reviewer selection is invalid.' };
  }

  if (!Array.isArray(reviewerIds) || reviewerIds.length === 0) {
    return { ok: false, code: 'no_eligible_reviewers', message: 'No eligible reviewers available.' };
  }

  if (process.env.SIMULATE_NO_ELIGIBLE_REVIEWERS === 'true') {
    return { ok: false, code: 'no_eligible_reviewers', message: 'No eligible reviewers available.' };
  }

  if (hasDuplicates(reviewerIds)) {
    return { ok: false, code: 'invalid_selection', message: 'Reviewer selection is invalid.' };
  }

  if (reviewerIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    return { ok: false, code: 'invalid_selection', message: 'Reviewer selection is invalid.' };
  }

  if (process.env.SIMULATE_DB_FAILURE === 'true') {
    return { ok: false, code: 'db_error', message: 'Assignment failure.' };
  }

  let users;
  try {
    users = await userModel.findUsersByIds(reviewerIds);
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Assignment failure.' };
  }

  if (users.length !== reviewerIds.length) {
    return { ok: false, code: 'invalid_selection', message: 'Reviewer selection is invalid.' };
  }

  for (const reviewerId of reviewerIds) {
    if (process.env.SIMULATE_WORKLOAD_DATA_FAILURE === 'true') {
      return { ok: false, code: 'workload_data_failure', message: 'Assignment failure.' };
    }

    let assignmentCount;
    try {
      assignmentCount = await assignmentModel.countAssignmentsForReviewer(reviewerId);
    } catch (err) {
      return { ok: false, code: 'workload_data_failure', message: 'Assignment failure.' };
    }

    if (assignmentCount >= MAX_REVIEWER_WORKLOAD) {
      return { ok: false, code: 'workload_limit', message: 'Reviewer exceeds workload limit.' };
    }
  }

  try {
    await assignmentModel.createAssignments({ submissionId, reviewerIds });
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Assignment failure.' };
  }

  const notifyResult = await reviewerNotificationService.notifyReviewers({ submissionId, reviewerIds });
  if (!notifyResult.ok) {
    return {
      ok: true,
      warning: true,
      warningCode: 'notification_warning',
      message: 'Assignments recorded but reviewer notification failed.'
    };
  }

  return { ok: true };
}

module.exports = { assignReviewers, MAX_REVIEWER_WORKLOAD };
