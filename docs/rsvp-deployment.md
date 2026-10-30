# RSVP deployment and operation

## Deployed, replies open

The production invitation and private D1-backed API are live at [the Cloudflare address](https://doreen-and-doug-rsvp.doug-j-stark.workers.dev/). [The organiser page](https://doreen-and-doug-rsvp.doug-j-stark.workers.dev/admin) requires authentication. `RSVP_OPEN=true` and `GUEST_RECEIPTS=true`: individual replies are accepted, organisers receive notifications after saving, and guests who supply an email receive receipts with private amendment links. The existing GitHub Pages address remains a non-transmitting preview. No invitations have been sent.

The Cloudflare Worker in `server/worker.js` serves the same built invitation and API. `server/local-worker.js` is a separate local demonstration entry point with no email delivery. Never deploy it. The inherited Sites worker and packaging files remain unchanged.

Doug approved Wrangler's account/user read, Workers scripts write, D1 write and background access on 28 October 2026. CLI authentication succeeded. The dedicated remote `wedding-rsvp` D1 database is in Western Europe with migration `0001_replies.sql` applied. Its initial export restored successfully with zero responses, zero outbox entries and a passing SQLite integrity check.

Doug completed Zero Trust Free activation, confirmed by Cloudflare as active at $0/month. He then approved the exact two organiser identities: the wedding mailbox and his Cloudflare account identity. The self-hosted Access application `Wedding replies — Doreen & Doug` is active for `/admin*` and `/api/admin/*` in the same application, with a 24-hour session and HttpOnly cookie. App Launcher visibility is disabled; use the direct organiser URL. The policy permits only those two identities. Cloudflare and one-time email PIN login methods are enabled; no Gmail-reading connection is required.

The ignored `wrangler.production.jsonc` records the account, database, workers.dev address, Access issuer/audience and organiser allowlist. `TOKEN_SECRET`, `WEDDING_CONTACT_EMAIL`, `MAIL_FROM` and `RESEND_API_KEY` are uploaded. Their restricted local backup is in ignored `.wrangler/secrets/wedding-production.json`. Preserve the token secret; replacing it breaks reconstruction of existing amendment links. The contact address is deliberately exposed as the guest-facing email link in production.

Current Worker deployment version: `ff8c78ef-d618-4d11-8f26-d4d954ea0cd0` (29 October 2026), restoring the original online invitation spacing and removing the calendar explanation. RSVP configuration and mail credentials are unchanged. Doug explicitly approved sender activation and test mail to the two organiser addresses. Resend verified `wedding.dougstark.tech` in Ireland (`eu-west-1`). The three provider-issued DNS records resolve correctly: DKIM TXT at `resend._domainkey.wedding`, plus DNS-only CNAMEs at `rsend.wedding` and `send.wedding`. Their exact values are in ignored `.wrangler/sender-dns.json`. Existing root, `www` and `_domainconnect` records were preserved; no root DMARC policy or existing mail routing was changed.

The API key `Wedding RSVP — Cloudflare` has Sending access restricted to `wedding.dougstark.tech` and is stored only in ignored private configuration and Worker secrets. Mail uses `Doreen & Doug <replies@wedding.dougstark.tech>` with the wedding Gmail as Reply-To. TLS is enforced, receiving is disabled and no tracking domain is configured.

## Production verification — 28 October 2026

- The invitation loads and `/api/config` reports available, open, non-demo and email receipts enabled; configuration is not cached.
- Signed-out organiser page and API requests redirect to Cloudflare Access. Doug’s Cloudflare sign-in reaches the production organiser page and authenticated API. Doreen’s email-code delivery and successful sign-in remain unverified.
- One invented record, “Deployment Test — not a guest”, was submitted successfully. Clearing the form and reopening its private link recovered the saved record. Changing Friday from attending to uncertain updated the same record and the organiser totals.
- Excluding that test record through the organiser page returned all guest totals to zero. The excluded record is retained for review; no real guest data was used. Its amendment access is revoked by the exclusion rule.
- Resend shows all six approved test emails as Delivered: one direct sender check, two guest receipts, and three organiser notifications covering submission, amendment and exclusion. They went only to the two approved organiser mailboxes. The database outbox has five sent entries, zero pending; the direct sender check was outside the outbox. Provider delivery confirms recipient-server acceptance, not inbox placement or human reading.
- The review screen was visually checked at an actual 390 × 844 viewport, with 390-pixel document width and no horizontal overflow. The temporary viewport override was reset.
- All 31 tests, the Vite build and production-configuration guard passed in `npm run deploy:rsvp` before the upload.
- The live attendance CSV download was blocked by the browser approval gate, which reported declined download permission. No alternate route was attempted. CSV formatting and formula neutralisation have automated coverage; an authenticated live download remains unverified.

Screenshots are local and ignored under `qa/rsvp/`: `sender-verified.jpg`, `sender-key-scope.jpg` (scope form before key creation), `mail-delivered.jpg`, `organiser-ready.jpg` and `production-mobile-review.jpg`. No secret value is included in these proof screenshots.

## Local verification

Run `npm run dev:rsvp`. This builds the site, applies migrations to a separate local database and serves the app on `http://127.0.0.1:4187`. The organiser screen is `/admin.html` (the asset service may redirect to `/admin`; both routes are guarded in production). Use invented details only. The local database and CLI configuration are under ignored `.wrangler/`. The wrapper keeps logs and configuration in the workspace rather than writing to the user's global configuration.

Run `npm test`, `npm run build`, and `npm run check:rsvp`. Tests exercise real SQLite through a D1-compatible test adapter; the browser preview also runs the real local Workers/D1 runtime. The test suite includes a database backup/restore check. Production save/amendment, organiser access and provider delivery are recorded separately above. Node 22.13 or later is required for the SQLite tests.

The local preview saves replies across reloads and process restarts. GitHub Pages only serves static assets and does not save replies. A browser confirmation says “received” only after a server save; the static preview says that nothing is saved.

Verified 28 October 2026: 31 automated tests passed, the Vite build and Worker deployment dry run passed, and the dependency audit reported no known vulnerabilities. Browser checks used invented entries to confirm saving, reloading, private-link reopening, amendments, and a postal reply updating the same totals. Production login, save/amendment, mail delivery and narrow mobile rendering were subsequently verified as recorded above.

## Remaining checks and operation

1. Have Doreen open `/admin`, enter the wedding mailbox and use Cloudflare’s login code. Confirm that both organisers can reliably access the mailbox and that recovery ownership is understood. The application itself never reads Gmail. Check inbox/spam placement of the delivered test messages.
2. Keep the current workers.dev invitation address stable when circulating it: existing private amendment links use that origin. GitHub Pages remains a static preview unless deliberately redirected. Do not send invitations automatically.
3. `RSVP_DEADLINE` is optional and remains unset. Any future deadline must include an explicit timezone. Display dates use Europe/London. Confirm unsettled event details with the organisers; do not invent them.
4. Complete a live CSV download only after new download approval or through a manual organiser check. The current approval rejection must not be worked around.
5. Preserve the deployed account, D1 database, Access policy and ignored configuration. Use `node scripts/wrangler.mjs` for CLI calls so this checkout uses its own ignored credentials. Do not expand Wrangler’s approved grant merely to suppress optional-scope warnings. Review future database migrations before applying them remotely.
6. Use `npm run deploy:rsvp` for subsequent deployments; it builds, tests and validates production configuration before uploading. Watch the organiser mail-status panel for queued or failed notifications. Keep test records excluded from guest totals.

Reference contracts: [Worker static assets](https://developers.cloudflare.com/workers/static-assets/binding/), [D1 batches](https://developers.cloudflare.com/d1/worker-api/d1-database/), [Access JWT verification](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/), [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email). Checked 28 October 2026.

## Records, privacy and recovery

- The shared URL has no invited-person allowlist. Received responses can be reviewed and excluded from totals. It cannot identify nonresponders without a separate invitation list.
- A new response gets an opaque ID and a private amendment link. Names and email addresses are not unique identifiers. Initial submission retries are idempotent, and version checks prevent conflicting amendments. A stale tab cannot amend another person's reply after the browser session changes.
- The server checks origin, JSON content type, field allowlists, request size, per-IP rate limits and a bot trap. Rate-limit identifiers are hashed with a server secret. Session and rate-limit rows expire and are cleaned by the scheduled handler. Public abuse remains possible; inspect unexpected entries and review rate limits if the link is widely shared.
- A database trigger queues notification work in the same transaction as the save. Food notes never enter the email outbox or email text. Pending mail is retried by the scheduled handler every five minutes and after saves; the organiser page reports failures. Resend idempotency keys expire after 24 hours, so automatic retries stop after 23 hours from the first attempt. Check the provider's delivery record before manually resending an uncertain message.
- Pending guest receipts are cancelled when the name, destination, attendance answers, inclusion status or private link no longer match the saved receipt. An older queued message must not report superseded attendance answers.
- Lost-link replacement revokes the previous link and existing sessions. Check a guest's request outside the public form before handing out a replacement. Guest exclusion also blocks access and removes the response from headcounts; it preserves the original record for review.
- Organisers can record telephone/postal replies, amend entries, exclude duplicates, replace links and download attendance or minimal catering CSVs. Guest receipts are not automatically sent for organiser edits. CSV cells are escaped and formula prefixes neutralised.
- Back up the production database and `TOKEN_SECRET` separately. The initial production database export was restored and checked successfully; repeat recovery checks after material schema changes. Attendance CSVs are useful operational copies but do not contain the amendment/session data needed for a full restore.
- Food notes are for wedding arrangements and relevant catering recipients. Arrange removal after the wedding as stated in the form; automatic post-wedding deletion is not implemented. Do not store guest exports or credentials in the public repository. Production request-body logging is not enabled.
