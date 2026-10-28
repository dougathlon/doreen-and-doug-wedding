# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Confirmed invitation decisions — 17 October 2026

Advertise the ceremony at St Michael & All Angels, Appleby Magna, at 1pm on 17 July 2027 (UK local time). This is Doug's chosen church; the vicar's confirmation is still pending. Use “food allergies or intolerances” in guest-facing wording. Keep the RSVP preview non-transmitting until a destination is explicitly configured.

Each invitation is for one named individual, who replies for themselves. Do not reintroduce household replies, default companions, guest-count controls or editable invitee names. Keep travel guidance brief; possible lifts may be mentioned conditionally, without promising collection or a later travel guide.

On 25 October, Doug requested a concise London-airport route via London Euston to Tamworth and planning for actual circulation. Keep the Heathrow/Gatwick examples short; do not restore the full airport guide. No wedding inbox or live RSVP destination has yet been selected or connected.

## Friday venue correction — 28 October 2026

Friday's gathering may not take place at the School. Retain Friday 16 July and the attendance question, but leave its location unspecified in both the invitation and calendar. Keep the School name, address and map link with Saturday's reception details; Saturday's church and School venues remain unchanged.

The correction was relayed on 27 October; Doug directly authorised implementation and publication on 28 October 2026.

## Postal invitations — 28 October 2026

Doug requested and chose a browser form for preparing printed letters in the invitation's existing style. Keep this separate at `print.html`, with one named individual per A4 invitation, an editable reply contact and an optional deadline. Names are editable only in this organiser preparation tool; the guest RSVP identity remains fixed. Do not send or persist entered names/contact details, or include them in URLs or public files. PDF generation runs in the browser, using the same rendered artwork and wording. The print tool does not activate online replies.
