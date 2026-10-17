# Replies and private administration — next phase

Status: design only. No wedding account, email destination, storage service or server endpoint has been created or connected.

Decision confirmed by Doug on 17 October 2026: one named individual per invitation, with each person answering for themselves. The earlier household model is superseded.

## Recommended shape

Use persistent private storage as the record of replies, with email notifications to the wedding account after a successful save. Email alone is a poor record: corrections and retried submissions can produce conflicting headcounts. Saving the reply must not depend on delivery of a notification.

GitHub Pages can continue serving the invitation. A small HTTPS API and private database can supply the RSVP and organiser views later. Choose infrastructure together with the wedding account; no provider lock-in is introduced in this preview.

## Data and access boundaries

- Named guest: stable ID, display name and specifically allowed event IDs. Each guest responds for themselves, including when two invited people are a couple. There are no household replies, companion places, guest counts, editable guest names or add-person controls.
- Personal invitation: one guest ID, optional contact email, hashed unguessable access token, revoked/expiry state. Each link grants access to exactly one guest. A real guest list must never be bundled into the public JavaScript.
- Event: Friday gathering, 16 July 2027; Saturday wedding, 17 July 2027. Saturday begins at 1pm UK local time; Friday's time remains unset. Attendance is per guest per event.
- Reply: guest ID + event ID as a unique key, yes/no for Saturday and yes/no/uncertain for Friday. A later amendment replaces the same record. Preserve an organiser-visible update timestamp/version.
- Food allergy or intolerance note: optional text, at most 1,000 characters, belonging to the individual guest. No menu selections while catering remains undecided. Exclude notes for people declining both events from catering exports.
- Organiser: separately authenticated Doug/Doreen accounts, least-privilege administrative access. A public link or invitation token is not an administrator credential.

Personal-link tokens should not go into third-party URLs or page analytics. Prefer a URL fragment consumed by the application and exchanged for a short-lived secure session, then remove it from browser history. Store only a hash of the long-lived invitation token; make it revocable. Restrict CORS to the deployed origin, derive the guest identity from the authenticated invitation and validate event permission server-side, use secure HttpOnly cookies, protect writes against CSRF, and rate-limit lookup/write endpoints. Ignore client-supplied guest identity and reject attempts to write replies for another guest. A link is a bearer credential: it can be forwarded, so it identifies the invitation rather than proving who holds it. Keep it private and revocable. Client-side checks alone provide no access control.

## Guest flow

1. Open a personal invitation link and show that guest's fixed name and allowed events.
2. Ask ‘Will you join us?’ and give separate Friday/Saturday answers for that individual. Explain ‘Please reply for yourself; each guest has a separate invitation.’ Do not offer extra names or a headcount selector.
3. Add optional food allergy or intolerance notes. Explain that these are for wedding arrangements and only the organisers/relevant catering recipients will receive them.
4. Review; save one transaction with an idempotency key and record version.
5. Confirm only after durable storage succeeds. Show a retryable error if it fails; retain the unsent draft in page memory.
6. Allow an authorised return visit and amendments before the chosen deadline. Detect conflicting versions from separate tabs or devices instead of silently overwriting a newer reply.
7. Send email notification after saving, without placing allergy or intolerance text in the email. An email failure must leave the saved response intact and be visible to organisers.

## Private organiser view

Import/review a CSV of named individual guests; inspect import errors before writing. View Friday yes/no/uncertain totals and Saturday yes/no totals separately, with unanswered invitations visible. Edit an invitation, revoke a link, and record telephone replies with the same rules as guest replies. Export attendance and a minimal catering/allergy-and-intolerance list separately. Quote/escape CSV cells and neutralise spreadsheet formula prefixes. Protect exports and backups; define deletion/archive arrangements after the wedding.

## Release checks before accepting real replies

Verify wrong/expired/revoked tokens, cross-guest access attempts, guest-identity substitution, companion injection and event tampering; distinct links for two invited partners; Friday-only and Saturday-only attendance; complete decline; empty and maximum-length allergy or intolerance notes; duplicate submits; amendments/version conflicts; deadline/time-zone handling; database failure, offline retry and email failure; separate organiser access; export totals; backup and restore. Confirm the live privacy notice and wedding contact route before turning off the preview labels.
