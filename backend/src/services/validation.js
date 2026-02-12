const COMMON_PASSWORDS = new Set([
  'password',
  '12345678',
  'qwerty',
  'letmein',
  'welcome',
  'admin',
  'iloveyou',
  'abc123',
  'password1',
  'changeme'
]);

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordPolicyAvailable() {
  return process.env.PASSWORD_POLICY_AVAILABLE !== 'false';
}

function validatePassword(password) {
  if (!passwordPolicyAvailable()) {
    return { ok: false, code: 'policy_unavailable', message: 'Password policy unavailable.' };
  }

  if (typeof password !== 'string') {
    return { ok: false, code: 'invalid_password', message: 'Password is required.' };
  }

  if (password.length < 8) {
    return { ok: false, code: 'weak_password', message: 'Password must be at least 8 characters.' };
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return { ok: false, code: 'weak_password', message: 'Password must include upper and lower case letters.' };
  }

  if (!/[0-9]/.test(password)) {
    return { ok: false, code: 'weak_password', message: 'Password must include a number.' };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return { ok: false, code: 'weak_password', message: 'Password must include a symbol.' };
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return { ok: false, code: 'weak_password', message: 'Password is too common.' };
  }

  return { ok: true };
}

function validateMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') {
    return { ok: false, code: 'metadata_missing', message: 'Metadata is required.' };
  }

  const requiredFields = ['title', 'abstract', 'authors', 'keywords'];
  const missing = requiredFields.filter((field) => {
    const value = metadata[field];
    return !value || String(value).trim().length === 0;
  });

  if (missing.length > 0) {
    return {
      ok: false,
      code: 'metadata_missing',
      message: 'Required metadata fields are missing.',
      details: { missing }
    };
  }

  return { ok: true };
}

function validateManuscriptFile(manuscriptFile) {
  if (!manuscriptFile || typeof manuscriptFile !== 'object') {
    return { ok: false, code: 'file_missing', message: 'Manuscript file is required.' };
  }

  const filename = manuscriptFile.filename;
  const sizeBytes = Number(manuscriptFile.sizeBytes);

  if (!filename || Number.isNaN(sizeBytes)) {
    return { ok: false, code: 'file_invalid', message: 'Manuscript file is invalid.' };
  }

  const allowedExtensions = ['.pdf', '.docx', '.zip'];
  const lower = filename.toLowerCase();
  const matches = allowedExtensions.some((ext) => lower.endsWith(ext));
  if (!matches) {
    return { ok: false, code: 'file_format', message: 'Invalid file format.' };
  }

  const maxSizeBytes = 25 * 1024 * 1024;
  if (sizeBytes > maxSizeBytes) {
    return { ok: false, code: 'file_size', message: 'File exceeds size limit.' };
  }

  return { ok: true };
}

module.exports = {
  isValidEmail,
  validatePassword,
  validateMetadata,
  validateManuscriptFile,
  passwordPolicyAvailable
};
