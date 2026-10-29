# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Confirmed invitation decisions — 17 October 2026

Advertise the ceremony at St Michael & All Angels, Appleby Magna, at 1pm on 17 July 2027 (UK local time). This is Doug's chosen church; the vicar's confirmation is still pending. Use “food allergies or intolerances” in guest-facing wording. Keep the RSVP preview non-transmitting until a destination is explicitly configured.

Each invited individual replies for themselves. Do not reintroduce household replies, default companions or guest-count controls. The shared-link decision below supersedes the original fixed-name invitation lookup. Keep travel guidance brief; possible lifts may be mentioned conditionally, without promising collection or a later travel guide.

On 25 October, Doug requested a concise London-airport route via London Euston to Tamworth and planning for actual circulation. Keep the Heathrow/Gatwick examples short; do not restore the full airport guide. Doug supplied the wedding Gmail address on 28 October; it is recorded locally in gitignored `.env.local` as `WEDDING_CONTACT_EMAIL`. The Cloudflare RSVP service is deployed with public replies closed. Outgoing mail remains unconnected.

## Shared-link replies — 28 October 2026

Doug wants to send the same website link to invitees without first importing a guest list. Guests enter their own name and reply individually. No companion fields, add-person controls or headcount selectors. Wording: “Kindly submit a separate reply for each person named in your invitation.” The shared link does not prove someone was invited, and unanswered invitees cannot be counted without a separate invitation list.

The implementation plan is private saved responses, a private amendment link issued after each initial submission, and organiser access separate from guest access. Wedding-mailbox notifications follow a successful save; email must not be the only record. The shared-link form and backend are now implemented locally. GitHub Pages remains a non-transmitting preview until production is connected. Supplying the mailbox does not connect it or authorise sending invitations. Keep mailbox configuration out of the public bundle until a guest-facing contact route is intentionally implemented.

## Friday venue correction — 28 October 2026

Friday's gathering may not take place at the School. Retain Friday 16 July and the attendance question, but leave its location unspecified in both the invitation and calendar. Keep the School name, address and map link with Saturday's reception details; Saturday's church and School venues remain unchanged.

The correction was relayed on 27 October; Doug directly authorised implementation and publication on 28 October 2026.

## Postal invitations — 28 October 2026

Doug requested and chose a browser form for preparing printed letters in the invitation's existing style. Keep this separate at `print.html`, with one named individual per A4 invitation, an editable reply contact and an optional deadline. Its names and contacts remain local to the browser; the planned online RSVP separately accepts each guest's own name. Do not send or persist postal-editor entries, or include them in URLs or public files. PDF generation runs in the browser, using the same rendered artwork and wording. The print tool does not activate online replies.

Doug prefers a smaller portrait and more generous text spacing in the website and postal invitation. Retain the full portrait without cropping it. In formal invitation wording, use “At one o’clock in the afternoon.” without a parenthetical “1pm”; practical timetable and calendar times remain unchanged.

Postal PDFs should have cream paper to all four A4 page edges, without a white outer margin. Keep the decorative double rule and invitation content inset at their existing physical size. Distinguish PDF page margins from a printer's unprintable margins in the organiser guidance.

## RSVP implementation — 28 October 2026

Doug authorised building the shared-link form, private response list and outgoing notifications, without connecting Gmail for reading. He confirmed an existing Cloudflare account. Keep `server/worker.js` as the production entry point and `server/local-worker.js` strictly local. Never deploy the local organiser-login bypass. Keep `.wrangler/`, `.env*`, `.dev.vars*` and production account configuration out of Git. The inherited Sites files remain unchanged. See `docs/rsvp-deployment.md` for current activation requirements and verified checks. No real invitation mail has been sent.

Doug explicitly approved the displayed Wrangler grant on 28 October. Authentication succeeded and the dedicated remote D1 database is prepared. Doug completed Zero Trust Free activation; Cloudflare confirms it is active at $0/month. Doug then explicitly approved both organiser identities (the wedding mailbox and Cloudflare account owner). The Access application is active for `/admin*` and `/api/admin/*`, with a 24-hour session and only those two emails allowed. Cloudflare sign-in was verified against the deployed organiser page; email-code login is enabled but Doreen’s login is not yet tested. The Worker is deployed with D1 and its existing token/contact secrets. Reuse the ignored production configuration and uploaded token secret; do not regenerate it. Keep `RSVP_OPEN=false` and `GUEST_RECEIPTS=false` until the sender and production pilot are complete. GitHub Pages remains a static preview.
