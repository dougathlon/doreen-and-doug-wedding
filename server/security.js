import { createRemoteJWKSet, jwtVerify } from "jose";

export class HttpError extends Error {
  constructor(status, message, fields) { super(message); this.status = status; this.fields = fields; }
}
const encoder = new TextEncoder();
export function randomToken() {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}
function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
export async function hash(value) {
  return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}
export async function editToken(env, id, generation) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(env.TOKEN_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(`${id}:${generation}`))));
}
export function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra } });
}
export async function readBody(request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new HttpError(415, "Please submit the form as JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "The reply is missing.");
  let size = 0; const chunks = [];
  for (;;) {
    const { value, done } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > 8192) { await reader.cancel(); throw new HttpError(413, "This reply is too large."); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try {
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body;
  } catch { throw new HttpError(400, "The reply could not be read. Please try again."); }
}
export function checkOrigin(request, env) {
  if (request.headers.get("origin") !== env.PUBLIC_ORIGIN || new URL(request.url).origin !== env.PUBLIC_ORIGIN) {
    throw new HttpError(403, "Please submit your reply from the invitation website.");
  }
}
export function checkFields(body, allowed) {
  if (Object.keys(body).some((key) => !allowed.includes(key))) throw new HttpError(400, "The form contains an unexpected field. Please reload the invitation.");
}
export function checkKey(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(value)) throw new HttpError(400, "The reply reference is invalid. Please reload the invitation.");
}
export async function verifyAccess(request, env, keySet) {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || !env.ADMIN_EMAILS) throw new HttpError(503, "Organiser access has not been configured.");
  const issuer = env.ACCESS_TEAM_DOMAIN.replace(/\/$/, "");
  if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer)) throw new HttpError(503, "Organiser access has not been configured.");
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) throw new HttpError(401, "Please sign in through the organiser access page.");
  try {
    const { payload } = await jwtVerify(token, keySet || createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`)), {
      issuer, audience: env.ACCESS_AUD, algorithms: ["RS256"], requiredClaims: ["exp", "iat", "sub", "email"],
    });
    const allowed = env.ADMIN_EMAILS.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
    if (typeof payload.email !== "string" || !allowed.includes(payload.email.toLowerCase())) throw new Error();
    return payload.email;
  } catch { throw new HttpError(403, "This account cannot view the wedding replies."); }
}
export async function rateLimit(request, env, bucket, limit, seconds, localDemo) {
  const ip = request.headers.get("cf-connecting-ip") || (localDemo ? "local" : "unknown");
  const now = Math.floor(Date.now() / 1000);
  const key = await hash(`${env.TOKEN_SECRET}:${bucket}:${Math.floor(now / seconds)}:${ip}`);
  const row = await env.DB.prepare("INSERT INTO rate_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count")
    .bind(key, now + seconds).first();
  if (row.count > limit) throw new HttpError(429, "Too many attempts. Please wait a little before trying again.");
}
export function csv(rows, fields) {
  const cell = (value) => {
    let text = String(value ?? "");
    if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  return "\uFEFF" + [fields.map(cell).join(","), ...rows.map((row) => fields.map((field) => cell(row[field])).join(","))].join("\r\n");
}
