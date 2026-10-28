# Doreen & Doug — wedding invitation

A custom invitation for 17 July 2027 in Appleby Magna, with a Friday gathering on 16 July whose location is yet to be settled. Saturday's reception is at Sir John Moore School. The selected baby portrait is used unchanged.

## Current release: review preview

The invitation, weekend information, hotel links, brief travel guidance, calendar and postal editor work. The shared-link RSVP form accepts each person's own name, separate Friday/Saturday answers, optional food allergy or intolerance notes, and an optional email. There are no plus-one fields or guest-list import requirements.

**The backend is implemented locally, but no production RSVP service or mail sender is connected.** On GitHub Pages the form remains an explicitly non-transmitting preview. In the local Workers preview, replies persist in the private local D1 database. Production requires the Cloudflare deployment, organiser access and sender setup described in `docs/rsvp-deployment.md`. The wedding mailbox is recorded in gitignored `.env.local`.

This is a public GitHub Pages site and public source repository. `noindex` discourages indexing; it does not provide access control. Keep all guest lists, personal invitation tokens, contact addresses, allergy notes and credentials out of this repository. The artwork, names, event dates and venue information are public in this preview.

## Postal invitations

Open `print.html` to prepare named A4 letters. Enter one name per line (up to 50), add an email, phone number or return address for replies, and optionally set a reply deadline. Download PDF generates one A4 page per person locally in the browser; Print in browser is also available. The PDF uses 300-dpi page images so the portrait, paper, fonts and wording match the preview. Print at actual size / 100%. Edit the form to change the wording fields and export again; the PDF itself is not an editable form.

Cream paper covers the full A4 PDF page, with no white outer margin. The decorative rule and text remain inset. Physical printing to the sheet edges requires borderless A4 support, or printing on a larger sheet and trimming. For browser printing, select A4, no margins, 100% scale, background graphics on, and headers/footers off.

Names and reply contacts are held only in page memory and clear on reload. Keep the original guest list separately. Nothing is uploaded, and no real guest names or contact details are included in the repository. The preparation tool is a public, empty utility, not an authenticated organiser dashboard or RSVP endpoint. Its contact field prints a reply route on the paper invitation; it does not configure automated email.

## Development

Node 22.13 or later. Run `npm ci`, then `npm run dev`. The development server runs Vite/React. Run `npm run build` followed by `npm test` before publishing. There is no linter or type-checker configured in the supplied JavaScript starter. The build checks JSX/module compilation; Node tests cover response rules, the private service with real SQLite, authenticated access, mail retry behaviour, backup restoration and the retained starter worker contract. `npm run dev:rsvp` starts the complete local test service on port 4187; `npm run check:rsvp` dry-runs the production Worker package.

The deployment workflow publishes **only `dist/client`** to GitHub Pages on pushes to `main`. The inherited Sites worker packaging remains intact but is not used by Pages. Asset paths are relative, so the site works under the repository URL prefix.

## Editing

- `src/App.jsx`: invitation layout and principal wording.
- `src/content.js`: names, venues and hotels.
- `src/ReplyForm.jsx`: shared-link form, review, durable confirmation and amendments; static-preview fallback.
- `src/Admin.jsx`: organiser response list, totals, manual entry and exports.
- `server/`: production Worker, validation/authentication, D1 migration and email outbox.
- `src/replies.js`: per-person attendance validation and review projection.
- `src/styles.css`: responsive layout, local fonts and paper treatment.
- `public/wedding-weekend.ics`: Friday as an all-day date and Saturday at 1pm UK local time, with no invented finish time.
- `docs/sources.md`: research and content assumptions.
- `docs/rsvp-plan.md`: agreed RSVP design.
- `docs/rsvp-deployment.md`: current implementation, account setup and release checks.
- `design-qa.md`: rendered checks and known intentional adaptations.

All fonts are self-hosted. Licence files are in `public/fonts`. Paper and ornament prompts are recorded in `asset-prompts.md`; unused original/generated alternatives are kept locally outside published assets. There are no analytics, third-party font requests or embeds. The live RSVP service uses an HttpOnly session cookie after opening a private amendment link. The static preview and postal editor do not add cookies.

## Before inviting guests

The chosen church is St Michael & All Angels and the ceremony is advertised at 1pm, as instructed on 17 October 2026; confirmation from the vicar is still pending. Confirm reception times, the Friday location, activity and time, reply deadline, room arrangements, parking and any transfer plan. Use one shared invitation URL; each invited person enters their own name and replies only for themselves, with no companion places or household replies. No guest-list import is required. Verify access to the supplied wedding mailbox, choose the backend account and private storage, complete the production setup and pilot in `docs/rsvp-deployment.md`, and only then replace the preview state with the live reply flow.
