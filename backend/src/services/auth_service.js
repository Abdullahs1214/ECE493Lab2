const userModel = require('../models/user');
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const { validatePassword } = require('./validation');

async function login(email, password) {
  if (process.env.SIMULATE_AUTH_FAILURE === 'true') {
    return { ok: false, code: 'auth_unavailable', message: 'Authentication unavailable.' };
  }

  try {
    const user = await userModel.findByEmail(email);
    if (!user) {
      return { ok: false, code: 'invalid_credentials', message: 'Invalid credentials.' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { ok: false, code: 'invalid_credentials', message: 'Invalid credentials.' };
    }

    return { ok: true, user };
  } catch (err) {
    return { ok: false, code: 'auth_unavailable', message: 'Authentication unavailable.' };
  }
}

function getUserById(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, email, password FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

async function changePassword(userId, currentPassword, newPassword) {
  if (process.env.SIMULATE_AUTH_FAILURE === 'true') {
    return { ok: false, code: 'auth_unavailable', message: 'Authentication unavailable.' };
  }

  if (process.env.SIMULATE_DB_FAILURE === 'true') {
    return { ok: false, code: 'db_error', message: 'Database unavailable.' };
  }

  let user;
  try {
    user = await getUserById(userId);
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Database unavailable.' };
  }

  if (!user) {
    return { ok: false, code: 'current_password_incorrect', message: 'Current password incorrect.' };
  }

  const currentMatches = await bcrypt.compare(currentPassword, user.password);
  if (!currentMatches) {
    return { ok: false, code: 'current_password_incorrect', message: 'Current password incorrect.' };
  }

  const passwordResult = validatePassword(newPassword);
  if (!passwordResult.ok) {
    return passwordResult;
  }

  if (process.env.SIMULATE_UPDATE_FAILURE === 'true') {
    return { ok: false, code: 'update_failed', message: 'Password update failed.' };
  }

  try {
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const updated = await userModel.updatePassword(userId, newPasswordHash);
    if (!updated) {
      return { ok: false, code: 'update_failed', message: 'Password update failed.' };
    }
  } catch (err) {
    return { ok: false, code: 'db_error', message: 'Database unavailable.' };
  }

  return { ok: true };
}

module.exports = { login, changePassword };
