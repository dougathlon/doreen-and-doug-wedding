# Design QA

Initial review, 3–4 October 2026: passed for the explicitly non-transmitting preview. Later changes are recorded below.

## Visual evidence and scope

Source: the user's latest preferred 1134×1600 invitation, inspected directly. Implementation: production Vite build at localhost:4174, desktop viewport 1280×900, phone 390×844 and narrow phone 320×740. Tablet width 768 also checked for overflow. Full browser captures saved locally in `qa/`; that evidence folder is excluded from the public repository.

`qa/reference-comparison.jpg` places the source beside the actual invitation region cropped from `qa/desktop-final.jpg`, each scaled to 560 pixels wide while preserving aspect ratio. This is a printed card to responsive web adaptation, not a comparison of identical viewport screenshots. The two venues, actual written date, timing note and functional reply/calendar links make the web sheet taller. A focused mobile view was inspected for legibility rather than judging only the scaled full-page image.

## Required surfaces

- Typography: large centred Cormorant capitals carry the names; Fell roman/italic carries the period-informed invitation and practical text. WOFF2 fonts are self-hosted. Actual names replace raster placeholders and remain selectable. No clipped names at 320 pixels. Practical prose uses 17–18px text; field labels and radio options remain legible.
- Layout: portrait first, invitation below, centred sheet and fine double rule retained. Narrow screens preserve image aspect ratio and stack the weekend/hotel columns. Working anchor navigation remains reachable. Desktop, 768, 390 and 320 pixel widths had no horizontal overflow.
- Colours: brown ink, cream paper and brown surround retain the supplied palette. New paper is lighter and more evenly textured than the reference; this is a restrained web adaptation. Ordinary controls use the same ink/paper colours, with visible focus/error states.
- Imagery: portrait SHA-256 is unchanged (`5ad55718bc709c8b2e05866bedfb7cacdb02f07215292e53e4b6d9eb74c9bc7a`); no regenerated faces, changed dress or crop. New fleuron alpha renders without a background box. Generated shaped-frame attempt was rejected; a fine rectangular double rule is the documented fallback. Corner florals are omitted rather than imitated with CSS/SVG art.
- Copy: date is 17 July 2027, Friday is 16 July; church then School; no invented hours, catering menu, reply deadline or wedding address. Airport guidance links to operators and does not claim July 2027 schedules. Church identification remains an explicit assumption in the research notes and handoff.

## Interaction findings and fixes

P2: validation focus could leave the top of the error summary hidden during smooth scrolling. Fixed by explicit focus/scroll positioning and instant anchor behaviour. Rechecked against the production build: the complete summary starts at 85px, below the sticky navigation. Evidence: `qa/mobile-errors-final.jpg`.

The development server cached files because change notifications in the synced workspace were unreliable. All final checks use the production build and hashed assets, not the stale dev-server response.

Verified the sample form opens, rejects missing per-person day answers, permits Friday uncertainty, preserves mixed household answers, reviews an allergy note, permits amendments, removes allergy notes from a full decline, and clears answers on completion. Preview wording never claims a delivered RSVP. React renders notes as text. No RSVP network or browser-storage implementation exists.

Travel disclosures open on mobile and close with Enter. Semantic links, buttons, fieldsets, legends, labels and error associations are present. Keyboard focus has a visible outline; new form stages receive focus. No animation is required. Calendar file contains two all-day events with exclusive end dates; it does not invent start times. No actual calendar account is modified by the site.

## Build and scope limits

Production build and all 10 Node tests passed. No linter/type-checker was configured in the starter; no claim of either. No live invitation lookup, private storage, email delivery or organiser authentication is implemented, by the current scope. This is ready for Doreen's review, not for collecting real guest replies. Third-party hotel availability, physical venue access/parking, and July 2027 transport schedules remain unverified.

## Individual invitations and shorter travel copy — 17 October 2026

The current preview has one fixed sample name and one reply, replacing the household flow. Checked the production build in the browser on desktop and at 390px: required answers, uncertain Friday attendance with Saturday acceptance, food notes, review, amendments, a full decline, and completion/reset. Review retains only the invited identity; the form has no guest-count, rename or add-person controls. Mobile width and document width both measured 390px. No reply is sent or persisted.

Travel now consists of two short paragraphs and a National Rail link. Venue map links remain under the weekend details. The copy offers possible help with a lift, with no promised pickup or later travel guide. The removed airport disclosures and their unused data/styles are gone. Original research remains in `docs/sources.md`.

The chosen church is St Michael & All Angels, with a 1pm ceremony at Doug's instruction; the vicar's confirmation is still pending. The calendar now represents Saturday as 12:00 UTC / 1pm UK local time, with no invented end time; Friday stays all-day. Food wording includes allergies and intolerances throughout.

The production build and all 11 tests pass. Tests cover individual response rules, exclusion of added/renamed guest data from the review, calendar time-zone conversion and the retained worker packaging. Individual invitation links and server-side guest access remain planned, not implemented, pending the named guest list and RSVP destination.
