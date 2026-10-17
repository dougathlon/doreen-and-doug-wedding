import assert from 'node:assert/strict';
import test from 'node:test';
import { blankReply, reviewReply, sampleGuest, validateReply } from '../src/replies.js';

const completed = () => ({
  friday: 'yes', saturday: 'yes', allergies: '  Example intolerance  ',
});
test('one invitee must answer for both days', () => {
  assert.deepEqual(Object.keys(validateReply(blankReply())), ['friday', 'saturday']);
  assert.deepEqual(Object.keys(validateReply({ ...blankReply(), saturday: 'yes' })), ['friday']);
});
test('Friday-only, Saturday-only and uncertain Friday replies are valid', () => {
  for (const friday of ['yes', 'no', 'unsure']) {
    for (const saturday of ['yes', 'no']) {
      const reply = { ...completed(), friday, saturday };
      assert.deepEqual(validateReply(reply), {});
      const reviewed = reviewReply(sampleGuest, reply);
      assert.equal(reviewed.friday, friday);
      assert.equal(reviewed.saturday, saturday);
    }
  }
});
test('Saturday uncertainty and unknown attendance values are rejected', () => {
  const reply = { ...completed(), saturday: 'unsure', friday: 'maybe' };
  assert.deepEqual(Object.keys(validateReply(reply)), ['friday', 'saturday']);
});
test('food notes are optional, trimmed, bounded and excluded for a full decline', () => {
  assert.equal(reviewReply(sampleGuest, completed()).allergies, 'Example intolerance');
  assert.equal(reviewReply(sampleGuest, { ...completed(), friday: 'no', saturday: 'no' }).allergies, '');
  for (const allergies of ['', 'a'.repeat(1000)]) {
    assert.deepEqual(validateReply({ ...completed(), allergies }), {});
  }
  for (const allergies of ['a'.repeat(1001), null, 42]) {
    assert.ok(validateReply({ ...completed(), allergies }).allergies);
  }
});
test('the review keeps the invited identity and cannot add or rename guests', () => {
  const reply = { ...completed(), id: 'someone-else', name: 'Uninvited', guestCount: 2, guests: ['Companion'] };
  assert.deepEqual(reviewReply(sampleGuest, reply), {
    id: sampleGuest.id, name: sampleGuest.name,
    friday: 'yes', saturday: 'yes', allergies: 'Example intolerance',
  });
});
test('reset creates a fresh individual reply with no earlier answers', () => {
  const first = blankReply();
  first.allergies = 'Sample';
  first.friday = 'yes';
  assert.deepEqual(blankReply(), { friday: '', saturday: '', allergies: '' });
});
