const userModel = require('../models/user');
const bcrypt = require('bcryptjs');
const { isValidEmail, validatePassword } = require('./validation');
const SALT_ROUNDS = 10;

async function validateRegistration(email, password) {
  if (!isValidEmail(email)) {
    return { ok: false, code: 'invalid_email', message: 'Invalid email format.' };
  }

  const passwordResult = validatePassword(password);
  if (!passwordResult.ok) {
    return passwordResult;
  }

  if (process.env.SIMULATE_DB_FAILURE === 'true') {
    return { ok: false, code: 'db_error', message: 'Database unavailable.' };
  }

  try {
    const existing = await userModel.findByEmail(email);
    if (existing) {
      return { ok: false, code: 'duplicate_email', message: 'Email already registered.' };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Database unavailable.' };
  }
}

async function registerUser(email, password) {
  const result = await validateRegistration(email, password);
  if (!result.ok) {
    return result;
  }

  if (process.env.SIMULATE_DB_FAILURE === 'true') {
    return { ok: false, code: 'db_error', message: 'Database unavailable.' };
  }

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userModel.createUser(email, passwordHash);
    return { ok: true, user };
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Database unavailable.' };
  }
}

module.exports = { validateRegistration, registerUser };
