# RSVP deployment and operation

## Deployed, replies closed

The production invitation and private D1-backed API are deployed at [the Cloudflare address](https://doreen-and-doug-rsvp.doug-j-stark.workers.dev/). [The organiser page](https://doreen-and-doug-rsvp.doug-j-stark.workers.dev/admin) requires authentication. `RSVP_OPEN=false` and `GUEST_RECEIPTS=false`: public submissions are rejected and no RSVP email is being sent. The existing GitHub Pages address remains a non-transmitting preview.

The Cloudflare Worker in `server/worker.js` serves the same built invitation and API. `server/local-worker.js` is a separate local demonstration entry point with no email delivery. Never deploy it. The inherited Sites worker and packaging files remain unchanged.

Doug approved Wrangler's account/user read, Workers scripts write, D1 write and background access on 28 October 2026. CLI authentication succeeded. The dedicated remote `wedding-rsvp` D1 database is in Western Europe with migration `0001_replies.sql` applied. Its initial export restored successfully with zero responses, zero outbox entries and a passing SQLite integrity check.

Doug completed Zero Trust Free activation, confirmed by Cloudflare as active at $0/month. He then approved the exact two organiser identities: the wedding mailbox and his Cloudflare account identity. The self-hosted Access application `Wedding replies — Doreen & Doug` is active for `/admin*` and `/api/admin/*` in the same application, with a 24-hour session and HttpOnly cookie. App Launcher visibility is disabled; use the direct organiser URL. The policy permits only those two identities. Cloudflare and one-time email PIN login methods are enabled; no Gmail-reading connection is required.

The ignored `wrangler.production.jsonc` records the account, database, existing workers.dev address, Access issuer/audience and organiser allowlist. The existing `TOKEN_SECRET` and `WEDDING_CONTACT_EMAIL` have been uploaded. Their restricted local backup is in ignored `.wrangler/secrets/wedding-production.json`. Preserve the token secret; replacing it breaks reconstruction of existing amendment links. The contact address is deliberately exposed as the guest-facing email link in production. No custom domain, DNS or existing mail routing was changed.

Initial Worker deployment version: `070d5a11-a61f-4a52-96c3-9f51f28f666a`; the two secret uploads followed that deployment. There is no outbound provider key or verified sender configured. Doug has chosen `Doreen & Doug <replies@wedding.dougstark.tech>`, with the wedding Gmail as Reply-To. `MAIL_FROM` is prepared in the ignored local secret file but has not been uploaded. The user completed Resend sign-in. The wedding domain is registered with the Ireland sending region. Its exact DKIM TXT and two DNS-only CNAME records are recorded in ignored `.wrangler/sender-dns.json`. The first Cloudflare record is filled but unsaved. Activation of those records and a subdomain-restricted sending key, plus tests to the two organiser addresses, awaits the browser confirmation requested on 28 October. No DNS record has been changed and no API key exists. The Cloudflare DNS screen currently lists three CNAME records (root, `www`, and `_domainconnect`), with no wedding-subdomain or mail records. Add only the provider-issued wedding-subdomain records once available.

## Production verification — 28 October 2026

- The deployed invitation loads correctly and displays “Replies are presently closed” with the intended contact link.
- `/api/config` reports available, closed, non-demo and no email receipts; it is not cached.
- Signed-out `/admin`, `/admin/`, `/admin.html`, `/api/admin/replies` and `/api/admin/export` requests redirect to Cloudflare Access.
- Doug's existing Cloudflare login reaches the real organiser page and its authenticated API. It shows zero responses and reports that email is not connected.
- A separate signed-out browser shows the email-code login form. Doreen's code delivery and successful sign-in remain unverified.
- An unauthenticated guest-record request returns 401; public reply creation while closed returns 503. No production test reply was created and no RSVP mail was sent.
- The deployment script passed all 31 tests, the Vite build and production-configuration guard before uploading.

Screenshots are local and ignored under `qa/rsvp/`. Real production save/amend/export and mail delivery still need the controlled pilot below. Narrow mobile rendering has not been verified.

## Local verification

Run `npm run dev:rsvp`. This builds the site, applies migrations to a separate local database and serves the app on `http://127.0.0.1:4187`. The organiser screen is `/admin.html` (the asset service may redirect to `/admin`; both routes are guarded in production). Use invented details only. The local database and CLI configuration are under ignored `.wrangler/`. The wrapper keeps logs and configuration in the workspace rather than writing to the user's global configuration.

Run `npm test`, `npm run build`, and `npm run check:rsvp`. Tests exercise real SQLite through a D1-compatible test adapter; the browser preview also runs the real local Workers/D1 runtime. The test suite includes a database backup/restore check. The production checks above cover organiser sign-in; real email delivery and the production reply pilot remain outstanding. Node 22.13 or later is required for the SQLite tests.

The local preview saves replies across reloads and process restarts. GitHub Pages only serves static assets and does not save replies. A browser confirmation says “received” only after a server save; the static preview says that nothing is saved.

Verified 28 October 2026: 31 automated tests passed, the Vite build and Worker deployment dry run passed, and the dependency audit reported no known vulnerabilities. Browser checks used invented entries to confirm saving, reloading, private-link reopening, amendments, and a postal reply updating the same totals. Production login was subsequently verified as recorded above. Real email delivery and narrow mobile rendering remain unverified.

## Complete launch

1. Preserve the deployed account, D1 database, Access policy and ignored configuration. Use `node scripts/wrangler.mjs` for CLI calls so this checkout uses its own ignored credentials. Do not expand Wrangler's approved grant merely to suppress optional-scope warnings. Review future database migrations before applying them remotely.
2. Have Doreen open `/admin`, enter the wedding mailbox and use Cloudflare's login code. Confirm that both organisers can reliably access the mailbox and that recovery ownership is understood. The application itself never reads Gmail.
3. Choose and verify the outbound sender. The included adapter uses Resend's HTTP API with `RESEND_API_KEY` and `MAIL_FROM`. A domain owned by the organisers must be verified; use the wedding Gmail as Reply-To, not an unverified From address. No Resend account or sender domain is configured. Doug approved `replies@wedding.dougstark.tech`. Resend sign-in, domain registration and inspection of existing DNS are complete. After the pending activation confirmation, add the three exact records from `.wrangler/sender-dns.json` and verify the domain. Then create a Sending access key restricted to `wedding.dougstark.tech`; the current API-key form only offers All domains while verification is pending, so do not submit that form with its current scope. Preserve existing website/mail records and avoid granting broad DNS access. Verify both tracking settings are disabled before sending: the add-domain screen showed a disabled click-tracking checkbox selected by default; open tracking was off. Receiving is disabled. The optional root-level DMARC suggestion is outside the selected wedding-subdomain changes and has not been applied.
4. Retain `RSVP_OPEN=false` while preparing the pilot. `GUEST_RECEIPTS=true` enables receipts only when mail credentials are present; otherwise the form promises on-page confirmation and a private amendment link. `RSVP_DEADLINE` remains optional and unset; any supplied deadline must include an explicit timezone. Display dates use Europe/London.
5. Run `npm run deploy:rsvp` for subsequent deployments. Conduct a controlled production pilot with invented records and explicitly chosen test recipients. Verify durable saves, reloads, amendments, code login, delivery to both Gmail and a guest address, accurate exports and treatment of test records/outbox entries before circulation. Finish the narrow mobile check.
6. Open replies deliberately and circulate the Cloudflare URL only after the pilot. The GitHub Pages URL stays a static preview unless deliberately redirected. Do not send invitations automatically.

Reference contracts: [Worker static assets](https://developers.cloudflare.com/workers/static-assets/binding/), [D1 batches](https://developers.cloudflare.com/d1/worker-api/d1-database/), [Access JWT verification](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/), [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email). Checked 28 October 2026.

## Records, privacy and recovery

- The shared URL has no invited-person allowlist. Received responses can be reviewed and excluded from totals. It cannot identify nonresponders without a separate invitation list.
- A new response gets an opaque ID and a private amendment link. Names and email addresses are not unique identifiers. Initial submission retries are idempotent, and version checks prevent conflicting amendments. A stale tab cannot amend another person's reply after the browser session changes.
- The server checks origin, JSON content type, field allowlists, request size, per-IP rate limits and a bot trap. Rate-limit identifiers are hashed with a server secret. Session and rate-limit rows expire and are cleaned by the scheduled handler. Public abuse remains possible; inspect unexpected entries and review rate limits if the link is widely shared.
- A database trigger queues notification work in the same transaction as the save. Food notes never enter the email outbox or email text. Pending mail is retried by the scheduled handler every five minutes and after saves; the organiser page reports failures. Resend idempotency keys expire after 24 hours, so automatic retries stop after 23 hours from the first attempt. Check the provider's delivery record before manually resending an uncertain message.
- Pending guest receipts are cancelled when the name, destination, attendance answers, inclusion status or private link no longer match the saved receipt. An older queued message must not report superseded attendance answers.
- Lost-link replacement revokes the previous link and existing sessions. Check a guest's request outside the public form before handing out a replacement. Guest exclusion also blocks access and removes the response from headcounts; it preserves the original record for review.
- Organisers can record telephone/postal replies, amend entries, exclude duplicates, replace links and download attendance or minimal catering CSVs. Guest receipts are not automatically sent for organiser edits. CSV cells are escaped and formula prefixes neutralised.
- Back up the production database and `TOKEN_SECRET` separately. Before circulation, export and restore a production-equivalent test database. Attendance CSVs are useful operational copies but do not contain the amendment/session data needed for a full restore.
- Food notes are for wedding arrangements and relevant catering recipients. Arrange removal after the wedding as stated in the form; automatic post-wedding deletion is not implemented. Do not store guest exports or credentials in the public repository. Production request-body logging is not enabled.
