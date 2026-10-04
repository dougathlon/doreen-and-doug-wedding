# Doreen & Doug — wedding invitation

A custom invitation for 17 July 2027 in Appleby Magna, with a Friday gathering on 16 July at Sir John Moore School. The selected baby portrait is used unchanged.

## Current release: review preview

The public invitation, weekend information, hotel links, airport directions and calendar download work. The sample RSVP flow supports separate Friday/Saturday answers for two fictional guests, optional allergy notes, validation, review, amendments and reset.

**No real invitations have been loaded. No RSVP endpoint, database, email destination or wedding account is configured.** Replies exist only in React state; they are never sent, logged, put in URLs or saved to browser storage. Reloading the page clears them. The form and page explicitly identify this preview state.

This is a public GitHub Pages site and public source repository. `noindex` discourages indexing; it does not provide access control. Keep all guest lists, personal invitation tokens, contact addresses, allergy notes and credentials out of this repository. The artwork, names, event dates and venue information are public in this preview.

## Development

Node 22 or later. Run `npm ci`, then `npm run dev`. The development server runs Vite/React. Run `npm run build` followed by `npm test` before publishing. There is no linter or type-checker configured in the supplied JavaScript starter. The build checks JSX/module compilation; Node's test runner covers response rules and the retained starter worker contract.

The deployment workflow publishes **only `dist/client`** to GitHub Pages on pushes to `main`. The inherited Sites worker packaging remains intact but is not used by Pages. Asset paths are relative, so the site works under the repository URL prefix.

## Editing

- `src/App.jsx`: invitation layout and principal wording.
- `src/content.js`: names, venues, hotels and airport directions.
- `src/ReplyForm.jsx`: explicitly non-transmitting preview interaction.
- `src/replies.js`: per-person attendance validation and review projection.
- `src/styles.css`: responsive layout, local fonts and paper treatment.
- `public/wedding-weekend.ics`: two all-day calendar entries, with no invented start times.
- `docs/sources.md`: research and content assumptions.
- `docs/rsvp-plan.md`: future storage, invitation and administration design.
- `design-qa.md`: rendered checks and known intentional adaptations.

All fonts are self-hosted. Licence files are in `public/fonts`. Paper and ornament prompts are recorded in `asset-prompts.md`; unused original/generated alternatives are kept locally outside published assets. No analytics, third-party font requests, embeds or cookies are added by this application.

## Before inviting guests

Confirm the church, ceremony/reception times, Friday activity, reply deadline, room arrangements, parking and any transfer plan. Supply the named guest list and decide household/companion permissions. Choose the wedding account and private RSVP storage, implement and test the plan in `docs/rsvp-plan.md`, and only then replace the preview state with the live invitation flow.
