const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const db = require('../../src/models/db');
const fs = require('fs');

const invitationResponseModel = require('../../src/models/invitation_response');
const migrateModel = require('../../src/models/migrate');
const paymentModel = require('../../src/models/payment');
const pricingModel = require('../../src/models/pricing');
const reviewModel = require('../../src/models/review');
const reviewAssignmentModel = require('../../src/models/review_assignment');
const reviewerNotificationModel = require('../../src/models/reviewer_notification');
const scheduleItemModel = require('../../src/models/schedule_item');
const submissionModel = require('../../src/models/submission');
const ticketModel = require('../../src/models/ticket');
const userModel = require('../../src/models/user');

const original = {
  run: db.run,
  get: db.get,
  all: db.all,
  exec: db.exec,
  serialize: db.serialize,
  readFileSync: fs.readFileSync,
  dbPath: process.env.DB_PATH
};

afterEach(() => {
  db.run = original.run;
  db.get = original.get;
  db.all = original.all;
  db.exec = original.exec;
  db.serialize = original.serialize;
  fs.readFileSync = original.readFileSync;
  if (original.dbPath === undefined) {
    delete process.env.DB_PATH;
  } else {
    process.env.DB_PATH = original.dbPath;
  }
});

test('db.js covers env/default DB_PATH selection', async () => {
  process.env.DB_PATH = '/tmp/test-env-branch.db';
  assert.equal(db.resolveDbPath(), '/tmp/test-env-branch.db');

  delete process.env.DB_PATH;
  assert.match(db.resolveDbPath(), /cms\.db$/);
});

test('migrate rejects on db.exec error', async () => {
  fs.readFileSync = () => 'CREATE TABLE x(id INTEGER);';
  db.exec = (_sql, cb) => cb(new Error('exec failed'));
  await assert.rejects(migrateModel.migrate(), /exec failed/);
});

test('invitation_response model error branches', async () => {
  db.run = (_sql, _params, cb) => cb(new Error('insert fail'));
  await assert.rejects(
    invitationResponseModel.createInvitationResponse({ reviewAssignmentId: 1, response: 'accept' }),
    /insert fail/
  );

  db.get = (_sql, _params, cb) => cb(new Error('get fail'));
  await assert.rejects(invitationResponseModel.getResponseByAssignmentId(1), /get fail/);

  db.get = (_sql, _params, cb) => cb(null, undefined);
  const response = await invitationResponseModel.getResponseByAssignmentId(1);
  assert.equal(response, null);
});

test('payment/pricing/ticket model error branches', async () => {
  db.run = (_sql, _params, cb) => cb(new Error('run fail'));
  await assert.rejects(paymentModel.createPayment({ userId: 1, paymentInformation: '{}', paymentConfirmation: 'c' }), /run fail/);
  await assert.rejects(pricingModel.createPricing('$1'), /run fail/);
  await assert.rejects(ticketModel.createTicket({ userId: 1, ticketDetails: '{}' }), /run fail/);

  db.get = (_sql, _params, cb) => cb(new Error('get fail'));
  await assert.rejects(paymentModel.getLatestPaymentByUserId(1), /get fail/);
  db.get = (_sql, _params, cb) => cb(null, undefined);
  assert.equal(await paymentModel.getLatestPaymentByUserId(1), null);

  db.get = (_sql, cb) => cb(new Error('get fail'));
  await assert.rejects(pricingModel.getCurrentPricing(), /get fail/);
  db.get = (_sql, cb) => cb(null, { id: 1, registration_fee: '$10' });
  const pricing = await pricingModel.getCurrentPricing();
  assert.equal(pricing.registration_fee, '$10');

  db.run = (_sql, _params, cb) => cb.call({ lastID: 99 }, null);
  const createdPricing = await pricingModel.createPricing('$20');
  assert.equal(createdPricing.id, 99);

  db.get = (_sql, _params, cb) => cb(new Error('get fail'));
  await assert.rejects(ticketModel.getLatestTicketByUserId(1), /get fail/);
  db.get = (_sql, _params, cb) => cb(null, undefined);
  assert.equal(await ticketModel.getLatestTicketByUserId(1), null);
});

test('review model error branches', async () => {
  db.run = (_sql, _params, cb) => cb(new Error('insert fail'));
  await assert.rejects(reviewModel.createReview({ reviewAssignmentId: 1, reviewForm: { s: 'x' } }), /insert fail/);

  db.get = (_sql, _params, cb) => cb(new Error('count fail'));
  await assert.rejects(reviewModel.countReviewsForSubmission(1), /count fail/);

  db.all = (_sql, _params, cb) => cb(new Error('list fail'));
  await assert.rejects(reviewModel.getReviewsForSubmission(1), /list fail/);

  db.all = (_sql, _params, cb) =>
    cb(null, [{ id: 1, review_form: '{"summary":"ok"}', submission_id: 1, reviewer_id: 2 }]);
  const reviews = await reviewModel.getReviewsForSubmission(1);
  assert.equal(reviews[0].reviewForm.summary, 'ok');

  db.all = (_sql, _params, cb) => cb(null, undefined);
  const noReviews = await reviewModel.getReviewsForSubmission(1);
  assert.deepEqual(noReviews, []);
});

test('review_assignment model error branches', async () => {
  db.get = (_sql, _params, cb) => cb(new Error('count fail'));
  await assert.rejects(reviewAssignmentModel.countAssignmentsForReviewer(1), /count fail/);

  db.serialize = (cb) => cb();
  db.run = (sql, _params, cb) => {
    if (typeof _params === 'function') {
      cb = _params;
    }
    if (sql === 'COMMIT') {
      cb(new Error('commit fail'));
      return;
    }
    if (cb) cb(null);
  };
  await assert.rejects(reviewAssignmentModel.createAssignments({ submissionId: 1, reviewerIds: [1] }), /commit fail/);

  db.all = (_sql, _params, cb) => cb(new Error('all fail'));
  await assert.rejects(reviewAssignmentModel.getAssignmentsBySubmission(1), /all fail/);
  db.all = (_sql, _params, cb) => cb(null, undefined);
  const assignments = await reviewAssignmentModel.getAssignmentsBySubmission(1);
  assert.deepEqual(assignments, []);

  db.get = (_sql, _params, cb) => cb(new Error('get fail'));
  await assert.rejects(reviewAssignmentModel.findAssignmentById(1), /get fail/);
  await assert.rejects(reviewAssignmentModel.countAssignmentsForSubmission(1), /get fail/);
  db.get = (_sql, _params, cb) => cb(null, undefined);
  assert.equal(await reviewAssignmentModel.findAssignmentById(1), null);
});

test('reviewer_notification and schedule_item model error branches', async () => {
  db.run = (_sql, _params, cb) => cb(new Error('run fail'));
  await assert.rejects(reviewerNotificationModel.createNotification({ submissionId: 1, reviewerId: 1 }), /run fail/);
  await assert.rejects(scheduleItemModel.createScheduleItem({ submissionId: 1, timeAssignment: '9', roomAssignment: 'A' }), /run fail/);
  await assert.rejects(scheduleItemModel.updateScheduleItemBySubmissionId({ submissionId: 1, timeAssignment: '9', roomAssignment: 'A' }), /run fail/);

  db.run = (_sql, cb) => cb(new Error('delete fail'));
  await assert.rejects(scheduleItemModel.clearScheduleItems(), /delete fail/);

  db.all = (_sql, _params, cb) => cb(new Error('all fail'));
  await assert.rejects(reviewerNotificationModel.getNotificationsBySubmission(1), /all fail/);
  db.all = (_sql, _params, cb) => cb(null, undefined);
  const notifications = await reviewerNotificationModel.getNotificationsBySubmission(1);
  assert.deepEqual(notifications, []);

  db.all = (_sql, cb) => cb(new Error('all fail'));
  await assert.rejects(scheduleItemModel.getAllScheduleItems(), /all fail/);
  db.all = (_sql, cb) => cb(null, undefined);
  const items = await scheduleItemModel.getAllScheduleItems();
  assert.deepEqual(items, []);
});

test('submission model error branches', async () => {
  db.run = (_sql, _params, cb) => cb(new Error('insert fail'));
  await assert.rejects(
    submissionModel.createSubmission({ userId: 1, title: 't', abstract: 'a', authors: 'au', keywords: 'k', manuscriptFile: 'f', status: 'submitted' }),
    /insert fail/
  );

  db.run = (_sql, _params, cb) => cb(new Error('update fail'));
  await assert.rejects(
    submissionModel.updateDraftById({ submissionId: 1, userId: 1, title: 't' }),
    /update fail/
  );
  db.run = (_sql, _params, cb) => cb.call({ changes: 0 }, null);
  const updateResult = await submissionModel.updateDraftById({ submissionId: 1, userId: 1, title: 't' });
  assert.equal(updateResult.updated, false);

  db.run = (_sql, _params, cb) => cb.call({ changes: 1 }, null);
  const updateWithFile = await submissionModel.updateDraftById({
    submissionId: 1,
    userId: 1,
    title: 't',
    abstract: 'a',
    authors: 'au',
    keywords: 'k',
    manuscriptFile: 'paper.pdf'
  });
  assert.equal(updateWithFile.updated, true);

  const updateWithoutTitle = await submissionModel.updateDraftById({
    submissionId: 1,
    userId: 1,
    abstract: 'a',
    authors: 'au',
    keywords: 'k',
    manuscriptFile: 'paper.pdf'
  });
  assert.equal(updateWithoutTitle.updated, true);

  db.get = (_sql, _params, cb) => cb(new Error('find fail'));
  await assert.rejects(submissionModel.findSubmissionById({ submissionId: 1, userId: 1 }), /find fail/);

  db.run = (_sql, _params, cb) => cb.call({ lastID: 10 }, null);
  const draft = await submissionModel.createDraft({ userId: 1 });
  assert.equal(draft.id, 10);

  db.get = (_sql, _params, cb) => cb(null, undefined);
  const found = await submissionModel.findSubmissionById({ submissionId: 1, userId: 1 });
  assert.equal(found, null);
});

test('user model error and empty-id branches', async () => {
  db.run = (_sql, _params, cb) => cb(new Error('run fail'));
  await assert.rejects(userModel.createUser('a@b.com', 'x'), /run fail/);
  await assert.rejects(userModel.updatePassword(1, 'x'), /run fail/);

  db.get = (_sql, _params, cb) => cb(new Error('get fail'));
  await assert.rejects(userModel.findByEmail('a@b.com'), /get fail/);

  db.all = (_sql, _params, cb) => cb(new Error('all fail'));
  await assert.rejects(userModel.findUsersByIds([1]), /all fail/);
  db.all = (_sql, _params, cb) => cb(null, undefined);
  const fetched = await userModel.findUsersByIds([1]);
  assert.deepEqual(fetched, []);

  const rows = await userModel.findUsersByIds([]);
  assert.deepEqual(rows, []);
});
