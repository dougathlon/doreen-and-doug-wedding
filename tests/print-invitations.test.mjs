import assert from 'node:assert/strict';
import test from 'node:test';
import { preparePrintInvitations } from '../src/print-invitations.js';

const draft = (overrides = {}) => ({ names: 'Example Guest', replyContact: 'Doreen or Doug: example@example.com', replyBy: '', ...overrides });

test('one line makes one invitation, preserving punctuation and repeated names', () => {
  const result = preparePrintInvitations(draft({ names: '  Anne O’Neill\r\n\nÉlodie Smith-Jones\nAnne O’Neill  ' }));
  assert.deepEqual(result.recipients, ['Anne O’Neill', 'Élodie Smith-Jones', 'Anne O’Neill']);
  assert.deepEqual(result.errors, {});
});
test('names and a reply route are required before printing', () => {
  assert.deepEqual(Object.keys(preparePrintInvitations(draft({ names: ' \n ', replyContact: ' ' })).errors), ['names', 'replyContact']);
});
test('oversized batches, names and reply contacts are rejected rather than silently clipped', () => {
  for (const names of ['x'.repeat(81), Array(51).fill('Example Guest').join('\n')]) assert.ok(preparePrintInvitations(draft({ names })).errors.names);
  for (const replyContact of ['x'.repeat(181), 'One\nTwo\nThree\nFour']) assert.ok(preparePrintInvitations(draft({ replyContact })).errors.replyContact);
  assert.deepEqual(preparePrintInvitations(draft({ names: 'x'.repeat(80), replyContact: 'One\nTwo\nThree' })).errors, {});
});
test('reply deadlines are optional, validated and formatted without a timezone shift', () => {
  assert.equal(preparePrintInvitations(draft()).deadline, '');
  assert.equal(preparePrintInvitations(draft({ replyBy: '2027-05-01' })).deadline, '1 May 2027');
  for (const replyBy of ['2027-02-30', '2027-07-18', 'not-a-date']) assert.ok(preparePrintInvitations(draft({ replyBy })).errors.replyBy);
});
