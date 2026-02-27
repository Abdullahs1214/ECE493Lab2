const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const authService = require('../../src/services/auth_service');
const userService = require('../../src/services/user_service');
const submissionService = require('../../src/services/submission_service');
const reviewerAssignmentService = require('../../src/services/reviewer_assignment_service');
const reviewerNotificationService = require('../../src/services/reviewer_notification_service');
const invitationResponseService = require('../../src/services/invitation_response_service');
const reviewService = require('../../src/services/review_service');
const decisionService = require('../../src/services/decision_service');
const authorNotificationService = require('../../src/services/author_notification_service');
const scheduleService = require('../../src/services/schedule_service');
const paymentService = require('../../src/services/payment_service');

const authRoutes = require('../../src/routes/auth');
const notificationsRoutes = require('../../src/routes/notifications');
const paymentsRoutes = require('../../src/routes/payments');
const reviewersRoutes = require('../../src/routes/reviewers');
const reviewsRoutes = require('../../src/routes/reviews');
const scheduleRoutes = require('../../src/routes/schedule');
const submissionsRoutes = require('../../src/routes/submissions');

const original = {
  login: authService.login,
  changePassword: authService.changePassword,
  registerUser: userService.registerUser,
  submitSubmission: submissionService.submitSubmission,
  saveDraft: submissionService.saveDraft,
  validateSubmissionData: submissionService.validateSubmissionData,
  assignReviewers: reviewerAssignmentService.assignReviewers,
  notifyReviewers: reviewerNotificationService.notifyReviewers,
  respondToInvitation: invitationResponseService.respondToInvitation,
  submitReview: reviewService.submitReview,
  recordDecision: decisionService.recordDecision,
  notifyAuthors: authorNotificationService.notifyAuthors,
  modifySchedule: scheduleService.modifySchedule,
  processPayment: paymentService.processPayment
};

function getPostHandler(router, path) {
  const layer = router.stack.find((entry) => entry.route && entry.route.path === path && entry.route.methods.post);
  return layer.route.stack[layer.route.stack.length - 1].handle;
}

function createRes() {
  return {
    statusCode: 200,
    body: null,
    redirected: false,
    redirectStatus: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    redirect(status, _path) {
      this.redirected = true;
      this.redirectStatus = status;
      return this;
    }
  };
}

afterEach(() => {
  authService.login = original.login;
  authService.changePassword = original.changePassword;
  userService.registerUser = original.registerUser;
  submissionService.submitSubmission = original.submitSubmission;
  submissionService.saveDraft = original.saveDraft;
  submissionService.validateSubmissionData = original.validateSubmissionData;
  reviewerAssignmentService.assignReviewers = original.assignReviewers;
  reviewerNotificationService.notifyReviewers = original.notifyReviewers;
  invitationResponseService.respondToInvitation = original.respondToInvitation;
  reviewService.submitReview = original.submitReview;
  decisionService.recordDecision = original.recordDecision;
  authorNotificationService.notifyAuthors = original.notifyAuthors;
  scheduleService.modifySchedule = original.modifySchedule;
  paymentService.processPayment = original.processPayment;
});

test('route handlers execute req.body fallback branches with undefined body', async () => {
  const registerHandler = getPostHandler(authRoutes, '/register');
  let res = createRes();
  await registerHandler({ body: undefined }, res);
  assert.equal(res.statusCode, 400);

  const loginHandler = getPostHandler(authRoutes, '/login');
  res = createRes();
  await loginHandler({ body: undefined }, res);
  assert.equal(res.statusCode, 400);

  const passwordHandler = getPostHandler(authRoutes, '/password');
  res = createRes();
  await passwordHandler({ body: undefined, session: { userId: 1 } }, res);
  assert.equal(res.statusCode, 400);

  submissionService.submitSubmission = async () => ({ ok: false, code: 'unknown', message: 'x' });
  const submitHandler = getPostHandler(submissionsRoutes, '/submissions');
  res = createRes();
  await submitHandler({ body: undefined, session: { userId: 1 } }, res);
  assert.equal(res.statusCode, 400);

  submissionService.saveDraft = async () => ({ ok: false, code: 'unknown', message: 'x' });
  const draftHandler = getPostHandler(submissionsRoutes, '/submissions/:id/draft');
  res = createRes();
  await draftHandler({ body: undefined, params: { id: 'new' }, session: { userId: 1 } }, res);
  assert.equal(res.statusCode, 400);

  submissionService.validateSubmissionData = async () => ({ ok: false, code: 'unknown', message: 'x' });
  const validateHandler = getPostHandler(submissionsRoutes, '/submissions/validate');
  res = createRes();
  await validateHandler({ body: undefined, session: { userId: 1 } }, res);
  assert.equal(res.statusCode, 400);

  reviewerAssignmentService.assignReviewers = async () => ({ ok: false, code: 'unknown', message: 'x' });
  const assignHandler = getPostHandler(reviewersRoutes, '/reviewer-assignments');
  res = createRes();
  await assignHandler({ body: undefined, session: { userId: 1 } }, res);
  assert.equal(res.statusCode, 400);

  reviewerNotificationService.notifyReviewers = async () => ({ ok: false, code: 'unknown', message: 'x' });
  const notifyHandler = getPostHandler(reviewersRoutes, '/reviewers/notify');
  res = createRes();
  await notifyHandler({ body: undefined, session: { userId: 1 } }, res);
  assert.equal(res.statusCode, 400);

  invitationResponseService.respondToInvitation = async () => ({ ok: false, code: 'unknown', message: 'x' });
  const invitationHandler = getPostHandler(reviewersRoutes, '/reviewer-invitations/:id/response');
  res = createRes();
  await invitationHandler({ body: undefined, params: { id: '1' }, session: { userId: 1 } }, res);
  assert.equal(res.statusCode, 400);

  reviewService.submitReview = async () => ({ ok: false, code: 'unknown', message: 'x' });
  const reviewHandler = getPostHandler(reviewsRoutes, '/reviews');
  res = createRes();
  await reviewHandler({ body: undefined, session: { userId: 1 } }, res);
  assert.equal(res.statusCode, 400);

  decisionService.recordDecision = async () => ({ ok: false, code: 'unknown', message: 'x' });
  const decisionHandler = getPostHandler(reviewsRoutes, '/decisions');
  res = createRes();
  await decisionHandler({ body: undefined, session: { userId: 1 } }, res);
  assert.equal(res.statusCode, 400);

  authorNotificationService.notifyAuthors = async () => ({ ok: false, code: 'unknown', message: 'x' });
  const authorNotifyHandler = getPostHandler(notificationsRoutes, '/author-notifications');
  res = createRes();
  await authorNotifyHandler({ body: undefined, session: { userId: 1 } }, res);
  assert.equal(res.statusCode, 400);

  scheduleService.modifySchedule = async () => ({ ok: false, code: 'unknown', message: 'x' });
  const modifyScheduleHandler = getPostHandler(scheduleRoutes, '/schedule/modify');
  res = createRes();
  await modifyScheduleHandler({ body: undefined, session: { userId: 1 } }, res);
  assert.equal(res.statusCode, 400);

  paymentService.processPayment = async () => ({ ok: false, code: 'unknown', message: 'x' });
  const processPaymentHandler = getPostHandler(paymentsRoutes, '/payments');
  res = createRes();
  await processPaymentHandler({ body: undefined, session: { userId: 1 } }, res);
  assert.equal(res.statusCode, 400);
});
