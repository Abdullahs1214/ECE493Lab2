const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

const db = require('../../src/models/db');

const authService = require('../../src/services/auth_service');
const authorNotificationService = require('../../src/services/author_notification_service');
const decisionService = require('../../src/services/decision_service');
const invitationResponseService = require('../../src/services/invitation_response_service');
const paymentService = require('../../src/services/payment_service');
const reviewService = require('../../src/services/review_service');
const reviewerAssignmentService = require('../../src/services/reviewer_assignment_service');
const reviewerNotificationService = require('../../src/services/reviewer_notification_service');
const scheduleService = require('../../src/services/schedule_service');
const submissionService = require('../../src/services/submission_service');
const userService = require('../../src/services/user_service');
const validation = require('../../src/services/validation');

const userModel = require('../../src/models/user');
const assignmentModel = require('../../src/models/review_assignment');
const reviewModel = require('../../src/models/review');
const invitationResponseModel = require('../../src/models/invitation_response');
const paymentModel = require('../../src/models/payment');
const ticketModel = require('../../src/models/ticket');
const scheduleItemModel = require('../../src/models/schedule_item');
const submissionModel = require('../../src/models/submission');
const reviewerNotificationModel = require('../../src/models/reviewer_notification');

const decisionSvc = require('../../src/services/decision_service');

const originals = {
  dbGet: db.get,
  dbRun: db.run,
  dbAll: db.all,
  compare: bcrypt.compare,
  hash: bcrypt.hash,
  userFindByEmail: userModel.findByEmail,
  userCreateUser: userModel.createUser,
  userFindUsersByIds: userModel.findUsersByIds,
  userUpdatePassword: userModel.updatePassword,
  assignmentFindById: assignmentModel.findAssignmentById,
  assignmentCountReviewer: assignmentModel.countAssignmentsForReviewer,
  assignmentCountSubmission: assignmentModel.countAssignmentsForSubmission,
  assignmentCreate: assignmentModel.createAssignments,
  reviewCreate: reviewModel.createReview,
  reviewCountSubmission: reviewModel.countReviewsForSubmission,
  invitationCreate: invitationResponseModel.createInvitationResponse,
  paymentGetLatest: paymentModel.getLatestPaymentByUserId,
  paymentCreate: paymentModel.createPayment,
  ticketCreate: ticketModel.createTicket,
  scheduleClear: scheduleItemModel.clearScheduleItems,
  scheduleCreate: scheduleItemModel.createScheduleItem,
  scheduleUpdate: scheduleItemModel.updateScheduleItemBySubmissionId,
  scheduleGetAll: scheduleItemModel.getAllScheduleItems,
  submissionCreate: submissionModel.createSubmission,
  submissionCreateDraft: submissionModel.createDraft,
  submissionUpdateDraft: submissionModel.updateDraftById,
  reviewerCreateNotification: reviewerNotificationModel.createNotification,
  decisionGetBySubmission: decisionSvc.getDecisionBySubmissionId
};

function resetEnv() {
  delete process.env.SIMULATE_AUTH_FAILURE;
  delete process.env.SIMULATE_DB_FAILURE;
  delete process.env.SIMULATE_EDITOR_ACCESS_FAILURE;
  delete process.env.SIMULATE_REVIEW_VALIDATION_FAILURE;
  delete process.env.SIMULATE_REVIEW_PERIOD_CLOSED;
  delete process.env.SIMULATE_INVITATION_INVALID;
  delete process.env.SIMULATE_EDITOR_NOTIFICATION_FAILURE;
  delete process.env.SIMULATE_EMAIL_FAILURE;
  delete process.env.SIMULATE_NOTIFICATION_LOG_FAILURE;
  delete process.env.SIMULATE_NO_ELIGIBLE_REVIEWERS;
  delete process.env.SIMULATE_WORKLOAD_DATA_FAILURE;
  delete process.env.SIMULATE_PAYMENT_REJECTED;
  delete process.env.SIMULATE_PAYMENT_GATEWAY_UNAVAILABLE;
  delete process.env.SIMULATE_TICKET_GENERATION_FAILURE;
  delete process.env.SIMULATE_STORAGE_FAILURE;
  delete process.env.SIMULATE_NO_SCHEDULING_RESOURCES;
  delete process.env.SIMULATE_UNSATISFIED_CONSTRAINTS;
  delete process.env.SIMULATE_SCHEDULE_CONSTRAINT_VIOLATION;
  delete process.env.SIMULATE_SCHEDULE_RETRIEVAL_FAILURE;
  delete process.env.SIMULATE_WEB_PUBLISH_FAILURE;
  delete process.env.SIMULATE_AUTHOR_ACCESS_FAILURE;
  delete process.env.SIMULATE_FILE_STORAGE_FAILURE;
  delete process.env.SIMULATE_VALIDATION_FAILURE;
  process.env.PASSWORD_POLICY_AVAILABLE = 'true';
}

afterEach(() => {
  db.get = originals.dbGet;
  db.run = originals.dbRun;
  db.all = originals.dbAll;
  bcrypt.compare = originals.compare;
  bcrypt.hash = originals.hash;
  userModel.findByEmail = originals.userFindByEmail;
  userModel.createUser = originals.userCreateUser;
  userModel.findUsersByIds = originals.userFindUsersByIds;
  userModel.updatePassword = originals.userUpdatePassword;
  assignmentModel.findAssignmentById = originals.assignmentFindById;
  assignmentModel.countAssignmentsForReviewer = originals.assignmentCountReviewer;
  assignmentModel.countAssignmentsForSubmission = originals.assignmentCountSubmission;
  assignmentModel.createAssignments = originals.assignmentCreate;
  reviewModel.createReview = originals.reviewCreate;
  reviewModel.countReviewsForSubmission = originals.reviewCountSubmission;
  invitationResponseModel.createInvitationResponse = originals.invitationCreate;
  paymentModel.getLatestPaymentByUserId = originals.paymentGetLatest;
  paymentModel.createPayment = originals.paymentCreate;
  ticketModel.createTicket = originals.ticketCreate;
  scheduleItemModel.clearScheduleItems = originals.scheduleClear;
  scheduleItemModel.createScheduleItem = originals.scheduleCreate;
  scheduleItemModel.updateScheduleItemBySubmissionId = originals.scheduleUpdate;
  scheduleItemModel.getAllScheduleItems = originals.scheduleGetAll;
  submissionModel.createSubmission = originals.submissionCreate;
  submissionModel.createDraft = originals.submissionCreateDraft;
  submissionModel.updateDraftById = originals.submissionUpdateDraft;
  reviewerNotificationModel.createNotification = originals.reviewerCreateNotification;
  decisionSvc.getDecisionBySubmissionId = originals.decisionGetBySubmission;
  resetEnv();
});

test('auth_service catches DB errors in changePassword', async () => {
  db.get = (_sql, _params, cb) => cb(new Error('db')); 
  const result = await authService.changePassword(1, 'Strong!23', 'NewStrong!23');
  assert.equal(result.code, 'db_error');
});

test('auth_service changePassword handles simulated db failure flag', async () => {
  process.env.SIMULATE_DB_FAILURE = 'true';
  const result = await authService.changePassword(1, 'Strong!23', 'NewStrong!23');
  assert.equal(result.code, 'db_error');
});

test('auth_service login catch branch', async () => {
  userModel.findByEmail = async () => {
    throw new Error('db');
  };
  const result = await authService.login('a@b.com', 'x');
  assert.equal(result.code, 'auth_unavailable');
});

test('auth_service returns current_password_incorrect when user missing', async () => {
  db.get = (_sql, _params, cb) => cb(null, null);
  const result = await authService.changePassword(1, 'Strong!23', 'NewStrong!23');
  assert.equal(result.code, 'current_password_incorrect');
});

test('auth_service changePassword update failure branches', async () => {
  db.get = (_sql, _params, cb) => cb(null, { id: 1, email: 'a@b.com', password: 'hash' });
  bcrypt.compare = async () => true;
  userModel.updatePassword = async () => false;
  let result = await authService.changePassword(1, 'Strong!23', 'NewStrong!23');
  assert.equal(result.code, 'update_failed');

  userModel.updatePassword = async () => {
    throw new Error('db');
  };
  result = await authService.changePassword(1, 'Strong!23', 'NewStrong!23');
  assert.equal(result.code, 'db_error');
});

test('author_notification_service covers db and logging failure branches', async () => {
  decisionSvc.getDecisionBySubmissionId = async () => ({ decision_outcome: 'accept' });
  db.get = (_sql, _params, cb) => cb(new Error('db'));
  let result = await authorNotificationService.notifyAuthors({ submissionId: 1 });
  assert.equal(result.code, 'db_error');

  db.get = (_sql, _params, cb) => cb(null, { submission_id: 1, author_id: 1, author_email: 'a@b.com' });
  db.run = (_sql, _params, cb) => cb(new Error('write'));
  result = await authorNotificationService.notifyAuthors({ submissionId: 1 });
  assert.equal(result.code, 'logging_failure');
});

test('author_notification_service covers env and decision branches', async () => {
  process.env.SIMULATE_DB_FAILURE = 'true';
  let result = await authorNotificationService.notifyAuthors({ submissionId: 1 });
  assert.equal(result.code, 'db_error');

  process.env.SIMULATE_DB_FAILURE = 'false';
  decisionSvc.getDecisionBySubmissionId = async () => {
    throw new Error('db');
  };
  result = await authorNotificationService.notifyAuthors({ submissionId: 1 });
  assert.equal(result.code, 'db_error');

  decisionSvc.getDecisionBySubmissionId = async () => null;
  result = await authorNotificationService.notifyAuthors({ submissionId: 1 });
  assert.equal(result.code, 'decision_missing');

  decisionSvc.getDecisionBySubmissionId = async () => ({ decision_outcome: 'accept' });
  db.get = (_sql, _params, cb) => cb(null, undefined);
  result = await authorNotificationService.notifyAuthors({ submissionId: 1 });
  assert.equal(result.code, 'missing_contact');
});

test('decision_service covers validation and createDecision failures', async () => {
  assignmentModel.countAssignmentsForSubmission = async () => { throw new Error('x'); };
  let result = await decisionService.recordDecision({ submissionId: 1, decisionOutcome: 'accept' });
  assert.equal(result.code, 'validation_failure');

  assignmentModel.countAssignmentsForSubmission = async () => 1;
  reviewModel.countReviewsForSubmission = async () => 1;
  db.run = (_sql, _params, cb) => cb(new Error('insert'));
  result = await decisionService.recordDecision({ submissionId: 1, decisionOutcome: 'accept' });
  assert.equal(result.code, 'db_error');
});

test('decision_service helper and invalid decision branches', async () => {
  db.get = (_sql, _params, cb) => cb(new Error('db'));
  await assert.rejects(decisionService.getDecisionBySubmissionId(1), /db/);

  db.get = (_sql, _params, cb) => cb(null, undefined);
  const row = await decisionService.getDecisionBySubmissionId(1);
  assert.equal(row, null);

  const result = await decisionService.recordDecision({ submissionId: 1, decisionOutcome: 'maybe' });
  assert.equal(result.code, 'invalid_decision');
});

test('invitation_response_service covers invalid and db branches', async () => {
  let result = await invitationResponseService.respondToInvitation({ reviewAssignmentId: 1, response: 'maybe' });
  assert.equal(result.code, 'invalid_response');

  assignmentModel.findAssignmentById = async () => { throw new Error('db'); };
  result = await invitationResponseService.respondToInvitation({ reviewAssignmentId: 1, response: 'accept' });
  assert.equal(result.code, 'db_error');

  assignmentModel.findAssignmentById = async () => null;
  result = await invitationResponseService.respondToInvitation({ reviewAssignmentId: 1, response: 'accept' });
  assert.equal(result.code, 'invalid_invitation');

  assignmentModel.findAssignmentById = async () => ({ id: 1 });
  invitationResponseModel.createInvitationResponse = async () => {
    throw new Error('db');
  };
  result = await invitationResponseService.respondToInvitation({ reviewAssignmentId: 1, response: 'accept' });
  assert.equal(result.code, 'db_error');
});

test('payment_service covers payment_required and storage catch branches', async () => {
  paymentModel.getLatestPaymentByUserId = async () => null;
  let result = await paymentService.issueTicket({ userId: 1 });
  assert.equal(result.code, 'payment_required');

  paymentModel.getLatestPaymentByUserId = async () => { throw new Error('db'); };
  result = await paymentService.issueTicket({ userId: 1 });
  assert.equal(result.code, 'storage_failure');

  paymentModel.getLatestPaymentByUserId = async () => ({ payment_confirmation: 'c' });
  ticketModel.createTicket = async () => { throw new Error('db'); };
  result = await paymentService.issueTicket({ userId: 1 });
  assert.equal(result.code, 'storage_failure');
});

test('payment_service covers hasPaymentInformation and createPayment catch', async () => {
  let result = await paymentService.processPayment({ userId: 1, paymentInformation: '' });
  assert.equal(result.code, 'invalid_payment_info');

  result = await paymentService.processPayment({ userId: 1, paymentInformation: 1234 });
  assert.equal(result.code, 'invalid_payment_info');

  paymentModel.createPayment = async () => {
    throw new Error('db');
  };
  result = await paymentService.processPayment({ userId: 1, paymentInformation: { card: 'x' } });
  assert.equal(result.code, 'db_error');

  paymentModel.createPayment = async () => ({ id: 5 });
  result = await paymentService.processPayment({ userId: 1, paymentInformation: 'card-token' });
  assert.equal(result.ok, true);
});

test('review_service covers db and invalid assignment branches', async () => {
  assignmentModel.findAssignmentById = async () => { throw new Error('db'); };
  let result = await reviewService.submitReview({ reviewAssignmentId: 1, reviewForm: { s: 'x' } });
  assert.equal(result.code, 'db_error');

  assignmentModel.findAssignmentById = async () => null;
  result = await reviewService.submitReview({ reviewAssignmentId: 1, reviewForm: { s: 'x' } });
  assert.equal(result.code, 'invalid_review_submission');

  assignmentModel.findAssignmentById = async () => ({ submission_id: 1 });
  reviewModel.createReview = async () => { throw new Error('db'); };
  result = await reviewService.submitReview({ reviewAssignmentId: 1, reviewForm: { s: 'x' } });
  assert.equal(result.code, 'db_error');
});

test('review_service covers form and validation branches', async () => {
  let result = await reviewService.submitReview({ reviewAssignmentId: 1, reviewForm: null });
  assert.equal(result.code, 'review_incomplete');

  process.env.SIMULATE_REVIEW_VALIDATION_FAILURE = 'true';
  result = await reviewService.submitReview({ reviewAssignmentId: 1, reviewForm: { summary: 'x' } });
  assert.equal(result.code, 'invalid_review_submission');
});

test('reviewer_assignment_service covers validation and failure branches', async () => {
  let result = await reviewerAssignmentService.assignReviewers({ submissionId: 1, reviewerIds: [0] });
  assert.equal(result.code, 'invalid_selection');

  userModel.findUsersByIds = async () => { throw new Error('db'); };
  result = await reviewerAssignmentService.assignReviewers({ submissionId: 1, reviewerIds: [1] });
  assert.equal(result.code, 'db_error');

  userModel.findUsersByIds = async () => [];
  result = await reviewerAssignmentService.assignReviewers({ submissionId: 1, reviewerIds: [1] });
  assert.equal(result.code, 'invalid_selection');

  userModel.findUsersByIds = async () => [{ id: 1, email: 'a@b.com' }];
  assignmentModel.countAssignmentsForReviewer = async () => { throw new Error('db'); };
  result = await reviewerAssignmentService.assignReviewers({ submissionId: 1, reviewerIds: [1] });
  assert.equal(result.code, 'workload_data_failure');

  assignmentModel.countAssignmentsForReviewer = async () => 0;
  assignmentModel.createAssignments = async () => { throw new Error('db'); };
  result = await reviewerAssignmentService.assignReviewers({ submissionId: 1, reviewerIds: [1] });
  assert.equal(result.code, 'db_error');

  result = await reviewerAssignmentService.assignReviewers({ submissionId: 0, reviewerIds: [1] });
  assert.equal(result.code, 'invalid_selection');

  process.env.SIMULATE_NO_ELIGIBLE_REVIEWERS = 'true';
  result = await reviewerAssignmentService.assignReviewers({ submissionId: 1, reviewerIds: [1] });
  assert.equal(result.code, 'no_eligible_reviewers');
});

test('reviewer_notification_service covers db and logging catch', async () => {
  userModel.findUsersByIds = async () => { throw new Error('db'); };
  let result = await reviewerNotificationService.notifyReviewers({ submissionId: 1, reviewerIds: [1] });
  assert.equal(result.code, 'db_error');

  userModel.findUsersByIds = async () => [{ id: 1, email: 'a@b.com' }];
  reviewerNotificationModel.createNotification = async () => { throw new Error('log'); };
  result = await reviewerNotificationService.notifyReviewers({ submissionId: 1, reviewerIds: [1] });
  assert.equal(result.code, 'logging_failure');
});

test('schedule_service covers retrieval and update catch branches', async () => {
  db.all = (_sql, cb) => cb(new Error('db'));
  let result = await scheduleService.generateSchedule();
  assert.equal(result.code, 'db_error');

  scheduleItemModel.updateScheduleItemBySubmissionId = async () => ({ updated: false });
  result = await scheduleService.modifySchedule({ items: [{ submissionId: 1, timeAssignment: '9', roomAssignment: 'A' }] });
  assert.equal(result.code, 'invalid_modification');

  scheduleItemModel.updateScheduleItemBySubmissionId = async () => { throw new Error('db'); };
  result = await scheduleService.modifySchedule({ items: [{ submissionId: 1, timeAssignment: '9', roomAssignment: 'A' }] });
  assert.equal(result.code, 'db_error');

  scheduleItemModel.getAllScheduleItems = async () => { throw new Error('db'); };
  result = await scheduleService.publishSchedule();
  assert.equal(result.code, 'retrieval_failure');

  scheduleItemModel.getAllScheduleItems = async () => [];
  result = await scheduleService.publishSchedule();
  assert.equal(result.code, 'retrieval_failure');
});

test('schedule_service covers input and capacity branches', async () => {
  const tooMany = new Array(13).fill(0).map((_, i) => i + 1);
  db.all = (_sql, cb) => cb(null, tooMany.map((id) => ({ submission_id: id })));
  let result = await scheduleService.generateSchedule();
  assert.equal(result.code, 'unsatisfied_constraints');

  scheduleItemModel.clearScheduleItems = async () => {
    throw new Error('db');
  };
  db.all = (_sql, cb) => cb(null, [{ submission_id: 1 }]);
  result = await scheduleService.generateSchedule();
  assert.equal(result.code, 'db_error');

  result = await scheduleService.modifySchedule({ items: [] });
  assert.equal(result.code, 'invalid_modification');

  result = await scheduleService.modifySchedule({ items: [{ submissionId: 0, timeAssignment: '9', roomAssignment: 'A' }] });
  assert.equal(result.code, 'invalid_modification');

  db.all = (_sql, cb) => cb(null, undefined);
  result = await scheduleService.generateSchedule();
  assert.equal(result.code, 'no_accepted_papers');
});

test('submission_service and user_service catch branches', async () => {
  submissionModel.createSubmission = async () => { throw new Error('db'); };
  let result = await submissionService.submitSubmission({
    userId: 1,
    metadata: { title: 'T', abstract: 'A', authors: 'AU', keywords: 'K' },
    manuscriptFile: { filename: 'a.pdf', sizeBytes: 100 }
  });
  assert.equal(result.code, 'db_error');

  submissionModel.createDraft = async () => { throw new Error('db'); };
  result = await submissionService.saveDraft({ submissionId: 'new', userId: 1, metadata: { title: 'x' }, manuscriptFile: null });
  assert.equal(result.code, 'db_error');

  submissionModel.updateDraftById = async () => ({ updated: false });
  result = await submissionService.saveDraft({ submissionId: 5, userId: 1, metadata: { title: 'x' }, manuscriptFile: null });
  assert.equal(result.code, 'draft_not_found');

  submissionModel.updateDraftById = async () => ({ updated: true });
  result = await submissionService.saveDraft({ submissionId: 5, userId: 1, metadata: { title: 'x' }, manuscriptFile: null });
  assert.equal(result.ok, true);

  userModel.findByEmail = async () => { throw new Error('db'); };
  result = await userService.validateRegistration('a@b.com', 'Strong!23');
  assert.equal(result.code, 'db_error');

  userModel.findByEmail = async () => null;
  userModel.createUser = async () => { throw new Error('db'); };
  result = await userService.registerUser('a@b.com', 'Strong!23');
  assert.equal(result.code, 'db_error');

  process.env.SIMULATE_DB_FAILURE = 'false';
  userModel.findByEmail = async () => {
    process.env.SIMULATE_DB_FAILURE = 'true';
    return null;
  };
  result = await userService.registerUser('a@b.com', 'Strong!23');
  assert.equal(result.code, 'db_error');
});

test('validation service covers remaining branches', () => {
  assert.equal(validation.isValidEmail(123), false);

  let result = validation.validatePassword(null);
  assert.equal(result.code, 'invalid_password');

  result = validation.validatePassword('NoNumber!');
  assert.equal(result.code, 'weak_password');

  result = validation.validatePassword('NoSymbol1');
  assert.equal(result.code, 'weak_password');

  result = validation.validatePassword('Password1!');
  assert.equal(result.code, 'weak_password');

  result = validation.validatePassword('alllower1!');
  assert.equal(result.code, 'weak_password');

  result = validation.validateMetadata(null);
  assert.equal(result.code, 'metadata_missing');

  result = validation.validateMetadata('bad');
  assert.equal(result.code, 'metadata_missing');

  result = validation.validateMetadata({ title: 't', abstract: 'a', authors: 3, keywords: 'k' });
  assert.equal(result.code, 'field_invalid');

  result = validation.validateManuscriptFile({ filename: '', sizeBytes: 'x' });
  assert.equal(result.code, 'file_invalid');
});
