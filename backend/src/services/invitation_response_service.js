const reviewAssignmentModel = require('../models/review_assignment');
const invitationResponseModel = require('../models/invitation_response');

async function respondToInvitation({ reviewAssignmentId, response }) {
  if (!['accept', 'reject'].includes(response)) {
    return { ok: false, code: 'invalid_response', message: 'Response must be accept or reject.' };
  }

  if (process.env.SIMULATE_INVITATION_INVALID === 'true') {
    return { ok: false, code: 'invalid_invitation', message: 'Invitation is no longer valid.' };
  }

  if (process.env.SIMULATE_DB_FAILURE === 'true') {
    return { ok: false, code: 'db_error', message: 'Response could not be saved.' };
  }

  let assignment;
  try {
    assignment = await reviewAssignmentModel.findAssignmentById(reviewAssignmentId);
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Response could not be saved.' };
  }

  if (!assignment) {
    return { ok: false, code: 'invalid_invitation', message: 'Invitation is no longer valid.' };
  }

  try {
    await invitationResponseModel.createInvitationResponse({ reviewAssignmentId, response });
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Response could not be saved.' };
  }

  if (process.env.SIMULATE_EDITOR_NOTIFICATION_FAILURE === 'true') {
    return {
      ok: true,
      warning: true,
      warningCode: 'notification_warning',
      message: 'Response recorded but editor notification failed.'
    };
  }

  return { ok: true };
}

module.exports = { respondToInvitation };
