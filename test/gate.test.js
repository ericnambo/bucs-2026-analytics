const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { isAccessGranted } = require('../src/gate');

// Made-up passwords only. Hashes are computed here, independently of the module.
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const pw = ['alpha-test-one', 'bravo-test-two', 'charlie-test-three'];
const hashes = pw.map(sha);

test('a correct password is accepted', async () => {
  assert.equal(await isAccessGranted(pw[0], hashes), true);
});

test('a wrong password is rejected', async () => {
  assert.equal(await isAccessGranted('not-a-password', hashes), false);
});

test('an empty or missing password is rejected', async () => {
  assert.equal(await isAccessGranted('', hashes), false);
  assert.equal(await isAccessGranted('   ', hashes), false);
  assert.equal(await isAccessGranted(undefined, hashes), false);
});

test('each hash is accepted independently', async () => {
  for (const p of pw) assert.equal(await isAccessGranted(p, hashes), true);
});

test('removing a hash rejects that password and still accepts the others', async () => {
  const rest = hashes.filter((h) => h !== sha(pw[1]));
  assert.equal(await isAccessGranted(pw[1], rest), false);
  assert.equal(await isAccessGranted(pw[0], rest), true);
  assert.equal(await isAccessGranted(pw[2], rest), true);
});

test('an empty or missing list rejects everything', async () => {
  assert.equal(await isAccessGranted(pw[0], []), false);
  assert.equal(await isAccessGranted(pw[0], undefined), false);
  assert.equal(await isAccessGranted('', []), false);
});

test('surrounding whitespace is ignored (paste and autofill add it)', async () => {
  assert.equal(await isAccessGranted('  ' + pw[0] + '\n', hashes), true);
});

test('letter case matters', async () => {
  assert.equal(await isAccessGranted(pw[0].toUpperCase(), hashes), false);
});

test('stored hashes may be upper case or padded', async () => {
  assert.equal(await isAccessGranted(pw[0], [' ' + sha(pw[0]).toUpperCase() + ' ']), true);
});
