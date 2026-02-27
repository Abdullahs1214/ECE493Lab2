const { test, before, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise, resetDatabase } = require('../helpers/test_app');

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
const pricingModel = require('../../src/models/pricing');

const originals = {
  authLogin: authService.login,
  authChange: authService.changePassword,
  userRegister: userService.registerUser,
  submit: submissionService.submitSubmission,
  draft: submissionService.saveDraft,
  validate: submissionService.validateSubmissionData,
  assign: reviewerAssignmentService.assignReviewers,
  notify: reviewerNotificationService.notifyReviewers,
  invitation: invitationResponseService.respondToInvitation,
  review: reviewService.submitReview,
  decision: decisionService.recordDecision,
  authorNotify: authorNotificationService.notifyAuthors,
  schedGenerate: scheduleService.generateSchedule,
  schedModify: scheduleService.modifySchedule,
  schedPublish: scheduleService.publishSchedule,
  pay: paymentService.processPayment,
  ticket: paymentService.issueTicket,
  pricingGet: pricingModel.getCurrentPricing
};

before(async () => {
  await migratePromise;
});

afterEach(async () => {
  authService.login = originals.authLogin;
  authService.changePassword = originals.authChange;
  userService.registerUser = originals.userRegister;
  submissionService.submitSubmission = originals.submit;
  submissionService.saveDraft = originals.draft;
  submissionService.validateSubmissionData = originals.validate;
  reviewerAssignmentService.assignReviewers = originals.assign;
  reviewerNotificationService.notifyReviewers = originals.notify;
  invitationResponseService.respondToInvitation = originals.invitation;
  reviewService.submitReview = originals.review;
  decisionService.recordDecision = originals.decision;
  authorNotificationService.notifyAuthors = originals.authorNotify;
  scheduleService.generateSchedule = originals.schedGenerate;
  scheduleService.modifySchedule = originals.schedModify;
  scheduleService.publishSchedule = originals.schedPublish;
  paymentService.processPayment = originals.pay;
  paymentService.issueTicket = originals.ticket;
  pricingModel.getCurrentPricing = originals.pricingGet;
  await resetDatabase();
});

async function loginAgent() {
  await request(app).post('/api/register').send({ email: 'fallback@example.com', password: 'Strong!23' });
  const agent = request.agent(app);
  await agent.post('/api/login').send({ email: 'fallback@example.com', password: 'Strong!23' });
  return agent;
}

test('auth routes cover invalid_request and fallback status mapping', async () => {
  let response = await request(app).post('/api/register').send({ email: 'x@example.com' });
  assert.equal(response.statusCode, 400);

  userService.registerUser = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await request(app).post('/api/register').send({ email: 'x@example.com', password: 'Strong!23' });
  assert.equal(response.statusCode, 400);

  response = await request(app).post('/api/login').send({ email: 'x@example.com' });
  assert.equal(response.statusCode, 400);

  authService.login = async () => ({ ok: false, code: 'weird', message: 'x' });
  response = await request(app).post('/api/login').send({ email: 'x@example.com', password: 'Strong!23' });
  assert.equal(response.statusCode, 503);

  userService.registerUser = originals.userRegister;
  authService.login = originals.authLogin;
  const agent = await loginAgent();
  response = await agent.post('/api/password').send({ currentPassword: 'a' });
  assert.equal(response.statusCode, 400);

  authService.changePassword = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/password').send({ currentPassword: 'Strong!23', newPassword: 'NewStrong!23' });
  assert.equal(response.statusCode, 400);
});

test('submission/reviewer/review/schedule/payment routes cover fallback status maps', async () => {
  const agent = await loginAgent();

  submissionService.submitSubmission = async () => ({ ok: false, code: 'unknown', message: 'x' });
  let response = await agent.post('/api/submissions').send({});
  assert.equal(response.statusCode, 400);

  submissionService.saveDraft = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/submissions/new/draft').send({ metadata: { title: 'x' } });
  assert.equal(response.statusCode, 400);

  submissionService.validateSubmissionData = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/submissions/validate').send({});
  assert.equal(response.statusCode, 400);

  reviewerAssignmentService.assignReviewers = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/reviewer-assignments').send({ submissionId: 1, reviewerIds: [1] });
  assert.equal(response.statusCode, 400);

  reviewerNotificationService.notifyReviewers = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/reviewers/notify').send({ submissionId: 1, reviewerIds: [1] });
  assert.equal(response.statusCode, 400);

  invitationResponseService.respondToInvitation = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/reviewer-invitations/1/response').send({ response: 'accept' });
  assert.equal(response.statusCode, 400);

  reviewService.submitReview = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/reviews').send({ reviewAssignmentId: 1, reviewForm: { s: 'x' } });
  assert.equal(response.statusCode, 400);

  decisionService.recordDecision = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/decisions').send({ submissionId: 1, decisionOutcome: 'accept' });
  assert.equal(response.statusCode, 400);

  authorNotificationService.notifyAuthors = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/author-notifications').send({ submissionId: 1 });
  assert.equal(response.statusCode, 400);

  scheduleService.generateSchedule = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/schedule/generate').send({});
  assert.equal(response.statusCode, 400);

  scheduleService.modifySchedule = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/schedule/modify').send({ items: [] });
  assert.equal(response.statusCode, 400);

  scheduleService.publishSchedule = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/schedule/publish').send({});
  assert.equal(response.statusCode, 400);

  paymentService.processPayment = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/payments').send({ paymentInformation: { x: 'y' } });
  assert.equal(response.statusCode, 400);

  paymentService.issueTicket = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/tickets').send({});
  assert.equal(response.statusCode, 400);
});

test('routes handle missing JSON body fallback branches', async () => {
  const agent = await loginAgent();

  userService.registerUser = async () => ({ ok: false, code: 'unknown', message: 'x' });
  let response = await request(app).post('/api/register');
  assert.equal(response.statusCode, 400);

  authService.login = async () => ({ ok: false, code: 'weird', message: 'x' });
  response = await request(app).post('/api/login');
  assert.equal(response.statusCode, 400);

  authService.changePassword = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/password');
  assert.equal(response.statusCode, 400);

  submissionService.submitSubmission = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/submissions');
  assert.equal(response.statusCode, 400);

  submissionService.saveDraft = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/submissions/new/draft');
  assert.equal(response.statusCode, 400);

  submissionService.validateSubmissionData = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/submissions/validate');
  assert.equal(response.statusCode, 400);

  reviewerAssignmentService.assignReviewers = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/reviewer-assignments');
  assert.equal(response.statusCode, 400);

  reviewerNotificationService.notifyReviewers = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/reviewers/notify');
  assert.equal(response.statusCode, 400);

  invitationResponseService.respondToInvitation = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/reviewer-invitations/1/response');
  assert.equal(response.statusCode, 400);

  reviewService.submitReview = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/reviews');
  assert.equal(response.statusCode, 400);

  decisionService.recordDecision = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/decisions');
  assert.equal(response.statusCode, 400);

  authorNotificationService.notifyAuthors = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/author-notifications');
  assert.equal(response.statusCode, 400);

  scheduleService.modifySchedule = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/schedule/modify');
  assert.equal(response.statusCode, 400);

  paymentService.processPayment = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent.post('/api/payments');
  assert.equal(response.statusCode, 400);
});

test('routes handle undefined req.body via text/plain payloads', async () => {
  const agent = await loginAgent();

  let response = await request(app)
    .post('/api/register')
    .set('Content-Type', 'text/plain')
    .send('x');
  assert.equal(response.statusCode, 400);

  response = await request(app)
    .post('/api/login')
    .set('Content-Type', 'text/plain')
    .send('x');
  assert.equal(response.statusCode, 400);

  response = await agent
    .post('/api/password')
    .set('Content-Type', 'text/plain')
    .send('x');
  assert.equal(response.statusCode, 400);

  submissionService.submitSubmission = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent
    .post('/api/submissions')
    .set('Content-Type', 'text/plain')
    .send('x');
  assert.equal(response.statusCode, 400);

  submissionService.saveDraft = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent
    .post('/api/submissions/new/draft')
    .set('Content-Type', 'text/plain')
    .send('x');
  assert.equal(response.statusCode, 400);

  submissionService.validateSubmissionData = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent
    .post('/api/submissions/validate')
    .set('Content-Type', 'text/plain')
    .send('x');
  assert.equal(response.statusCode, 400);

  reviewerAssignmentService.assignReviewers = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent
    .post('/api/reviewer-assignments')
    .set('Content-Type', 'text/plain')
    .send('x');
  assert.equal(response.statusCode, 400);

  reviewerNotificationService.notifyReviewers = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent
    .post('/api/reviewers/notify')
    .set('Content-Type', 'text/plain')
    .send('x');
  assert.equal(response.statusCode, 400);

  invitationResponseService.respondToInvitation = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent
    .post('/api/reviewer-invitations/1/response')
    .set('Content-Type', 'text/plain')
    .send('x');
  assert.equal(response.statusCode, 400);

  reviewService.submitReview = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent
    .post('/api/reviews')
    .set('Content-Type', 'text/plain')
    .send('x');
  assert.equal(response.statusCode, 400);

  decisionService.recordDecision = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent
    .post('/api/decisions')
    .set('Content-Type', 'text/plain')
    .send('x');
  assert.equal(response.statusCode, 400);

  authorNotificationService.notifyAuthors = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent
    .post('/api/author-notifications')
    .set('Content-Type', 'text/plain')
    .send('x');
  assert.equal(response.statusCode, 400);

  scheduleService.modifySchedule = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent
    .post('/api/schedule/modify')
    .set('Content-Type', 'text/plain')
    .send('x');
  assert.equal(response.statusCode, 400);

  paymentService.processPayment = async () => ({ ok: false, code: 'unknown', message: 'x' });
  response = await agent
    .post('/api/payments')
    .set('Content-Type', 'text/plain')
    .send('x');
  assert.equal(response.statusCode, 400);
});

test('pricing route returns retrieval failure when model throws', async () => {
  pricingModel.getCurrentPricing = async () => {
    throw new Error('db down');
  };
  const response = await request(app).get('/api/pricing');
  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'retrieval_failure');
});
