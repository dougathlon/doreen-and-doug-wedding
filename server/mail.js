import { editToken } from "./security.js";
import { answerLabel } from "../src/replies.js";

export function mailReady(env) {
  return Boolean(env.RESEND_API_KEY && env.MAIL_FROM && env.WEDDING_CONTACT_EMAIL && env.PUBLIC_ORIGIN);
}
export async function sendEmail(env, message, key) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST", signal: AbortSignal.timeout(12000),
    headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": key },
    body: JSON.stringify({ from: env.MAIL_FROM, reply_to: env.WEDDING_CONTACT_EMAIL, ...message }),
  });
  if (!response.ok) throw new Error(`Mail provider returned ${response.status}`);
  const result = await response.json();
  if (!result.id) throw new Error("Mail provider did not acknowledge the message");
}

export async function drainOutbox(env, deliver = sendEmail) {
  if (!mailReady(env)) return;
  const now = Math.floor(Date.now() / 1000);
  const { results } = await env.DB.prepare("SELECT id FROM outbox WHERE sent_at IS NULL AND next_attempt_at <= ? AND lease_until < ? ORDER BY created_at LIMIT 10").bind(now, now).all();
  for (const { id } of results) {
    const item = await env.DB.prepare("UPDATE outbox SET lease_until=?, first_attempt_at=COALESCE(first_attempt_at,?), attempts=attempts+1 WHERE id=? AND sent_at IS NULL AND lease_until < ? RETURNING *").bind(now + 60, now, id, now).first();
    if (!item) continue;
    // Resend retains idempotency keys for 24 hours. Stop automatic retries before that protection expires.
    if (now - item.first_attempt_at >= 23 * 3600) {
      await env.DB.prepare("UPDATE outbox SET last_error='Delivery uncertain; check the mail provider before resending', next_attempt_at=? WHERE id=?").bind(253402300799, id).run();
      continue;
    }
    try {
      const current = await env.DB.prepare("SELECT included, link_generation, name, email, friday, saturday FROM responses WHERE id=?").bind(item.response_id).first();
      const saved = JSON.parse(item.snapshot);
      if (item.kind === "guest" && (!current?.included || current.link_generation !== saved.generation ||
        ["name", "email", "friday", "saturday"].some((field) => current[field] !== saved[field]))) {
        await env.DB.prepare("UPDATE outbox SET sent_at=?, last_error='Cancelled after the response or private link changed' WHERE id=?").bind(new Date().toISOString(), id).run();
        continue;
      }
      const message = item.kind === "organiser" ? {
        to: [env.WEDDING_CONTACT_EMAIL], subject: "Wedding reply received or amended",
        text: `A wedding reply has been saved.\n\nView the private response list:\n${env.PUBLIC_ORIGIN}/admin.html\n\nFood notes are available only in the private list.`,
      } : {
        to: [saved.email], subject: "Your reply to Doreen & Doug",
        text: `${saved.name},\n\nThank you for your reply.\nFriday, 16 July: ${answerLabel[saved.friday]}\nSaturday, 17 July: ${answerLabel[saved.saturday]}\n\nKeep this private link if you wish to amend your reply:\n${env.PUBLIC_ORIGIN}/#amend=${await editToken(env, item.response_id, saved.generation)}\n\nDoreen & Doug`,
      };
      await deliver(env, message, `wedding-${item.id}`);
      await env.DB.prepare("UPDATE outbox SET sent_at=?, last_error=NULL, lease_until=0 WHERE id=?").bind(new Date().toISOString(), id).run();
    } catch {
      // Do not retain provider responses, credentials, addresses or food notes in error logs.
      await env.DB.prepare("UPDATE outbox SET last_error='Delivery failed; retry pending', lease_until=0, next_attempt_at=? WHERE id=?")
        .bind(now + Math.min(3600, 60 * 2 ** Math.min(item.attempts, 6)), id).run();
    }
  }
}
