import { useEffect, useState } from "react";
import { api } from "./rsvp-api.js";
import { hotels, mapLink, wedding } from "./content.js";
import { ReplyForm } from "./ReplyForm.jsx";

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;
function Ornament({ crest = false }) {
  return <img className={crest ? "ornament crest" : "ornament"} src={asset("fleuron.webp")} width="2172" height="724" alt="" aria-hidden="true" />;
}
function SectionHeading({ number, title, children }) {
  return <header className="section-heading"><p className="section-number">{number}</p><h2>{title}</h2>{children}</header>;
}

export function App() {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    let current = true;
    api("config").then((value) => { if (current) setConfig(value); }).catch(() => { if (current) setConfig({ available: false, open: false }); });
    return () => { current = false; };
  }, []);
  return <>
    <a className="skip-link" href="#invitation">Skip to the invitation</a>
    <div className="preview-banner">{!config ? "Doreen & Doug · 17 July 2027" : config.localDemo ? "Local test · invented details only · no email is sent" : !config.available ? "A preview for Doreen & Doug · Replies are not yet open" : config.open ? "Doreen & Doug · 17 July 2027" : "Doreen & Doug · Replies are presently closed"}</div>
    <nav className="navigation" aria-label="Wedding information">
      <a href="#invitation">Invitation</a><a href="#weekend">Weekend</a><a href="#lodgings">Lodgings</a><a href="#travel">Travel</a><a href="#reply">Reply</a>
    </nav>
    <main>
      <article className="paper invitation" id="invitation" aria-label="Wedding invitation">
        <div className="invitation-inner">
          <Ornament crest />
          <div className="portrait-frame"><img className="portrait" src={asset("wedding-portrait.png")} alt="Doreen and Doug as babies in cream lace, green and russet gowns, seated before Sir John Moore School." width="1536" height="1024" fetchPriority="high" /></div>
          <div className="invitation-words">
            <p className="invitation-preface">Your Company is requested<br /><span>at the Marriage of</span></p>
            <h1><span>Doreen</span><em aria-hidden="true">&</em><span className="sr-only">and </span><span>Doug</span></h1>
            <Ornament />
            <p className="invitation-date">Saturday, the Seventeenth of July<br /><span>Two Thousand & Twenty-Seven</span></p>
            <p className="time-note">At one o’clock in the afternoon.</p>
            <p className="invitation-venue">{wedding.church}<br /><span>Appleby Magna</span></p>
            <p className="invitation-afterwards"><em>and afterwards at</em><br /><span>{wedding.school}</span></p>
            <a className="button" href="#reply">The favour of a Reply</a>
            <a className="quiet-link calendar-link" href={`${import.meta.env.BASE_URL}wedding-weekend.ics`} download>Keep the dates in your calendar</a>
          </div>
          <Ornament />
        </div>
      </article>
      <div className="paper particulars">
        <section id="weekend" className="detail-section">
          <SectionHeading number="I" title="Particulars of the Weekend"><p>We hope you will keep us company in Appleby Magna.</p></SectionHeading>
          <div className="two-columns weekend-columns">
            <article>
              <p className="small-caps">Friday · 16 July</p><h3>On the Eve</h3>
              <p>For those arriving on Friday, there will be a gathering. The place and hour will follow.</p>
              <p>Please tell us in your reply whether you think you will join us; a little advance notice will help us make our arrangements.</p>
            </article>
            <article>
              <p className="small-caps">Saturday · 17 July</p><h3>The Wedding Day</h3>
              <p>We shall be married at {wedding.church}, and afterwards receive our family and friends at Sir John Moore School.</p>
              <p>The ceremony begins at {wedding.ceremonyTime}. Further particulars of the reception will follow.</p>
              <p className="venue-label">{wedding.church}<br /><span>{wedding.churchAddress}</span></p>
              <a className="text-link" href={mapLink(wedding.church + " " + wedding.churchAddress)}>Find the Church</a>
              <p className="venue-label">{wedding.school}<br /><span>{wedding.schoolAddress}</span></p>
              <a className="text-link" href={mapLink(wedding.school + " " + wedding.schoolAddress)}>Find the School</a>
            </article>
          </div>
          <p className="footnote">The calendar gives the ceremony at 1pm, local time in Appleby Magna. Friday remains a date to keep; its hour will follow.</p>
        </section>
        <Ornament />
        <section id="lodgings" className="detail-section">
          <SectionHeading number="II" title="Lodgings Nearby"><p>For those wishing to stay the night, two local houses offer rooms.</p></SectionHeading>
          <div className="two-columns">{hotels.map((hotel) => <article key={hotel.name}><h3>{hotel.name}</h3><p className="small-caps hotel-place">{hotel.place}</p><p>{hotel.detail}</p><a className="text-link" href={hotel.url}>Enquire about rooms</a></article>)}</div>
        </section>
        <Ornament />
        <section id="travel" className="detail-section">
          <SectionHeading number="III" title="Directions for Travellers"><p>Appleby Magna, Leicestershire</p></SectionHeading>
          <div className="travel-intro">
            <p>The Church and School are both in Appleby Magna. East Midlands and Birmingham are convenient airports for the village.</p>
            <p>Those arriving at a London airport can travel into the city and onward from <a href="https://www.londonnorthwesternrailway.co.uk/train-times/london-euston-to-tamworth">London Euston directly to Tamworth</a>, a nearby station for Appleby Magna. From Heathrow, take the Elizabeth line to Tottenham Court Road, then the Northern line to Euston. From Gatwick, take Thameslink to St Pancras, then make the short transfer to Euston.</p>
            <p>For those arriving by train or air, do let us know your plans; we may be able to help with a lift.</p>
            <p className="field-hint">For your chosen travel day: <a href="https://tfl.gov.uk/plan-a-journey/">London connections</a> · <a href="https://www.nationalrail.co.uk/">Railway journeys</a></p>
          </div>
        </section>
        <Ornament />
        <section id="reply" className="detail-section reply-section">
          <SectionHeading number="IV" title="The favour of a Reply"><p>Pray let us know whether you will join us on Friday, on Saturday, or on both days.</p></SectionHeading>
          <p className="reply-intro">The catering is yet to be settled. For the present, we ask only for a note of any food allergies or intolerances. Further particulars will follow.</p>
          {config ? <ReplyForm config={config} /> : <p role="status">Opening the reply form…</p>}
        </section>
        <footer className="page-footer"><Ornament /><p>Doreen <em>&</em> Doug</p><span>Appleby Magna · 17 July 2027</span><a href="#invitation">Return to the invitation</a></footer>
      </div>
    </main>
    {config && (!config.available || config.localDemo) && <p className="preview-footer">{config.localDemo ? "Local test · Replies stay on this computer. No email is sent." : "Design preview · No replies are being collected."}</p>}
  </>;
}
