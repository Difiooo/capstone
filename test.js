const test = require('node:test');
const assert = require('node:assert');
const { isUsernameValid, isEmailValid, isAgeValid } = require('./public/validation.js');

test('Username Validation', async (t) => {
  await t.test('should accept valid usernames', () => {
    assert.strictEqual(isUsernameValid('john_doe'), true);
    assert.strictEqual(isUsernameValid('user123'), true);
    assert.strictEqual(isUsernameValid('ABC'), true);
    assert.strictEqual(isUsernameValid('a1_'), true); // exactly 3 chars
    assert.strictEqual(isUsernameValid('a'.repeat(15)), true); // exactly 15 chars
  });

  await t.test('should reject usernames that are too short', () => {
    assert.strictEqual(isUsernameValid('ab'), false);
    assert.strictEqual(isUsernameValid('a'), false);
    assert.strictEqual(isUsernameValid(''), false);
  });

  await t.test('should reject usernames that are too long', () => {
    assert.strictEqual(isUsernameValid('a'.repeat(16)), false);
  });

  await t.test('should reject usernames with invalid characters', () => {
    assert.strictEqual(isUsernameValid('user!'), false);
    assert.strictEqual(isUsernameValid('john doe'), false);
    assert.strictEqual(isUsernameValid('user@'), false);
    assert.strictEqual(isUsernameValid('user-name'), false);
  });
});

test('Email Validation', async (t) => {
  await t.test('should accept valid emails', () => {
    assert.strictEqual(isEmailValid('john@example.com'), true);
    assert.strictEqual(isEmailValid('user.name+tag@domain.co.uk'), true);
    assert.strictEqual(isEmailValid('123@domain.org'), true);
  });

  await t.test('should reject invalid emails', () => {
    assert.strictEqual(isEmailValid('john@'), false);
    assert.strictEqual(isEmailValid('@domain.com'), false);
    assert.strictEqual(isEmailValid('john@domain'), false);
    assert.strictEqual(isEmailValid('john.example.com'), false);
    assert.strictEqual(isEmailValid(''), false);
  });
});

test('Age Validation', async (t) => {
  await t.test('should accept valid ages', () => {
    assert.strictEqual(isAgeValid('25'), true);
    assert.strictEqual(isAgeValid(25), true);
    assert.strictEqual(isAgeValid('1'), true);
    assert.strictEqual(isAgeValid('120'), true);
  });

  await t.test('should reject ages out of range', () => {
    assert.strictEqual(isAgeValid('0'), false);
    assert.strictEqual(isAgeValid('121'), false);
    assert.strictEqual(isAgeValid('-5'), false);
  });

  await t.test('should reject non-whole numbers', () => {
    assert.strictEqual(isAgeValid('25.5'), false);
    assert.strictEqual(isAgeValid(25.5), false);
  });

  await t.test('should reject non-numeric values', () => {
    assert.strictEqual(isAgeValid('abc'), false);
    assert.strictEqual(isAgeValid(''), false);
    assert.strictEqual(isAgeValid(null), false);
    assert.strictEqual(isAgeValid(undefined), false);
  });
});
