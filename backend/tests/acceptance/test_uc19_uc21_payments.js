const { test, before, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, migratePromise, resetDatabase, db } = require('../helpers/test_app');

before(async () => {
  await migratePromise;
});

afterEach(async () => {
  process.env.SIMULATE_PRICING_RETRIEVAL_FAILURE = 'false';
  process.env.SIMULATE_PAYMENT_REJECTED = 'false';
  process.env.SIMULATE_PAYMENT_GATEWAY_UNAVAILABLE = 'false';
  process.env.SIMULATE_DB_FAILURE = 'false';
  process.env.SIMULATE_TICKET_GENERATION_FAILURE = 'false';
  process.env.SIMULATE_STORAGE_FAILURE = 'false';
  process.env.SIMULATE_EMAIL_FAILURE = 'false';
  await resetDatabase();
});

function seedPricing(fee = '$150') {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO pricing (registration_fee) VALUES (?)', [fee], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function countPaymentsByUser(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) AS count FROM payments WHERE user_id = ?', [userId], (err, row) => {
      if (err) return reject(err);
      resolve(row.count);
    });
  });
}

function countTicketsByUser(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) AS count FROM tickets WHERE user_id = ?', [userId], (err, row) => {
      if (err) return reject(err);
      resolve(row.count);
    });
  });
}

function getUserId(email) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
      if (err) return reject(err);
      if (!row) return reject(new Error(`user missing for ${email}`));
      resolve(row.id);
    });
  });
}

async function registerAndLogin(email = 'attendee-accept@example.com') {
  await request(app).post('/api/register').send({ email, password: 'Strong!23' });
  const agent = request.agent(app);
  await agent.post('/api/login').send({ email, password: 'Strong!23' });
  const userId = await getUserId(email);
  return { agent, userId };
}

test('AT-UC-19-01 and AT-UC-19-04 successful pricing display and visibility', async () => {
  await seedPricing('$199');

  const response = await request(app).get('/api/pricing');

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.registrationFee, '$199');
});

test('AT-UC-19-02 pricing information unavailable', async () => {
  const response = await request(app).get('/api/pricing');

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error.code, 'pricing_unavailable');
});

test('AT-UC-19-03 pricing retrieval failure', async () => {
  await seedPricing('$199');
  process.env.SIMULATE_PRICING_RETRIEVAL_FAILURE = 'true';

  const response = await request(app).get('/api/pricing');

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'retrieval_failure');
});

test('AT-UC-20-01 and AT-UC-20-06 successful payment and registration completion', async () => {
  const { agent, userId } = await registerAndLogin();

  const response = await agent.post('/api/payments').send({
    paymentInformation: { cardLast4: '4242', billingName: 'Attendee' }
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.registered, true);
  assert.equal(await countPaymentsByUser(userId), 1);
});

test('AT-UC-20-02 invalid payment information', async () => {
  const { agent, userId } = await registerAndLogin();

  const response = await agent.post('/api/payments').send({ paymentInformation: {} });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'invalid_payment_info');
  assert.equal(await countPaymentsByUser(userId), 0);
});

test('AT-UC-20-03 payment rejected', async () => {
  const { agent, userId } = await registerAndLogin();
  process.env.SIMULATE_PAYMENT_REJECTED = 'true';

  const response = await agent.post('/api/payments').send({
    paymentInformation: { cardLast4: '4000', billingName: 'Attendee' }
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'payment_rejected');
  assert.equal(await countPaymentsByUser(userId), 0);
});

test('AT-UC-20-04 payment gateway unavailable', async () => {
  const { agent, userId } = await registerAndLogin();
  process.env.SIMULATE_PAYMENT_GATEWAY_UNAVAILABLE = 'true';

  const response = await agent.post('/api/payments').send({
    paymentInformation: { cardLast4: '4242', billingName: 'Attendee' }
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'gateway_unavailable');
  assert.equal(await countPaymentsByUser(userId), 0);
});

test('AT-UC-20-05 payment recording failure', async () => {
  const { agent, userId } = await registerAndLogin();
  process.env.SIMULATE_DB_FAILURE = 'true';

  const response = await agent.post('/api/payments').send({
    paymentInformation: { cardLast4: '4242', billingName: 'Attendee' }
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'db_error');
  assert.equal(await countPaymentsByUser(userId), 0);
});

test('AT-UC-21-01 and AT-UC-21-05 successful confirmation and proof of registration', async () => {
  const { agent, userId } = await registerAndLogin();
  await agent.post('/api/payments').send({
    paymentInformation: { cardLast4: '4242', billingName: 'Attendee' }
  });

  const response = await agent.post('/api/tickets').send({});

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(await countTicketsByUser(userId), 1);
});

test('AT-UC-21-02 ticket generation failure', async () => {
  const { agent, userId } = await registerAndLogin();
  await agent.post('/api/payments').send({
    paymentInformation: { cardLast4: '4242', billingName: 'Attendee' }
  });
  process.env.SIMULATE_TICKET_GENERATION_FAILURE = 'true';

  const response = await agent.post('/api/tickets').send({});

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'ticket_generation_failure');
  assert.equal(await countTicketsByUser(userId), 0);
});

test('AT-UC-21-03 storage failure', async () => {
  const { agent, userId } = await registerAndLogin();
  await agent.post('/api/payments').send({
    paymentInformation: { cardLast4: '4242', billingName: 'Attendee' }
  });
  process.env.SIMULATE_STORAGE_FAILURE = 'true';

  const response = await agent.post('/api/tickets').send({});

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'storage_failure');
  assert.equal(await countTicketsByUser(userId), 0);
});

test('AT-UC-21-04 delivery failure', async () => {
  const { agent, userId } = await registerAndLogin();
  await agent.post('/api/payments').send({
    paymentInformation: { cardLast4: '4242', billingName: 'Attendee' }
  });
  process.env.SIMULATE_EMAIL_FAILURE = 'true';

  const response = await agent.post('/api/tickets').send({});

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'delivery_failure');
  assert.equal(await countTicketsByUser(userId), 1);
});
