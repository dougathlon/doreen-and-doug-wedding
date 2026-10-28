import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { createApp } from '../server/app.js';
import { HttpError, randomToken, verifyAccess, hash } from '../server/security.js';
import { drainOutbox } from '../server/mail.js';
import { TestD1 } from './d1-fixture.mjs';

function fixture(t, options = {}) {
  const db = options.db || new TestD1(); t.after(() => db.close());
  const env = { DB: db, TOKEN_SECRET: randomToken(), PUBLIC_ORIGIN: 'https://wedding.test', RSVP_OPEN: 'true', ACCESS_TEAM_DOMAIN: 'https://example.cloudflareaccess.com', ACCESS_AUD: 'test-audience', ADMIN_EMAILS: 'organiser@example.com', ...options.env };
  const app = createApp({ localDemo: true, authorizeAdmin: async (request) => { if (request.headers.get('x-test-admin') !== 'yes') throw new HttpError(403, 'Sign in'); }, ...options.app });
  async function request(path, method = 'GET', body, headers = {}) {
    return app.fetch(new Request(env.PUBLIC_ORIGIN + path, { method, headers: { ...(method !== 'GET' ? { origin: env.PUBLIC_ORIGIN, 'content-type': 'application/json' } : {}), ...headers }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }), env, { waitUntil: () => {} });
  }
  async function create(overrides = {}) {
    const body = { name: 'Test Guest', email: '', friday: 'yes', saturday: 'yes', allergies: 'Example only', submissionKey: randomToken(), ...overrides };
    const response = await request('/api/replies', 'POST', body);
    assert.equal(response.status, 201, await response.clone().text()); return { body, ...(await response.json()) };
  }
  async function session(token) {
    const response = await request('/api/session', 'POST', { token });
    assert.equal(response.status, 200); return response.headers.get('set-cookie').split(';')[0];
  }
  return { db, env, app, request, create, session };
}
const admin = { 'x-test-admin': 'yes' };
const amend = (saved, changes = {}) => ({ name: saved.name, email: saved.email, friday: saved.friday, saturday: saved.saturday, allergies: saved.allergies, id: saved.id, version: saved.version, mutationKey: randomToken(), ...changes });

test('save, reopen, amend, retry and export the same private reply', async (t) => {
  const f = fixture(t); const first = await f.create(); const cookie = await f.session(first.editToken);
  const read = await f.request('/api/reply', 'GET', undefined, { cookie }); assert.equal((await read.json()).reply.name, 'Test Guest');
  const change = amend(first.reply, { saturday: 'no' });
  for (let i = 0; i < 2; i++) assert.equal((await f.request('/api/reply', 'PATCH', change, { cookie })).status, 200);
  const list = await (await f.request('/api/admin/replies', 'GET', undefined, admin)).json();
  assert.equal(list.totals.received, 1); assert.equal(list.totals.saturdayYes, 0); assert.equal(list.totals.fridayYes, 1);
  assert.equal(list.replies[0].version, 2);
  const csv = await (await f.request('/api/admin/export?kind=attendance', 'GET', undefined, admin)).text();
  assert.ok(csv.includes('Test Guest')); assert.ok(!csv.includes('Example only'));
});
test('initial retry is idempotent; people with identical names and emails remain separate', async (t) => {
  const f = fixture(t); const first = await f.create();
  const retry = await f.request('/api/replies', 'POST', first.body); const second = await retry.json();
  assert.equal(second.reply.id, first.reply.id); assert.equal(second.editToken, first.editToken);
  assert.equal((await f.request('/api/replies', 'POST', { ...first.body, name: 'Changed' })).status, 409);
  const other = await f.create(); assert.notEqual(other.reply.id, first.reply.id);
  assert.equal((await f.db.prepare('SELECT count(*) AS n FROM responses').first()).n, 2);
});
test('amendments reject old versions, cross-response IDs and unexpected companion fields', async (t) => {
  const f = fixture(t); const a = await f.create(); const b = await f.create({ name: 'Second Guest' }); const cookie = await f.session(b.editToken);
  assert.equal((await f.request('/api/reply', 'PATCH', amend(a.reply), { cookie })).status, 409);
  assert.equal((await f.request('/api/reply', 'PATCH', amend(b.reply, { guestCount: 2 }), { cookie })).status, 400);
  assert.equal((await f.request('/api/reply', 'PATCH', amend(b.reply, { saturday: 'no' }), { cookie })).status, 200);
  assert.equal((await f.request('/api/reply', 'PATCH', amend(b.reply), { cookie })).status, 409);
});
test('replies, administration and exports are inaccessible without the appropriate credential', async (t) => {
  const f = fixture(t); await f.create();
  for (const path of ['/api/reply', '/api/admin/replies', '/api/admin/export', '/admin.html', '/admin', '/admin/']) assert.ok([401,403].includes((await f.request(path)).status));
  assert.equal((await f.request('/api/session', 'POST', { token: randomToken() })).status, 401);
  const dbRow = await f.db.prepare('SELECT * FROM responses').first(); assert.ok(dbRow.token_hash); assert.equal(dbRow.editToken, undefined);
});
test('CSRF, malformed JSON, oversize bodies, bot fields and unsupported fields are rejected', async (t) => {
  const f = fixture(t); const first = await f.create();
  assert.equal((await f.request('/api/replies', 'POST', first.body, { origin: 'https://other.test' })).status, 403);
  assert.equal((await f.request('/api/replies', 'POST', { ...first.body, website: 'bot' })).status, 422);
  assert.equal((await f.request('/api/replies', 'POST', { ...first.body, extra: 'x'.repeat(9000) })).status, 413);
  assert.equal((await f.request('/api/replies', 'POST', { ...first.body, guests: ['Other'] })).status, 400);
  assert.equal((await f.request('/api/replies', 'POST', { ...first.body, name: '' })).status, 422);
  const malformed = new Request(f.env.PUBLIC_ORIGIN + '/api/replies', { method: 'POST', headers: { origin: f.env.PUBLIC_ORIGIN, 'content-type': 'application/json' }, body: '{' });
  assert.equal((await f.app.fetch(malformed, f.env, { waitUntil: () => {} })).status, 400);
});
test('all attendance combinations save and a complete decline drops food notes', async (t) => {
  const f = fixture(t);
  for (const friday of ['yes','no','unsure']) for (const saturday of ['yes','no']) {
    const result = await f.create({ friday, saturday });
    assert.equal(result.reply.allergies, friday === 'no' && saturday === 'no' ? '' : 'Example only');
  }
});
test('deadlines and missing configuration fail closed', async (t) => {
  const f = fixture(t); const first = await f.create();
  f.env.RSVP_DEADLINE = '2026-01-01T00:00:00Z'; assert.equal((await f.request('/api/replies','POST',first.body)).status,409);
  f.env.RSVP_DEADLINE = 'not a date';
  const invalidDeadline = await (await f.request('/api/config')).json();
  assert.equal(invalidDeadline.open, false); assert.equal(invalidDeadline.deadline, '');
  assert.equal((await f.request('/api/replies','POST',first.body)).status,503);
  delete f.env.RSVP_DEADLINE; f.env.TOKEN_SECRET = ''; assert.equal((await f.request('/api/config')).status,200);
  assert.equal((await (await f.request('/api/config')).json()).open,false);
  assert.equal((await f.request('/api/replies','POST',first.body)).status,503);
});
test('rate limiting persists in the database without retaining IP addresses', async (t) => {
  const f = fixture(t);
  for (let n=0;n<30;n++) await f.request('/api/session','POST',{token:randomToken()},{'cf-connecting-ip':'192.0.2.1'});
  assert.equal((await f.request('/api/session','POST',{token:randomToken()},{'cf-connecting-ip':'192.0.2.1'})).status,429);
  const row = await f.db.prepare('SELECT * FROM rate_limits').first(); assert.ok(!JSON.stringify(row).includes('192.0.2.1'));
});
test('excluding a duplicate removes it from totals and prevents guest access', async (t) => {
  const f=fixture(t); const a=await f.create(); const cookie=await f.session(a.editToken);
  assert.equal((await f.request(`/api/admin/replies/${a.reply.id}`,'PATCH',{...amend(a.reply),included:0,source:'online'},admin)).status,200);
  assert.equal((await f.request('/api/reply','GET',undefined,{cookie})).status,401);
  assert.equal((await f.request('/api/session','POST',{token:a.editToken})).status,401);
  const data=await (await f.request('/api/admin/replies','GET',undefined,admin)).json(); assert.equal(data.totals.included,0);
});
test('replacing an amendment link revokes the old token and all existing sessions', async (t) => {
  const f=fixture(t); const a=await f.create(); const cookie=await f.session(a.editToken);
  const replacement=await (await f.request(`/api/admin/replies/${a.reply.id}/link`,'POST',{version:1},admin)).json();
  assert.ok(replacement.editToken); assert.notEqual(replacement.editToken,a.editToken);
  assert.equal((await f.request('/api/reply','GET',undefined,{cookie})).status,401);
  assert.equal((await f.request('/api/session','POST',{token:a.editToken})).status,401);
  assert.equal((await f.request('/api/replies','POST',a.body)).status,409);
  await f.session(replacement.editToken);
});
test('save and outbox insertion are atomic when the notification table fails', async (t) => {
  const f=fixture(t); f.db.sqlite.exec('DROP TABLE outbox');
  const response=await f.request('/api/replies','POST',{name:'Test',email:'',friday:'yes',saturday:'yes',allergies:'',submissionKey:randomToken()});
  assert.equal(response.status,503); assert.equal((await f.db.prepare('SELECT count(*) AS n FROM responses').first()).n,0);
});
test('mail failure preserves the response; retries use the same key and omit food notes', async (t) => {
  const f=fixture(t,{env:{GUEST_RECEIPTS:'true',RESEND_API_KEY:'test',MAIL_FROM:'Test <test@example.com>',WEDDING_CONTACT_EMAIL:'organiser@example.com'}});
  const a=await f.create({email:'guest@example.com',allergies:'PRIVATE FOOD NOTE'});
  await drainOutbox(f.env,async()=>{throw new Error('failure')});
  assert.equal((await f.db.prepare('SELECT count(*) AS n FROM responses').first()).n,1);
  await f.db.prepare('UPDATE outbox SET next_attempt_at=0,lease_until=0').run();
  const delivered=[]; await drainOutbox(f.env,async(_env,message,key)=>{delivered.push({message,key})});
  assert.equal(delivered.length,2); assert.ok(!JSON.stringify(delivered).includes('PRIVATE FOOD NOTE'));
  assert.ok(delivered.find(({message})=>message.to[0]==='guest@example.com').message.text.includes(a.editToken));
  await drainOutbox(f.env,async()=>assert.fail('Already delivered')); assert.equal((await f.db.prepare('SELECT count(*) AS n FROM outbox WHERE sent_at IS NULL').first()).n,0);
});
test('ambiguous mail retries stop before provider idempotency expires', async (t) => {
  const f=fixture(t,{env:{RESEND_API_KEY:'test',MAIL_FROM:'test@example.com',WEDDING_CONTACT_EMAIL:'organiser@example.com'}});
  await f.create(); await f.db.prepare('UPDATE outbox SET first_attempt_at=?').bind(Math.floor(Date.now()/1000)-24*3600).run();
  await drainOutbox(f.env,async()=>assert.fail('Must not resend outside the idempotency window'));
  assert.match((await f.db.prepare('SELECT last_error FROM outbox').first()).last_error,/uncertain/);
});
test('queued guest receipts do not send superseded attendance answers', async (t) => {
  const f=fixture(t,{env:{GUEST_RECEIPTS:'true',RESEND_API_KEY:'test',MAIL_FROM:'test@example.com',WEDDING_CONTACT_EMAIL:'organiser@example.com'}});
  const first=await f.create({email:'guest@example.com'}); const cookie=await f.session(first.editToken);
  assert.equal((await f.request('/api/reply','PATCH',amend(first.reply,{saturday:'no'}),{cookie})).status,200);
  const delivered=[]; await drainOutbox(f.env,async(_env,message)=>delivered.push(message));
  const receipts=delivered.filter(message=>message.to[0]==='guest@example.com');
  assert.equal(receipts.length,1); assert.match(receipts[0].text,/Saturday, 17 July: Will not attend/);
});
test('exports neutralise formulas and catering omits people who decline both days', async (t) => {
  const f=fixture(t); await f.create({name:'=1+1',allergies:'@SUM(A1)'}); await f.create({name:'Declined',friday:'no',saturday:'no'});
  const text=await (await f.request('/api/admin/export?kind=catering','GET',undefined,admin)).text();
  assert.ok(text.includes("'=1+1")); assert.ok(text.includes("'@SUM(A1)")); assert.ok(!text.includes('Declined'));
});
test('a database backup restores answers and valid private amendment credentials', async (t) => {
  const directory=mkdtempSync(join(tmpdir(),'wedding-db-')); t.after(()=>rmSync(directory,{recursive:true,force:true}));
  const f=fixture(t); const a=await f.create(); const backup=join(directory,'backup.sqlite');
  f.db.sqlite.prepare('VACUUM INTO ?').run(backup);
  const restored=new TestD1(backup,false); t.after(()=>restored.close());
  const row=await restored.prepare('SELECT * FROM responses WHERE token_hash=?').bind(await hash(a.editToken)).first();
  assert.equal(row.name,a.reply.name); assert.equal(row.allergies,a.reply.allergies);
});
test('production access verifies JWT signature, audience, expiry and organiser allowlist', async () => {
  const {privateKey,publicKey}=await generateKeyPair('RS256'); const jwk=await exportJWK(publicKey); jwk.kid='test';
  const keys=createLocalJWKSet({keys:[jwk]}); const env={ACCESS_TEAM_DOMAIN:'https://example.cloudflareaccess.com',ACCESS_AUD:'aud',ADMIN_EMAILS:'organiser@example.com'};
  async function signed(overrides={}) {return new SignJWT({email:'organiser@example.com',...overrides}).setProtectedHeader({alg:'RS256',kid:'test'}).setIssuer(env.ACCESS_TEAM_DOMAIN).setAudience(overrides.aud||'aud').setSubject('id').setIssuedAt().setExpirationTime(overrides.exp||'1h').sign(privateKey)}
  const req=(token)=>new Request('https://wedding.test/api/admin/replies',{headers:{'cf-access-jwt-assertion':token}});
  assert.equal(await verifyAccess(req(await signed()),env,keys),'organiser@example.com');
  for (const payload of [{email:'other@example.com'},{aud:'other'},{exp:1}]) await assert.rejects(()=>signed(payload).then(token=>verifyAccess(req(token),env,keys)));
  await assert.rejects(()=>verifyAccess(req('forged'),env,keys));
});
