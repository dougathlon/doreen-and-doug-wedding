import { useEffect, useRef, useState } from "react";
import { wedding } from "./content.js";
import { preparePrintInvitations, printLimits } from "./print-invitations.js";

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

function PrintedInvitation({ name, contact, deadline }) {
  return <article className="print-sheet" aria-label={`Invitation for ${name || "a guest"}`}>
    <div className="print-sheet-inner">
      <img className="print-crest" src={asset("fleuron.webp")} width="2172" height="724" alt="" />
      <div className="print-portrait-frame"><img className="print-portrait" src={asset("wedding-portrait.png")} width="1536" height="1024" alt="Doreen and Doug as babies before Sir John Moore School." /></div>
      <p className={`print-recipient${name ? "" : " placeholder"}`}>{name || "[Name of guest]"}</p>
      <p className="print-preface">Your Company is requested<br /><span>at the Marriage of</span></p>
      <h2 className="print-couple">Doreen <em>&</em> Doug</h2>
      <p className="print-date">Saturday, the Seventeenth of July<br /><span>Two Thousand & Twenty-Seven</span></p>
      <p className="print-time">At one o’clock in the afternoon (1pm).</p>
      <p className="print-venue">{wedding.church}<span>{wedding.churchAddress}</span></p>
      <p className="print-reception"><em>and afterwards at</em> {wedding.school}<span>{wedding.schoolAddress}</span></p>
      <p className="print-friday">For those arriving on Friday, the Sixteenth of July,<br />there will be a gathering. The place and hour will follow.</p>
      <div className="print-reply">
        <p>The favour of a reply{deadline ? <> by <strong>{deadline}</strong></> : ""} is requested.</p>
        <p>Please tell us whether you will join us on Friday, Saturday, or both days,<br />and note any food allergies or intolerances.</p>
        <p className={`print-contact${contact ? "" : " placeholder"}`}>{contact || "[Reply contact to be added]"}</p>
      </div>
    </div>
  </article>;
}

export function PrintEditor() {
  const [names, setNames] = useState("");
  const [replyContact, setReplyContact] = useState("");
  const [replyBy, setReplyBy] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [printError, setPrintError] = useState("");
  const [printing, setPrinting] = useState(false);
  const [progress, setProgress] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [scale, setScale] = useState(1);
  const preview = useRef(null);
  const errorSummary = useRef(null);
  const prepared = preparePrintInvitations({ names, replyContact, replyBy });
  const errors = attempted ? prepared.errors : {};
  const recipients = prepared.recipients.slice(0, printLimits.guests);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / (190 * 96 / 25.4))));
    observer.observe(preview.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); }, [pdfUrl]);

  function change(setter, value) {
    setter(value);
    setPdfUrl("");
    setPrintError("");
  }

  async function print(event) {
    event.preventDefault();
    setAttempted(true);
    setPrintError("");
    setPdfUrl("");
    if (Object.keys(prepared.errors).length) {
      requestAnimationFrame(() => errorSummary.current?.focus());
      return;
    }
    setPrinting(true);
    setProgress("Preparing the invitations…");
    try {
      await document.fonts.ready;
      await Promise.all([...preview.current.querySelectorAll("img")].map((image) => image.decode()));
      if (!document.fonts.check('16px "Fell"') || !document.fonts.check('16px "Cormorant"')) throw new Error("The invitation fonts could not load. Reload the page and try again.");
      if ([...preview.current.querySelectorAll(".print-sheet-inner")].some((sheet) => sheet.scrollHeight > sheet.clientHeight + 1)) {
        throw new Error("The wording does not fit on one page. Shorten the longest guest name or the reply contact, then try again.");
      }
      if (event.nativeEvent.submitter?.value === "browser") {
        window.print();
      } else {
        const { createInvitationPdf } = await import("./print-pdf.js");
        const bytes = await createInvitationPdf([...preview.current.querySelectorAll(".print-sheet")], setProgress);
        const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
        setPdfUrl(url);
        const link = document.createElement("a");
        link.href = url;
        link.download = "doreen-and-doug-postal-invitations.pdf";
        link.click();
      }
    } catch (error) {
      setPrintError(error.message || "The invitation could not be prepared. Reload the page and try again.");
      requestAnimationFrame(() => errorSummary.current?.focus());
    } finally {
      setPrinting(false);
      setProgress("");
    }
  }

  return <main className="print-editor">
    <header className="print-editor-heading">
      <a href="./">View the wedding website</a>
      <h1>Postal invitations</h1>
      <p>For Doreen & Doug · one named person per invitation</p>
    </header>
    <div className="print-workspace">
      <form className="print-controls" onSubmit={print} noValidate>
        <h2>Prepare the letters</h2>
        <p>Enter one name per line. Each person receives a separate A4 invitation, ready to print or save as a PDF.</p>
        <p className="field-hint">Names and reply details stay in this tab. They are not sent or saved; reloading clears them. Keep your original list separately.</p>
        {(Object.keys(errors).length > 0 || printError) && <div className="error-summary" role="alert" tabIndex={-1} ref={errorSummary}>
          <strong>Before printing</strong>
          <ul>{Object.values(errors).map((error) => <li key={error}>{error}</li>)}{printError && <li>{printError}</li>}</ul>
        </div>}
        <label htmlFor="print-names">Names for the invitations</label>
        <p id="print-names-hint" className="field-hint">Use the name as it should appear on the letter. Up to 50 people per batch; no companions are added.</p>
        <textarea id="print-names" value={names} onChange={(event) => change(setNames, event.target.value)} disabled={printing} rows={7} maxLength={10000} autoComplete="off" spellCheck={false} aria-invalid={Boolean(errors.names)} aria-describedby="print-names-hint" />
        <label htmlFor="print-contact">Where should they reply?</label>
        <p id="print-contact-hint" className="field-hint">An email, telephone number or return address. This is printed on each letter; it does not connect the website’s RSVP system.</p>
        <textarea id="print-contact" value={replyContact} onChange={(event) => change(setReplyContact, event.target.value)} disabled={printing} rows={3} maxLength={printLimits.contact} autoComplete="off" aria-invalid={Boolean(errors.replyContact)} aria-describedby="print-contact-hint" />
        <label htmlFor="print-deadline">Reply by <span className="optional">(optional)</span></label>
        <input id="print-deadline" type="date" max="2027-07-17" value={replyBy} onChange={(event) => change(setReplyBy, event.target.value)} disabled={printing} aria-invalid={Boolean(errors.replyBy)} />
        <p className="print-count" role="status">{progress || (recipients.length ? `${recipients.length} invitation${recipients.length === 1 ? "" : "s"} prepared` : "Add a name to personalise the preview")}</p>
        <button type="submit" value="pdf" className="button" disabled={printing}>Download PDF</button>
        {pdfUrl && <p className="field-hint" role="status">Your PDF is ready. <a href={pdfUrl} download="doreen-and-doug-postal-invitations.pdf">Download it again</a>.</p>}
        <button type="submit" value="browser" className="button secondary print-browser" disabled={printing}>Print in browser</button>
        <button type="button" className="print-clear" disabled={printing} onClick={() => { change(setNames, ""); setAttempted(false); }}>Clear the names</button>
        <p className="field-hint print-settings">The PDF includes the paper and artwork at print resolution, with one A4 page per person. Print it at <strong>actual size / 100%</strong>. To change the names, edit this form and download a new PDF.</p>
        <p className="field-hint">For browser printing, choose <strong>A4</strong>, <strong>100% scale</strong>, <strong>headers and footers off</strong> and <strong>background graphics on</strong>. The editor controls are omitted.</p>
      </form>
      <div className="print-preview" ref={preview} style={{ "--preview-scale": scale }}>
        <p className="print-preview-label">Print preview · A4</p>
        {(recipients.length ? recipients : [""]).map((name, index) => <div className="print-page-preview" key={index}>
          <PrintedInvitation name={name} contact={prepared.contact} deadline={prepared.deadline} />
        </div>)}
      </div>
    </div>
  </main>;
}
