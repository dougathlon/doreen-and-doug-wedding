# Replies and private administration — next phase

Status: design implemented locally; production setup pending. Doug supplied the wedding Gmail address on 28 October 2026. It is recorded in gitignored `.env.local` as `WEDDING_CONTACT_EMAIL`; the production service expects this setting, but it has not been uploaded. Mailbox access, recovery and delivery are unverified. Wrangler is authorised and an empty remote D1 database is prepared, but no production RSVP endpoint or mail integration is connected. Cloudflare Zero Trust Free activation is awaiting Doug's checkout completion. See `rsvp-deployment.md` for implementation and launch checks.

## Confirmed direction — 28 October 2026

Send the same website link to invited people. Do not require a guest-list import or individual invitation links before circulation. Each invited person enters their own name and submits their own reply. This supersedes the earlier fixed-name lookup and preloaded invitation-token design; it does not introduce household replies or plus-one places.

Guest wording: “Kindly submit a separate reply for each person named in your invitation.” No additional-person fields or headcount selectors. Collect separate Friday/Saturday attendance, an optional food allergy or intolerance note, and an optional email address for receipts and amendment links. Catering choices remain deferred.

Anyone with the shared URL can submit; it does not authenticate an invitee. Without a separate invited list, the organisers can count received replies but cannot automatically identify who has not responded. Review unexpected or duplicate entries privately. Do not describe the shared URL as access control.

The shared-link form, private save/amend API, organiser view and email outbox are implemented and locally tested. The public GitHub Pages site still cannot save replies.

## Save and confirmation sequence

1. Accept one person's name and answers. Validate and save the response privately, assigning an opaque record ID. Use an idempotency key so retrying the same submission does not create another record.
2. Confirm on screen only after durable storage succeeds. A failed save leaves the draft available in page memory and shows a retryable error.
3. Issue a private amendment link for that response. Show it on the confirmation page even if the guest supplies no email; explain that they should keep it to change their reply. The common invitation URL cannot reopen existing records by name or email.
4. Notify the wedding inbox after saving, linking to the private organiser view. Do not copy food notes or guest amendment credentials into organiser notification emails.
5. If guest receipts are enabled and an address was supplied, send a brief receipt and amendment link. Mail failures must not lose the response or cause a duplicate save; make delivery failures visible to organisers and retry separately.
6. Authorised amendments update the same record and invalidate stale totals. Check the record version to avoid silently overwriting newer changes from another tab or device.

Email is a notification and correspondence channel. Private storage is the record of attendance. Do not rely on an email inbox alone to reconcile amended responses.

## Proposed deployment

Keep the code in GitHub. The existing GitHub Pages preview can remain while production is tested. [GitHub Pages serves static sites](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages); receiving and saving replies requires a backend.

The existing recommendation is the same front end with a small Cloudflare Worker API and private D1 database at one production address. [Worker static assets](https://developers.cloudflare.com/workers/static-assets/) allow the invitation and API to share an origin. No provider account, billing arrangement or deployment has been approved or provisioned. Check current service terms and limits when selecting the account.

Protect organiser pages and API routes with separately authenticated Doug/Doreen accounts, for example an explicit [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/) allowlist with server-side token validation. The guest submission form remains accessible without organiser login. Private amendment links authorise access to exactly one response.

Use the supplied wedding inbox for questions, organiser notifications and Reply-To. Both organisers need reliable access and an agreed recovery owner. Automated sending is a separate integration; providing the address does not authenticate a sender. Keep credentials server-side. A verified sender/domain or supported authenticated mailbox connection is needed according to the chosen sending method. Do not impersonate the Gmail address through an unrelated provider.

## Remaining setup

| Input or task | Purpose |
| --- | --- |
| Verify access to the supplied wedding Gmail, including access for both organisers and recovery | Human correspondence and receiving notifications |
| Choose the production account owner, provider and any spending limit | Private storage, API and organiser login |
| Choose a stable hosted address or optional custom domain | One common URL to circulate; amendment links must remain valid |
| Choose the initial reply deadline | Guest wording, printed invitations and amendment rules |
| Decide whether guest email receipts are needed at launch and connect the sending route | Receipt delivery and organiser notifications |
| Implement and test the shared-link form, private response store and organiser view | Replace the current non-transmitting sample |

There is no guest-list import requirement. The postal editor at `print.html` remains a separate browser-local tool: entering its reply contact only prints that contact and does not configure online mail delivery.

## Data and access boundaries

- Response: opaque stable ID; guest-entered full name; optional contact email; Friday and Saturday answers; optional food note; source; creation/update timestamps; version. A name or email is not a credential or reliable unique key. Different people may share either; never overwrite or merge records solely because they match.
- Attendance: yes/no for Saturday 17 July 2027, and yes/no/uncertain for Friday 16 July. Saturday begins at 1pm UK local time; Friday's location and hour remain unset. Allow complete decline and attendance on either day alone.
- Food allergy or intolerance note: optional, at most 1,000 characters. Use only for wedding arrangements, with a clear guest notice about organiser and relevant catering access. Exclude notes for people declining both events from catering exports. No menu selections yet.
- Amendment credential: cryptographically random bearer token, stored only as a hash, tied to one response, revocable and never disclosed by a public name/email lookup. Possession permits reading and changing that response, so keep it private.
- Organiser: independent authentication and authorisation. The common URL or an amendment token never grants administrative access. All response lists, exports and food notes remain private.

Prefer a fragment-based amendment URL exchanged for a secure HttpOnly session, then remove the token from the URL. Keep the app and API on one origin, enforce CSRF protection on authenticated writes and derive response identity server-side. Reject client attempts to change other records. Do not expose tokens to analytics, third-party URLs or logs.

Rate-limit public submissions and email delivery, validate inputs server-side, enforce request-size limits and include a bot trap. Do not send repeated receipts merely because someone repeatedly submits another person's email. The precise abuse controls should be selected and tested with the chosen backend. Never present a rate limit or bot check as proof that someone was invited.

## Private organiser view

Show received individual replies with separate Friday yes/no/uncertain and Saturday yes/no totals. Do not display an invented count of unanswered invitations. Allow authorised review of suspected duplicates and unexpected responses; never silently combine them. Allow recording a telephone or postal reply and updating a selected existing record, with source and timestamp visible.

Provide attendance and minimal catering exports separately. Escape CSV cells and neutralise spreadsheet formula prefixes. Protect backups and exports; choose post-wedding deletion/archive arrangements. Give organisers a way to revoke or replace an amendment link when a guest has lost it, after checking the request outside the public name lookup.

## Release checks

Pilot with Doug, Doreen and invented guest data. Verify initial save, reload and amendment-link reopening; same-name guests staying separate; retry idempotency; simultaneous amendments; Friday-only, Saturday-only and complete decline; optional email; empty and maximum-length food notes; deadline and UK time-zone handling; invalid/revoked tokens and cross-response access attempts; rejected fields and bot/rate-limit behaviour; failed/offline saves and mail failures; organiser access; accurate totals and safe exports. Restore a backup before collecting real replies.

Confirm the live contact route and privacy wording before removing preview labels. Test real mail delivery only with explicitly chosen test recipients. Confirm the ceremony arrangement with the vicar and an initial reply deadline. Friday's location/activity/hour and catering details may follow later. Buy no domain, create no paid subscription, and send no invitations merely on the authority of this plan.
