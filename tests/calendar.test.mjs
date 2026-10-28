import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('calendar leaves Friday without a venue and imports Saturday at 1pm in the UK', () => {
  const calendar = readFileSync(new URL('../public/wedding-weekend.ics', import.meta.url), 'utf8');
  const events = calendar.replace(/\r\n /g, '').split('BEGIN:VEVENT').slice(1);
  assert.equal(events.length, 2);
  const friday = events.find((event) => event.includes('UID:friday-202707@doreen-and-doug-wedding'));
  assert.ok(friday, 'Friday must retain its original event identity');
  assert.match(friday, /DTSTART;VALUE=DATE:20270716\r\nDTEND;VALUE=DATE:20270717/);
  assert.doesNotMatch(friday, /LOCATION:|Sir John Moore|101 Top Street/);
  const saturday = events.find((event) => event.includes('UID:wedding-'));
  const start = saturday.match(/DTSTART:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/);
  assert.ok(start, 'Saturday must specify an unambiguous instant');
  const [, year, month, day, hour, minute, second] = start;
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).map(({ type, value }) => [type, value]));
  assert.deepEqual([parts.year, parts.month, parts.day, parts.hour, parts.minute], ['2027', '07', '17', '13', '00']);
  assert.doesNotMatch(saturday, /DTEND|DURATION/);
  assert.match(saturday, /LOCATION:St Michael & All Angels/);
  assert.match(saturday, /Afterwards at Sir John Moore School\./);
});
