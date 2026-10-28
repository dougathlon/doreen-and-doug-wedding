import assert from 'node:assert/strict';
import test from 'node:test';
import { blankReply, reviewReply, validateReply } from '../src/replies.js';
const completed = () => ({ name: '  Example Guest  ', email: '', friday: 'yes', saturday: 'yes', allergies: '  Example intolerance  ' });
test('each individual supplies their name and both attendance answers', () => {
  assert.deepEqual(Object.keys(validateReply(blankReply())), ['name', 'friday', 'saturday']);
  assert.deepEqual(validateReply(completed()), {});
});
test('all supported attendance combinations are valid', () => {
  for (const friday of ['yes', 'no', 'unsure']) for (const saturday of ['yes', 'no']) assert.deepEqual(validateReply({ ...completed(), friday, saturday }), {});
  assert.ok(validateReply({ ...completed(), saturday: 'unsure' }).saturday);
});
test('names, optional emails and food notes are bounded and validated', () => {
  for (const name of ['', '  ', 'a'.repeat(101), null, 'Name\nOther']) assert.ok(validateReply({ ...completed(), name }).name);
  for (const email of ['', 'test@example.com']) assert.deepEqual(validateReply({ ...completed(), email }), {});
  for (const email of ['broken', 'test\n@example.com', null]) assert.ok(validateReply({ ...completed(), email }).email);
  for (const allergies of ['', 'a'.repeat(1000)]) assert.deepEqual(validateReply({ ...completed(), allergies }), {});
  for (const allergies of ['a'.repeat(1001), null, 42]) assert.ok(validateReply({ ...completed(), allergies }).allergies);
});
test('review trims fields, drops stale decline notes and never adds companions', () => {
  const reply = reviewReply({ ...completed(), friday: 'no', saturday: 'no', guests: ['Other'], guestCount: 2 });
  assert.deepEqual(reply, { name: 'Example Guest', email: '', friday: 'no', saturday: 'no', allergies: '' });
  assert.equal(reviewReply(completed()).allergies, 'Example intolerance');
});
test('reset does not retain earlier answers', () => {
  const first = blankReply(); first.name = 'Previous'; assert.equal(blankReply().name, '');
});
