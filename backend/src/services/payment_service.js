const paymentModel = require('../models/payment');
const ticketModel = require('../models/ticket');

function hasPaymentInformation(paymentInformation) {
  if (!paymentInformation) {
    return false;
  }

  if (typeof paymentInformation === 'string') {
    return paymentInformation.trim().length > 0;
  }

  if (typeof paymentInformation === 'object') {
    return Object.values(paymentInformation).some((value) => value !== null && value !== undefined && String(value).trim() !== '');
  }

  return false;
}

async function processPayment({ userId, paymentInformation }) {
  if (!hasPaymentInformation(paymentInformation)) {
    return { ok: false, code: 'invalid_payment_info', message: 'Invalid payment information.' };
  }

  if (process.env.SIMULATE_PAYMENT_GATEWAY_UNAVAILABLE === 'true') {
    return { ok: false, code: 'gateway_unavailable', message: 'Payment gateway unavailable.' };
  }

  if (process.env.SIMULATE_PAYMENT_REJECTED === 'true') {
    return { ok: false, code: 'payment_rejected', message: 'Payment was rejected.' };
  }

  if (process.env.SIMULATE_DB_FAILURE === 'true') {
    return { ok: false, code: 'db_error', message: 'Payment recording failed.' };
  }

  const paymentConfirmation = `CONF-${Date.now()}-${userId}`;

  try {
    const created = await paymentModel.createPayment({
      userId,
      paymentInformation: JSON.stringify(paymentInformation),
      paymentConfirmation
    });

    return { ok: true, paymentId: created.id, paymentConfirmation, registered: true };
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Payment recording failed.' };
  }
}

async function issueTicket({ userId }) {
  if (process.env.SIMULATE_TICKET_GENERATION_FAILURE === 'true') {
    return { ok: false, code: 'ticket_generation_failure', message: 'Ticket generation failure.' };
  }

  let payment;
  try {
    payment = await paymentModel.getLatestPaymentByUserId(userId);
  } catch (err) {
    return { ok: false, code: 'storage_failure', message: 'Storage failure.' };
  }

  if (!payment) {
    return { ok: false, code: 'payment_required', message: 'Successful payment is required before ticket issuance.' };
  }

  if (process.env.SIMULATE_STORAGE_FAILURE === 'true' || process.env.SIMULATE_DB_FAILURE === 'true') {
    return { ok: false, code: 'storage_failure', message: 'Storage failure.' };
  }

  const ticketDetails = JSON.stringify({
    ticketCode: `TICKET-${Date.now()}-${userId}`,
    confirmation: payment.payment_confirmation
  });

  let ticket;
  try {
    ticket = await ticketModel.createTicket({ userId, ticketDetails });
  } catch (err) {
    return { ok: false, code: 'storage_failure', message: 'Storage failure.' };
  }

  if (process.env.SIMULATE_EMAIL_FAILURE === 'true') {
    return {
      ok: false,
      code: 'delivery_failure',
      message: 'Delivery failure.',
      paymentConfirmation: payment.payment_confirmation,
      ticketId: ticket.id
    };
  }

  return {
    ok: true,
    ticketId: ticket.id,
    paymentConfirmation: payment.payment_confirmation,
    ticketDetails
  };
}

module.exports = { processPayment, issueTicket };
