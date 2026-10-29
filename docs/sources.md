# Content sources and assumptions

Original external sources checked 3–4 October 2026; London connections checked again on 25 October 2026. Wedding details updated from Doug on 17 October 2026. Route advice describes available connections, not bookable timetables or fares for July 2027. Hotel availability and wedding room blocks are not verified.

## Given by Doug

**Friday venue correction, authorised 28 October 2026:** Friday's gathering may not be at the School, so its location is now unspecified in the invitation and calendar. The School name, address and map link belong to Saturday's reception. Saturday's venues remain unchanged. Doug directly authorised implementing and publishing the correction relayed on 27 October.

Wedding: Saturday 17 July 2027, church then Sir John Moore School in Appleby Magna. Friday activity: Friday 16 July; location, details and time unset. Collect separate Friday/Saturday attendance and food allergy or intolerance notes at this stage. On 28 October, Doug requested one shared invitation URL without a guest-list import. Each invited person enters their own name and replies for themselves; no plus-one or household reply flow. He supplied the wedding Gmail address, recorded locally in gitignored `.env.local`. GitHub Pages remains a static preview. The Cloudflare site accepts replies into private storage. The approved Resend sender is verified, and a controlled production save/amendment/mail pilot passed on 28 October; the invented test reply is excluded from totals.

## Venues and period

- [The Foundation Weddings](https://www.thefoundationweddings.com/): built in 1697; 101 Top Street, Appleby Magna, DE12 7AH. Used as the period anchor for the tone. The page's modern marketing wording is not reused.
- [St Michael & All Angels, Appleby Magna](https://applebygroup.org.uk/our-churches/appleby-magna/): parish church serving Appleby Magna/Parva. **Chosen church, confirmed by Doug on 17 October 2026.** He instructed us to advertise a 1pm ceremony while confirmation from the vicar is still pending.
- Names Doreen and Doug are from the user's context. Surnames, Friday location/activity/time, reception times and reply deadline are deliberately unset. The wedding mailbox was supplied on 28 October; it is configured as the production contact route and Reply-To for verified outgoing mail. Saturday's 1pm ceremony is UK local time; the calendar encodes 12:00 UTC, equivalent to 13:00 Europe/London on 17 July 2027. No finish time is invented.

## Hotels

- [The Appleby Inn](https://www.applebyinn.co.uk/): guest rooms; Appleby Parva, DE12 7AP; direct booking/enquiry site.
- [Appleby Park Hotel](https://www.applebyparkhotel.com/) and [contact page](https://www.applebyparkhotel.com/contact-us.html): A444, Junction 11/M42, Appleby Magna, DE12 7AP; standard/family rooms. This is the likely second hotel the user meant; offered as a nearby option, without asserting room availability or a group agreement.

## Travel

The public directions were shortened on 17 October at Doug’s request. On 25 October he requested London-airport connections to Tamworth. The page now adds one paragraph with Heathrow and Gatwick examples, Euston–Tamworth direct trains, and links to TfL/National Rail. The invitation offers possible help with a lift, without promising collection or further directions. The other detailed route research below is retained as background only.

- [London Northwestern Railway: Euston–Tamworth](https://www.londonnorthwesternrailway.co.uk/train-times/london-euston-to-tamworth): direct trains confirmed on 25 October; no present-day fare, frequency or journey-time promise is copied into the invitation.
- [Heathrow rail guidance](https://www.heathrow.com/transport-and-directions/by-rail-or-train): the airport lists the Euston connection via the Northern line and Elizabeth line at Tottenham Court Road; the invitation describes the reverse direction from Heathrow.
- [Gatwick train guidance](https://www.gatwickairport.com/transport-options/train.html): Thameslink serves St Pancras; Euston is a separate onward transfer, not the arrival station from Gatwick.
- [Local station distances](https://www.streetcheck.co.uk/postcode/de127au): Polesworth is geographically closer to Appleby Magna than Tamworth. Use “nearby” for Tamworth, not an absolute “nearest”; the reason for naming Tamworth is the useful London connection.

- [East Midlands Airport taxis](https://www.eastmidlandsairport.com/getting-to-and-from/by-taxi/) and [rail information](https://www.eastmidlandsairport.com/getting-to-and-from/by-train/): taxi transfer; airport has no railway station. Road travel into Appleby Magna is a practical recommendation, not a measured journey-time claim.
- [Birmingham Airport by train](https://www.birminghamairport.co.uk/transport-links/by-train/): free Air-Rail Link to Birmingham International and trains to Birmingham New Street.
- [CrossCountry Birmingham–Tamworth](https://www.crosscountrytrains.co.uk/routes-destinations/routes/birmingham-to-tamworth): rail link used for the second leg.
- [Manchester Airport by train](https://www.manchesterairport.co.uk/getting-to-and-from/by-train/): airport station and Manchester Piccadilly connection. The original guidance used a complete Tamworth journey rather than inventing a direct service or prescribing interchange timings; this detail is no longer displayed.
- [Heathrow rail and Underground](https://www.heathrow.com/transport-and-directions/by-rail-or-train) and [TfL Victoria line](https://tfl.gov.uk/tube/route/victoria/): Piccadilly to Green Park, Victoria northbound to Euston.
- [Gatwick by train](https://www.gatwickairport.com/transport-options/train.html): Thameslink to St Pancras; separate transfer to Euston.
- [Stansted rail](https://www.stanstedairport.co.uk/getting-to-and-from/by-train/): Stansted Express to Tottenham Hale; Victoria line onward to Euston.
- [Luton DART](https://www.lutondart.com/help/faqs/): DART terminal–Parkway connection. [Luton Airport](https://www.london-luton.co.uk/): rail links towards London; continue through St Pancras/Euston.
- [Avanti Tamworth–London](https://www.avantiwestcoast.co.uk/travel-information/train-times/tamworth/london-euston): Euston/Tamworth connection. [National Rail](https://www.nationalrail.co.uk/) is linked for actual travel-date routing.

Tamworth is a useful rail connection, not asserted to be the geographically nearest station. No taxi price, exact driving time, local-bus availability, parking allocation or shuttle service is promised. Map links search for each named venue; the maps are not embedded and do not load until opened.

## Typography and assets

[IM Fell English](https://github.com/google/fonts/tree/main/ofl/imfellenglish) and [Cormorant Garamond](https://github.com/google/fonts/tree/main/ofl/cormorantgaramond) from Google Fonts, SIL Open Font Licence, locally hosted Latin WOFF2 subsets. The typography and prose are period-informed adaptations, not a claim of a facsimile of a documented 1697 invitation. Original portrait copied byte for byte from the selected image; paper/fleuron are new supporting assets. The rejected shaped frame is not used; a fine rectangular double rule retains the print character without clipping the portrait.

## Hosting

[GitHub Pages creation](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) and [custom Actions workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Pages serves the static client; it cannot receive and privately store replies on its own.
