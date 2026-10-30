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

## Postal editor — 28 October 2026

Separate `print.html` preparation page using the existing unmodified portrait, local fonts, paper and fleurons. Each entered name produces one A4 letter. Reply contact is required; deadline is optional. No automatic companion places, submitted names, browser storage or guest records. Editing fields invalidates the previous PDF link.

Checked missing-field validation, two-name output, a long hyphenated name, native deadline edits, and 390px layout with viewport/document width both 390px. The preview scales to 362px within the mobile page. Node tests cover punctuation, duplicate names retained intentionally, missing contact, bounded inputs, invalid dates and timezone-stable deadline formatting.

Direct Download PDF generated two A4 pages (595.28 by 841.89 points), 5.7 MB, one for each invented test name. Downloaded through the browser after permission, rendered both pages with Poppler and visually inspected both: correct portrait, fonts, deadline and reply contact; no clipped text, extra pages or controls. Local evidence is in `qa/postal-pdf/` and is excluded from publication. PDF pages are 300-dpi raster images of the invitation, so edits belong in the browser form rather than in the PDF. The browser-print dialog could not be inspected through the available UI; direct PDF export is the verified output route.

The two PDF-generation libraries load only when exporting, outside the guest invitation's bundle. No new remote service receives names or generates documents. All 15 tests and the production build passed. Online RSVP collection remains unconfigured. Also corrected the stale Friday School reference in the no-JavaScript fallback.

## Invitation spacing revision — 28 October 2026

Reduced and centred the full portrait in both versions. The A4 letter now gives more room to the recipient, couple, date and venues, with 11pt practical text and 10.5pt addresses. Corrected a margin-specificity conflict that had removed the intended gap below the recipient's name. The website has more generous heading line height and text spacing; its phone time note is now 15px. Formal wording reads “At one o’clock in the afternoon.” in both versions, without the repeated parenthetical time.

Reviewed the production website at desktop, 390px and 320px, with no horizontal overflow; the postal editor also fits at 390px. Exported a fresh two-page A4 PDF with invented names, a long recipient name, an optional deadline and three-line reply contact, then rendered and inspected both pages. Text and portrait remain inside the borders. Evidence: `qa/postal-spacing-pdf/`. The original portrait file is unchanged. Build, all 15 tests and diff whitespace checks passed. No RSVP or calendar behaviour changed.

## PDF outer margin correction — 28 October 2026

The previous export placed a 190 × 276mm invitation on a white A4 page, leaving 10mm side/top margins and 11mm below. The preview, browser print sheet and PDF now use the full 210 × 297mm A4 page. Internal padding preserves the existing content dimensions and physical position; cream paper extends to every edge. The PDF image is drawn at the exact page bounds, avoiding rounding gaps. Browser-print page margins are zero; organiser instructions distinguish this from a physical printer's unprintable area.

Downloaded a fresh two-page PDF with invented names (including a long name) and a three-line reply contact. Both A4 pages were rendered and visually inspected. PDF content transforms confirm that the image covers each complete page; all four outer five-pixel strips contain zero white pixels. Evidence: `qa/postal-edge-pdf/`. Build and all 15 existing tests pass. No physical borderless print was performed.

## Online layout restoration — 29 October 2026

Restored the online invitation declarations changed by the 28 October postal-spacing revision: the portrait fills its original inner width, and the surrounding heading, copy and time spacing use their earlier values. Removed the weekend calendar explanation and its unused style. The calendar download and formal time wording remain. The postal editor, PDF code and print stylesheet are unchanged.

Visually checked the production build at desktop, 390px and 320px, with no horizontal overflow. Desktop portrait frame is 816px rather than capped at 660px; phone widths are 312px and 252px. The postal preview retains its 104mm portrait and A4 dimensions, with content fitting inside the sheet. No RSVP was submitted and no email was sent for these layout checks.

Published to the live Cloudflare invitation and verified the restored 816px desktop portrait, removed paragraph, retained calendar link/time wording and available reply button. All 31 tests, build and deployment guard passed. Proof: `qa/web-spacing-restored/live-desktop.jpg`.
