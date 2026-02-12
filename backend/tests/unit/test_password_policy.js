const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validatePassword } = require('../../src/services/validation');

const originalPolicy = process.env.PASSWORD_POLICY_AVAILABLE;

test('accepts strong password', () => {
  process.env.PASSWORD_POLICY_AVAILABLE = 'true';
  const result = validatePassword('Strong!23');
  assert.equal(result.ok, true);
});

test('rejects weak password', () => {
  process.env.PASSWORD_POLICY_AVAILABLE = 'true';
  const result = validatePassword('weak');
  assert.equal(result.ok, false);
  assert.equal(result.code, 'weak_password');
});

test('fails when policy unavailable', () => {
  process.env.PASSWORD_POLICY_AVAILABLE = 'false';
  const result = validatePassword('Strong!23');
  assert.equal(result.ok, false);
  assert.equal(result.code, 'policy_unavailable');
});

if (originalPolicy === undefined) {
  delete process.env.PASSWORD_POLICY_AVAILABLE;
} else {
  process.env.PASSWORD_POLICY_AVAILABLE = originalPolicy;
}
