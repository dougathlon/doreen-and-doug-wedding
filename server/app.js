import { blankReply, reviewReply, validateReply } from "../src/replies.js";
import { HttpError, checkFields, checkKey, checkOrigin, csv, editToken, hash, json, randomToken, rateLimit, readBody, verifyAccess } from "./security.js";
import { drainOutbox, mailReady, sendEmail } from "./mail.js";

const replyFields = Object.keys(blankReply());
function checkedReply(body) {
  const reply = Object.fromEntries(replyFields.map((field) => [field, body[field]]));
  const errors = validateReply(reply);
  if (Object.keys(errors).length) throw new HttpError(422, "Please check the particulars below.", errors);
  return reviewReply(reply);
}
function publicReply(row) {
  return { id: row.id, ...Object.fromEntries(replyFields.map((field) => [field, row[field]])), version: row.version, updatedAt: row.updated_at };
}
function configured(env, localDemo) {
  return Boolean(env.DB && env.TOKEN_SECRET?.length >= 32 && env.PUBLIC_ORIGIN &&
    (localDemo || (/^https:\/\/[^/]+$/.test(env.PUBLIC_ORIGIN) && env.ACCESS_TEAM_DOMAIN && env.ACCESS_AUD && env.ADMIN_EMAILS)));
}
function deadlinePassed(env) { return Boolean(env.RSVP_DEADLINE && Date.now() >= Date.parse(env.RSVP_DEADLINE)); }
function validDeadline(env) { return !env.RSVP_DEADLINE || Number.isFinite(Date.parse(env.RSVP_DEADLINE)); }
function requireOpen(env, localDemo) {
  if (!configured(env, localDemo) || env.RSVP_OPEN !== "true") throw new HttpError(503, "Replies are not yet open. Please try again later.");
  if (!validDeadline(env)) throw new HttpError(503, "The reply deadline needs attention. Please contact us.");
  if (deadlinePassed(env)) throw new HttpError(409, "The reply date has passed. Please contact Doreen or Doug to make a change.");
}
function cookieName(localDemo) { return localDemo ? "wedding_reply_local" : "__Host-wedding_reply"; }
function cookie(token, localDemo, maxAge = 86400) {
  return `${cookieName(localDemo)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${localDemo ? "" : "; Secure"}`;
}
async function guest(request, env, localDemo) {
  const value = (request.headers.get("cookie") || "").split(";").map((part) => part.trim()).find((part) => part.startsWith(`${cookieName(localDemo)}=`))?.split("=")[1];
  if (!value || !/^[A-Za-z0-9_-]{43}$/.test(value)) throw new HttpError(401, "Please open your private amendment link to see this reply.");
  const sessionHash = await hash(value);
  const row = await env.DB.prepare("SELECT responses.* FROM responses JOIN sessions ON responses.id=sessions.response_id WHERE sessions.token_hash=? AND sessions.expires_at>?")
    .bind(sessionHash, Math.floor(Date.now() / 1000)).first();
  if (!row || !row.included) throw new HttpError(401, "This amendment link is no longer available. Please contact Doreen or Doug.");
  return { row, sessionHash };
}

export function createApp({ authorizeAdmin = verifyAccess, deliver = sendEmail, localDemo = false } = {}) {
  async function createReply(body, env, admin = false) {
    checkFields(body, [...replyFields, "submissionKey", "website", ...(admin ? ["source"] : [])]);
    checkKey(body.submissionKey);
    if (body.website) throw new HttpError(422, "The reply could not be accepted. Please contact Doreen or Doug.");
    const reply = checkedReply(body);
    const source = admin ? body.source : "online";
    if (!["online", "telephone", "post"].includes(source)) throw new HttpError(422, "Please choose how this reply was received.");
    const submissionHash = await hash(body.submissionKey);
    const digest = await hash(JSON.stringify({ ...reply, source }));
    const id = crypto.randomUUID(); const generation = randomToken();
    const token = await editToken(env, id, generation);
    const now = new Date().toISOString();
    const receipt = !admin && env.GUEST_RECEIPTS === "true" && mailReady(env) ? 1 : 0;
    await env.DB.prepare(`INSERT INTO responses (id,submission_hash,creation_digest,name,email,friday,saturday,allergies,source,last_mutation,receipt_requested,link_generation,token_hash,created_at,updated_at)
      SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE (SELECT count(*) FROM responses)<5000 ON CONFLICT(submission_hash) DO NOTHING`)
      .bind(id, submissionHash, digest, reply.name, reply.email, reply.friday, reply.saturday, reply.allergies, source, submissionHash, receipt, generation, await hash(token), now, now).run();
    const row = await env.DB.prepare("SELECT * FROM responses WHERE submission_hash=?").bind(submissionHash).first();
    if (!row) throw new HttpError(503, "We cannot accept another reply just now. Please contact Doreen or Doug.");
    if (row.creation_digest !== digest) throw new HttpError(409, "An earlier version of this reply was already saved. Restore the earlier answers and retry, or contact Doreen or Doug.");
    if (!row.included || (row.id !== id && row.link_generation !== generation && row.version > 1)) {
      // A retried initial submission must not reissue a link that organisers have since replaced.
      throw new HttpError(409, "This reply has since changed. Please use your private amendment link or contact Doreen or Doug.");
    }
    return { reply: publicReply(row), editToken: await editToken(env, row.id, row.link_generation) };
  }

  async function amendReply(body, row, env, admin = false) {
    checkFields(body, [...replyFields, "version", "mutationKey", "id", ...(admin ? ["included", "source"] : [])]);
    checkKey(body.mutationKey);
    if (!admin && body.id !== row.id) throw new HttpError(409, "Another reply is open in this browser. Reopen your own private link before saving.");
    if (!Number.isInteger(body.version) || body.version < 1) throw new HttpError(422, "The saved reply version is missing. Reopen your private link.");
    const reply = checkedReply(body);
    const included = admin ? body.included : row.included;
    const source = admin ? body.source : row.source;
    if (![0, 1].includes(included) || !["online", "telephone", "post"].includes(source)) throw new HttpError(422, "The response status is invalid.");
    const mutation = await hash(JSON.stringify({ ...reply, included, source, key: body.mutationKey, version: body.version }));
    if (row.last_mutation === mutation) return { reply: publicReply(row) };
    const receipt = !admin && env.GUEST_RECEIPTS === "true" && mailReady(env) ? 1 : 0;
    const updated = await env.DB.prepare(`UPDATE responses SET name=?,email=?,friday=?,saturday=?,allergies=?,included=?,source=?,last_mutation=?,receipt_requested=?,version=version+1,updated_at=? WHERE id=? AND version=? RETURNING *`)
      .bind(reply.name, reply.email, reply.friday, reply.saturday, reply.allergies, included, source, mutation, receipt, new Date().toISOString(), row.id, body.version).first();
    if (!updated) throw new HttpError(409, "This reply has changed elsewhere. Reopen it to see the latest answers before amending it.");
    return { reply: publicReply(updated) };
  }

  async function route(request, env, ctx) {
    const url = new URL(request.url); const path = url.pathname;
    const api = path.startsWith("/api/");
    const adminPage = ["/admin", "/admin/", "/admin.html"].includes(path);
    if (!api && !adminPage) return env.ASSETS.fetch(request);
    if (path === "/api/config" && request.method === "GET") return json({
      available: configured(env, localDemo), open: configured(env, localDemo) && env.RSVP_OPEN === "true" && validDeadline(env) && !deadlinePassed(env),
      localDemo, emailReceipts: !localDemo && env.GUEST_RECEIPTS === "true" && mailReady(env),
      contactEmail: configured(env, localDemo) && !localDemo ? env.WEDDING_CONTACT_EMAIL || "" : "",
      deadline: validDeadline(env) ? env.RSVP_DEADLINE || "" : "",
    });
    if (!configured(env, localDemo)) throw new HttpError(503, "The reply service is not configured yet.");
    if (!["GET", "HEAD"].includes(request.method)) checkOrigin(request, env);
    const admin = adminPage || path.startsWith("/api/admin/");
    if (admin) await authorizeAdmin(request, env);
    if (adminPage) return path === "/admin/" ? Response.redirect(new URL("/admin", request.url), 302) : env.ASSETS.fetch(request);
    const notify = () => { if (!localDemo) ctx.waitUntil(drainOutbox(env, deliver)); };

    if (path === "/api/replies" && request.method === "POST") {
      requireOpen(env, localDemo); await rateLimit(request, env, "create", 20, 3600, localDemo);
      const result = await createReply(await readBody(request), env); notify(); return json(result, 201);
    }
    if (path === "/api/session" && request.method === "POST") {
      await rateLimit(request, env, "session", 30, 900, localDemo);
      const body = await readBody(request); checkFields(body, ["token"]); checkKey(body.token);
      const row = await env.DB.prepare("SELECT * FROM responses WHERE token_hash=? AND included=1").bind(await hash(body.token)).first();
      if (!row) throw new HttpError(401, "This amendment link is not recognised or has been replaced. Please contact Doreen or Doug.");
      const token = randomToken(); const now = Math.floor(Date.now() / 1000);
      await env.DB.prepare("INSERT INTO sessions(token_hash,response_id,expires_at) VALUES(?,?,?)").bind(await hash(token), row.id, now + 86400).run();
      return json({ reply: publicReply(row), editToken: body.token }, 200, { "Set-Cookie": cookie(token, localDemo) });
    }
    if (path === "/api/session" && request.method === "DELETE") {
      const { sessionHash } = await guest(request, env, localDemo);
      await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(sessionHash).run();
      return json({ ok: true }, 200, { "Set-Cookie": cookie("", localDemo, 0) });
    }
    if (path === "/api/reply" && request.method === "GET") {
      const { row } = await guest(request, env, localDemo);
      return json({ reply: publicReply(row), editToken: await editToken(env, row.id, row.link_generation) });
    }
    if (path === "/api/reply" && request.method === "PATCH") {
      requireOpen(env, localDemo); await rateLimit(request, env, "amend", 30, 900, localDemo);
      const { row } = await guest(request, env, localDemo);
      const result = await amendReply(await readBody(request), row, env); notify(); return json(result);
    }
    if (path === "/api/admin/replies" && request.method === "POST") {
      const result = await createReply(await readBody(request), env, true); notify(); return json(result, 201);
    }
    if (path === "/api/admin/replies" && request.method === "GET") {
      const offset = Number(url.searchParams.get("offset") || 0);
      if (!Number.isSafeInteger(offset) || offset < 0 || offset > 5000) throw new HttpError(400, "Invalid page.");
      const { results } = await env.DB.prepare("SELECT id,name,email,friday,saturday,allergies,source,version,included,created_at,updated_at FROM responses ORDER BY created_at DESC,id LIMIT 200 OFFSET ?").bind(offset).all();
      const totals = await env.DB.prepare(`SELECT count(*) AS received, COALESCE(sum(included),0) AS included,
        COALESCE(sum(included=1 AND friday='yes'),0) AS fridayYes, COALESCE(sum(included=1 AND friday='unsure'),0) AS fridayUnsure,
        COALESCE(sum(included=1 AND friday='no'),0) AS fridayNo, COALESCE(sum(included=1 AND saturday='yes'),0) AS saturdayYes,
        COALESCE(sum(included=1 AND saturday='no'),0) AS saturdayNo FROM responses`).first();
      const mail = await env.DB.prepare("SELECT count(*) AS pending, COALESCE(sum(last_error IS NOT NULL),0) AS failed FROM outbox WHERE sent_at IS NULL").first();
      return json({ replies: results, totals, mail: { ...mail, configured: !localDemo && mailReady(env) }, localDemo, nextOffset: offset + results.length < totals.received ? offset + results.length : null });
    }
    if (path === "/api/admin/export" && request.method === "GET") {
      const catering = url.searchParams.get("kind") === "catering";
      const { results } = await env.DB.prepare(catering
        ? "SELECT name,friday,saturday,allergies FROM responses WHERE included=1 AND NOT(friday='no' AND saturday='no') ORDER BY name,id"
        : "SELECT name,email,friday,saturday,source,included,updated_at FROM responses ORDER BY name,id").all();
      return new Response(csv(results, catering ? ["name", "friday", "saturday", "allergies"] : ["name", "email", "friday", "saturday", "source", "included", "updated_at"]), {
        headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="wedding-${catering ? "catering" : "attendance"}.csv"`, "Cache-Control": "no-store" },
      });
    }
    if (path === "/api/admin/mail/retry" && request.method === "POST") {
      const body = await readBody(request); checkFields(body, []);
      if (localDemo || !mailReady(env)) throw new HttpError(503, "Email delivery is not connected.");
      await env.DB.prepare("UPDATE outbox SET next_attempt_at=0 WHERE sent_at IS NULL AND (first_attempt_at IS NULL OR first_attempt_at>?)").bind(Math.floor(Date.now() / 1000) - 23 * 3600).run();
      await drainOutbox(env, deliver); return json({ ok: true });
    }
    const match = path.match(/^\/api\/admin\/replies\/([a-f0-9-]{36})(\/link)?$/);
    if (match) {
      const row = await env.DB.prepare("SELECT * FROM responses WHERE id=?").bind(match[1]).first();
      if (!row) throw new HttpError(404, "This reply was not found.");
      if (request.method === "PATCH" && !match[2]) {
        const result = await amendReply(await readBody(request), row, env, true); notify(); return json(result);
      }
      if (request.method === "POST" && match[2]) {
        const body = await readBody(request); checkFields(body, ["version"]);
        if (body.version !== row.version) throw new HttpError(409, "Refresh the list before replacing this link.");
        const generation = randomToken(); const token = await editToken(env, row.id, generation);
        const results = await env.DB.batch([
          env.DB.prepare("UPDATE responses SET token_hash=?,link_generation=?,receipt_requested=0,version=version+1,updated_at=? WHERE id=? AND version=? RETURNING id").bind(await hash(token), generation, new Date().toISOString(), row.id, row.version),
          env.DB.prepare("DELETE FROM sessions WHERE response_id=? AND EXISTS(SELECT 1 FROM responses WHERE id=? AND link_generation=?)").bind(row.id, row.id, generation),
        ]);
        if (!results[0].results.length) throw new HttpError(409, "Refresh the list before replacing this link.");
        notify(); return json({ editToken: token });
      }
    }
    throw new HttpError(404, "This reply service address was not found.");
  }
  return {
    async fetch(request, env, ctx) {
      let response;
      try { response = await route(request, env, ctx); }
      catch (error) {
        response = error instanceof HttpError ? json({ error: error.message, fields: error.fields }, error.status)
          : json({ error: "The service could not complete this request. Please try again; if it persists, contact Doreen or Doug." }, 503);
      }
      const headers = new Headers(response.headers);
      headers.set("Referrer-Policy", "no-referrer"); headers.set("X-Content-Type-Options", "nosniff");
      headers.set("X-Frame-Options", "DENY"); headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
      headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
      if (new URL(request.url).pathname.startsWith("/api/") || new URL(request.url).pathname.startsWith("/admin")) headers.set("Cache-Control", "no-store");
      return new Response(response.body, { status: response.status, headers });
    },
    async scheduled(_event, env, ctx) {
      ctx.waitUntil((async () => {
        await env.DB.batch([
          env.DB.prepare("DELETE FROM sessions WHERE expires_at<=?").bind(Math.floor(Date.now() / 1000)),
          env.DB.prepare("DELETE FROM rate_limits WHERE expires_at<=?").bind(Math.floor(Date.now() / 1000)),
        ]);
        if (!localDemo) await drainOutbox(env, deliver);
      })());
    },
  };
}
