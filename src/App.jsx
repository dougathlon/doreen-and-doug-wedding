import { airports, hotels, mapLink, wedding } from "./content.js";
import { ReplyForm } from "./ReplyForm.jsx";

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;
function Ornament({ crest = false }) {
  return <img className={crest ? "ornament crest" : "ornament"} src={asset("fleuron.webp")} width="2172" height="724" alt="" aria-hidden="true" />;
}
function SectionHeading({ number, title, children }) {
  return <header className="section-heading"><p className="section-number">{number}</p><h2>{title}</h2>{children}</header>;
}

export function App() {
  return <>
    <a className="skip-link" href="#invitation">Skip to the invitation</a>
    <div className="preview-banner">A preview for Doreen & Doug <span aria-hidden="true">·</span> Replies are not yet open</div>
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
            <p className="time-note">At one o’clock in the afternoon ({wedding.ceremonyTime}).</p>
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
              <p>For those arriving on Friday, there will be a gathering at the School. The particulars and hour will follow.</p>
              <p>Please tell us in your reply whether you think you will join us; a little advance notice will help us make our arrangements.</p>
              <p className="venue-label">{wedding.school}<br /><span>{wedding.schoolAddress}</span></p>
              <a className="text-link" href={mapLink(wedding.school + " " + wedding.schoolAddress)}>Find the School</a>
            </article>
            <article>
              <p className="small-caps">Saturday · 17 July</p><h3>The Wedding Day</h3>
              <p>We shall be married at {wedding.church}, and afterwards receive our family and friends at Sir John Moore School.</p>
              <p>The ceremony begins at {wedding.ceremonyTime}. Further particulars of the reception will follow.</p>
              <p className="venue-label">{wedding.church}<br /><span>{wedding.churchAddress}</span></p>
              <a className="text-link" href={mapLink(wedding.church + " " + wedding.churchAddress)}>Find the Church</a>
            </article>
          </div>
          <p className="footnote">The calendar gives the ceremony at 1pm, local time in Appleby Magna. Friday remains a date to keep; its hour will follow.</p>
        </section>
        <Ornament />
        <section id="lodgings" className="detail-section">
          <SectionHeading number="II" title="Lodgings Nearby"><p>For those wishing to stay the night, two local houses offer rooms.</p></SectionHeading>
          <div className="two-columns">{hotels.map((hotel) => <article key={hotel.name}><h3>{hotel.name}</h3><p className="small-caps hotel-place">{hotel.place}</p><p>{hotel.detail}</p><a className="text-link" href={hotel.url}>Enquire about rooms</a></article>)}</div>
          <p className="footnote">Room allocations and any special rates are still to be confirmed. Please arrange transport between your lodgings and the venues.</p>
        </section>
        <Ornament />
        <section id="travel" className="detail-section">
          <SectionHeading number="III" title="Directions for Travellers"><p>Appleby Magna, Leicestershire</p></SectionHeading>
          <div className="travel-intro"><p>East Midlands and Birmingham are convenient airports for the village. If coming by railway, Tamworth is a useful point of arrival; arrange a taxi for the final journey to Appleby Magna.</p><p>For the School, use <strong>DE12 7AH</strong>. The village is close to Junction 11 of the M42. Directions for parking and the journey from Church to School will follow.</p></div>
          <h3 className="airport-heading">From the airports</h3>
          <div className="airport-list">{airports.map((airport) => <details key={airport.code}>
            <summary><span className="airport-name">{airport.name}<small>{airport.note}</small></span><span className="airport-code">{airport.code}</span><span className="disclosure" aria-hidden="true">+</span></summary>
            <div className="airport-detail"><p>{airport.text}</p><div className="route-links">{airport.links.map((link) => <a className="text-link" key={link.url} href={link.url}>{link.label}</a>)}</div></div>
          </details>)}</div>
          <p className="footnote">These are routes to help with planning, not a July 2027 timetable. Consult <a href="https://www.nationalrail.co.uk/">National Rail</a> and the airport links before booking, and check again nearer the day. A return taxi is best arranged in advance.</p>
        </section>
        <Ornament />
        <section id="reply" className="detail-section reply-section">
          <SectionHeading number="IV" title="The favour of a Reply"><p>Pray let us know whether you will join us on Friday, on Saturday, or on both days.</p></SectionHeading>
          <p className="reply-intro">The catering is yet to be settled. For the present, we ask only for a note of any food allergies or intolerances. Further particulars will follow.</p>
          <ReplyForm />
        </section>
        <footer className="page-footer"><Ornament /><p>Doreen <em>&</em> Doug</p><span>Appleby Magna · 17 July 2027</span><a href="#invitation">Return to the invitation</a></footer>
      </div>
    </main>
    <p className="preview-footer">Design preview · No replies are being collected.</p>
  </>;
}
