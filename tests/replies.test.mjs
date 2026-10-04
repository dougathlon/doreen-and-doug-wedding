import assert from 'node:assert/strict';
import test from 'node:test';
import { blankReplies, reviewReplies, sampleGuests, validateReplies } from '../src/replies.js';

const completed = () => ({
  'example-one': { friday: 'yes', saturday: 'yes', allergies: '  Example allergy  ' },
  'example-two': { friday: 'unsure', saturday: 'no', allergies: '' },
});
test('both days require an explicit answer for each invited person', () => {
  assert.equal(Object.keys(validateReplies(sampleGuests, blankReplies())).length, 4);
  const missingPerson = completed();
  delete missingPerson['example-two'];
  assert.equal(Object.keys(validateReplies(sampleGuests, missingPerson)).length, 2);
});
test('mixed household attendance and uncertainty on Friday are valid', () => {
  assert.deepEqual(validateReplies(sampleGuests, completed()), {});
  const rows = reviewReplies(sampleGuests, completed());
  assert.equal(rows[0].saturday, 'yes');
  assert.equal(rows[1].saturday, 'no');
  assert.equal(rows[1].friday, 'unsure');
  assert.equal(rows[0].allergies, 'Example allergy');
});
test('Saturday uncertainty and unknown attendance values are rejected', () => {
  const replies = completed();
  replies['example-one'].saturday = 'unsure';
  replies['example-two'].friday = 'maybe';
  assert.equal(Object.keys(validateReplies(sampleGuests, replies)).length, 2);
});
test('allergy notes are optional, bounded and excluded for a full decline', () => {
  const replies = completed();
  replies['example-one'] = { friday: 'no', saturday: 'no', allergies: 'Obsolete sample note' };
  assert.equal(reviewReplies(sampleGuests, replies)[0].allergies, '');
  replies['example-one'].allergies = 'a'.repeat(1001);
  assert.ok(validateReplies(sampleGuests, replies)['example-one-allergies']);
});
test('a review includes only the fixed invitation party, with no extra guests', () => {
  const replies = completed();
  replies['uninvited'] = { friday: 'yes', saturday: 'yes', allergies: '' };
  assert.deepEqual(reviewReplies(sampleGuests, replies).map((row) => row.id), sampleGuests.map((guest) => guest.id));
});
test('reset creates fresh records and does not keep earlier allergy text', () => {
  const first = blankReplies();
  first['example-one'].allergies = 'Sample';
  assert.equal(blankReplies()['example-one'].allergies, '');
});
