# Replies and private administration — next phase

Status: design only. No wedding account, email destination, storage service or server endpoint has been created or connected.

Decision confirmed by Doug on 17 October 2026: one named individual per invitation, with each person answering for themselves. The earlier household model is superseded.

## Decisions for circulation — 25 October 2026

The public design and individual reply preview exist. Actual guest lookup, saved replies, email sending and private administration still need implementation. No production provider or account is selected by this plan.

Use a dedicated wedding mailbox for questions, organiser notifications and the reply-to address on guest receipts. Give both Doug and Doreen access and arrange account recovery. A personal mailbox is sufficient for receiving mail; for example, [Gmail supports delegated inbox access](https://support.google.com/mail/answer/138350?hl=en). Automated sending still needs an authenticated connection or mail-delivery provider. Keep its credentials server-side. If sending from a custom domain, configure the sender verification/authentication required by that provider and test actual delivery.

The confirmation sequence should be:

1. Save the named guest's Friday/Saturday answers and optional food note in private storage. A correction replaces the same guest's response.
2. Show the guest confirmation on the website only when the save succeeds.
3. Notify the wedding inbox that a reply was received or changed, linking to the private guest list. Do not copy food notes into notification emails.
4. Send a brief receipt with the attendance choices and an amendment link when an email address is available. A guest invited by message can reply without supplying an email; the website confirmation still applies. Report/retry mail failures without losing or duplicating the saved reply.

Before connecting the service, choose the wedding inbox, hosting/account owner for the private backend, whether guest email receipts are wanted, and an initial RSVP deadline. A custom website address is optional; choose it before issuing personal links if desired. [GitHub Pages is static hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), so it can retain the invitation while a separate server function and database receive replies.

Supply a private guest list with one row per invited individual: display/full name, contact email if available, intended delivery channel/contact, and which events they are invited to. Do not put this list in the public repository. Invited partners receive separate links. No anonymous plus-one places are created. The organiser view should also allow recording a reply received by telephone or message.

Confirm the ceremony arrangement with the vicar, an initial reply deadline, and which details can follow later. Friday location/activity/time, reception timings, dress guidance and practical access/parking information can be added once settled; menu selection remains deferred. Keep the conditional lift wording and handle actual collection arrangements individually.

The first production release needs a private guest/response list with Friday/Saturday totals, unanswered guests, per-guest food notes and a CSV export; one revocable invitation link per guest; a way to amend replies; a contact route; and a short explanation of who can see food notes and when they will be deleted. Keep the public invitation separate from guest records and organiser access.

Before circulation, run a small pilot with Doug, Doreen and a test invitee: save a reply, reload and reopen it, amend it, verify headcounts and the export, receive both organiser and guest emails where enabled, and try another guest's link without being able to access their record through the first invitation. Test rejected/expired links, failed saves, duplicate submissions and mail failures. Keep a backup/export and test recovery. Only then replace the sample labels and issue real invitations; bulk sending or reminders need explicit instruction.

## Recommended shape

Use persistent private storage as the record of replies, with email notifications to the wedding account after a successful save. Email alone is a poor record: corrections and retried submissions can produce conflicting headcounts. Saving the reply must not depend on delivery of a notification.

GitHub Pages can continue serving the invitation. A small HTTPS API and private database can supply the RSVP and organiser views later. Choose infrastructure together with the wedding account; no provider lock-in is introduced in this preview.

## Data and access boundaries

- Named guest: stable ID, display name and specifically allowed event IDs. Each guest responds for themselves, including when two invited people are a couple. There are no household replies, companion places, guest counts, editable guest names or add-person controls.
- Personal invitation: one guest ID, optional contact email, hashed unguessable access token, revoked/expiry state. Each link grants access to exactly one guest. A real guest list must never be bundled into the public JavaScript.
- Event: Friday gathering, 16 July 2027; Saturday wedding, 17 July 2027. Saturday begins at 1pm UK local time; Friday's location and time remain unset. Attendance is per guest per event.
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
