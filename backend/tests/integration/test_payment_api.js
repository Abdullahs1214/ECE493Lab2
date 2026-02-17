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

async function register(email) {
  await request(app).post('/api/register').send({ email, password: 'Strong!23' });
}

async function loginAgent(email) {
  const agent = request.agent(app);
  await agent.post('/api/login').send({ email, password: 'Strong!23' });
  return agent;
}

function seedPricing(fee = '$100') {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO pricing (registration_fee) VALUES (?)', [fee], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function countPayments() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) AS count FROM payments', (err, row) => {
      if (err) return reject(err);
      resolve(row.count);
    });
  });
}

function countTickets() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) AS count FROM tickets', (err, row) => {
      if (err) return reject(err);
      resolve(row.count);
    });
  });
}

test('returns pricing successfully', async () => {
  await seedPricing('$225');

  const response = await request(app).get('/api/pricing');

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.registrationFee, '$225');
});

test('returns pricing unavailable when no pricing exists', async () => {
  const response = await request(app).get('/api/pricing');

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error.code, 'pricing_unavailable');
});

test('returns retrieval failure when pricing lookup fails', async () => {
  await seedPricing('$225');
  process.env.SIMULATE_PRICING_RETRIEVAL_FAILURE = 'true';

  const response = await request(app).get('/api/pricing');

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'retrieval_failure');
});

test('processes payment successfully', async () => {
  await register('attendee-int@example.com');
  const attendeeAgent = await loginAgent('attendee-int@example.com');

  const response = await attendeeAgent.post('/api/payments').send({
    paymentInformation: { cardLast4: '4242', name: 'Attendee' }
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.registered, true);
  assert.equal(await countPayments(), 1);
});

test('rejects invalid payment information', async () => {
  await register('attendee-int@example.com');
  const attendeeAgent = await loginAgent('attendee-int@example.com');

  const response = await attendeeAgent.post('/api/payments').send({ paymentInformation: {} });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'invalid_payment_info');
});

test('handles payment rejection', async () => {
  await register('attendee-int@example.com');
  const attendeeAgent = await loginAgent('attendee-int@example.com');
  process.env.SIMULATE_PAYMENT_REJECTED = 'true';

  const response = await attendeeAgent.post('/api/payments').send({
    paymentInformation: { cardLast4: '4000', name: 'Attendee' }
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error.code, 'payment_rejected');
  assert.equal(await countPayments(), 0);
});

test('handles payment gateway unavailability', async () => {
  await register('attendee-int@example.com');
  const attendeeAgent = await loginAgent('attendee-int@example.com');
  process.env.SIMULATE_PAYMENT_GATEWAY_UNAVAILABLE = 'true';

  const response = await attendeeAgent.post('/api/payments').send({
    paymentInformation: { cardLast4: '4242', name: 'Attendee' }
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'gateway_unavailable');
  assert.equal(await countPayments(), 0);
});

test('handles payment recording failure', async () => {
  await register('attendee-int@example.com');
  const attendeeAgent = await loginAgent('attendee-int@example.com');
  process.env.SIMULATE_DB_FAILURE = 'true';

  const response = await attendeeAgent.post('/api/payments').send({
    paymentInformation: { cardLast4: '4242', name: 'Attendee' }
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'db_error');
  assert.equal(await countPayments(), 0);
});

test('issues ticket successfully after payment', async () => {
  await register('attendee-int@example.com');
  const attendeeAgent = await loginAgent('attendee-int@example.com');
  await attendeeAgent.post('/api/payments').send({
    paymentInformation: { cardLast4: '4242', name: 'Attendee' }
  });

  const response = await attendeeAgent.post('/api/tickets').send({});

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(await countTickets(), 1);
});

test('returns ticket generation failure', async () => {
  await register('attendee-int@example.com');
  const attendeeAgent = await loginAgent('attendee-int@example.com');
  await attendeeAgent.post('/api/payments').send({
    paymentInformation: { cardLast4: '4242', name: 'Attendee' }
  });
  process.env.SIMULATE_TICKET_GENERATION_FAILURE = 'true';

  const response = await attendeeAgent.post('/api/tickets').send({});

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'ticket_generation_failure');
});

test('returns storage failure while issuing ticket', async () => {
  await register('attendee-int@example.com');
  const attendeeAgent = await loginAgent('attendee-int@example.com');
  await attendeeAgent.post('/api/payments').send({
    paymentInformation: { cardLast4: '4242', name: 'Attendee' }
  });
  process.env.SIMULATE_STORAGE_FAILURE = 'true';

  const response = await attendeeAgent.post('/api/tickets').send({});

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'storage_failure');
  assert.equal(await countTickets(), 0);
});

test('returns delivery failure after storing ticket', async () => {
  await register('attendee-int@example.com');
  const attendeeAgent = await loginAgent('attendee-int@example.com');
  await attendeeAgent.post('/api/payments').send({
    paymentInformation: { cardLast4: '4242', name: 'Attendee' }
  });
  process.env.SIMULATE_EMAIL_FAILURE = 'true';

  const response = await attendeeAgent.post('/api/tickets').send({});

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error.code, 'delivery_failure');
  assert.equal(await countTickets(), 1);
});
