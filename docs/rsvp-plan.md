# Replies and private administration — next phase

Status: design only. No wedding account, email destination, storage service or server endpoint has been created or connected.

## Recommended shape

Use persistent private storage as the record of replies, with email notifications to the wedding account after a successful save. Email alone is a poor record: corrections, household splits and retried submissions can produce conflicting headcounts. Saving the reply must not depend on delivery of a notification.

GitHub Pages can continue serving the invitation. A small HTTPS API and private database can supply the RSVP and organiser views later. Choose infrastructure together with the wedding account; no provider lock-in is introduced in this preview.

## Data and access boundaries

- Invitation party: stable ID, optional contact email, hashed unguessable access token, revoked/expiry state. The token grants access to one party only. A real guest list must never be bundled into the public JavaScript.
- Guest: stable ID, party ID, display name and specifically allowed event IDs. Add a companion place only when the couple explicitly allows one. Do not infer children/plus-one policies from shared surnames.
- Event: Friday gathering, 16 July 2027; Saturday wedding, 17 July 2027. Their times remain unset. Attendance is per guest per event.
- Reply: guest ID + event ID as a unique key, yes/no for Saturday and yes/no/uncertain for Friday. A later amendment replaces the same record. Preserve an organiser-visible update timestamp/version.
- Allergy note: optional text, at most 1,000 characters, belonging to the individual guest. No menu selections while catering remains undecided. Exclude notes for people declining both events from catering exports.
- Organiser: separately authenticated Doug/Doreen accounts, least-privilege administrative access. A public link or invitation token is not an administrator credential.

Personal-link tokens should not go into third-party URLs or page analytics. Prefer a URL fragment consumed by the application and exchanged for a short-lived secure session, then remove it from browser history. Store only a hash of the long-lived invitation token; make it revocable. Restrict CORS to the deployed origin, validate party ownership/event permission server-side, use secure HttpOnly cookies, protect writes against CSRF, and rate-limit lookup/write endpoints. Client-side checks alone provide no access control.

## Guest flow

1. Open a personal invitation link and retrieve only that party's names and allowed events.
2. Give separate attendance answers for each named person. Do not offer arbitrary extra names.
3. Add optional allergy notes. Explain that these are for wedding arrangements and only the organisers/relevant catering recipients will receive them.
4. Review; save one transaction with an idempotency key and record version.
5. Confirm only after durable storage succeeds. Show a retryable error if it fails; retain the unsent draft in page memory.
6. Allow an authorised return visit and amendments before the chosen deadline. Do not silently overwrite a newer reply from another household member: detect conflicting versions.
7. Send email notification after saving, without placing allergy text in the email. An email failure must leave the saved response intact and be visible to organisers.

## Private organiser view

Import/review a CSV of invitation parties and named guests; inspect import errors before writing. View Friday yes/no/uncertain totals and Saturday yes/no totals separately, with unanswered invitations visible. Edit an invitation, revoke a link, and record telephone replies with the same rules as guest replies. Export attendance and a minimal catering/allergy list separately. Quote/escape CSV cells and neutralise spreadsheet formula prefixes. Protect exports and backups; define deletion/archive arrangements after the wedding.

## Release checks before accepting real replies

Verify wrong/expired/revoked tokens, cross-party access attempts, uninvited guest injection and event tampering; mixed household answers, Friday-only and Saturday-only attendance; complete decline; empty and maximum-length allergy notes; duplicate submits; amendments/version conflicts; deadline/time-zone handling; database failure, offline retry and email failure; separate organiser access; export totals; backup and restore. Confirm the live privacy notice and wedding contact route before turning off the preview labels.
