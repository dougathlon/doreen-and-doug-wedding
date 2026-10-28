import { useEffect, useState } from "react";
import { blankReply, reviewReply, validateReply, answerLabel } from "./replies.js";
import { ReplyFields } from "./ReplyForm.jsx";
import { amendmentLink, api, apiPath, newKey } from "./rsvp-api.js";

function RecordEditor({ record, onSaved }) {
  const [reply, setReply] = useState(record || blankReply());
  const [source, setSource] = useState(record?.source || "telephone");
  const [included, setIncluded] = useState(record?.included ?? 1);
  const [errors, setErrors] = useState({}); const [failure, setFailure] = useState(""); const [busy, setBusy] = useState(false);
  const [link, setLink] = useState("");
  const [submissionKey, setSubmissionKey] = useState(newKey);
  function change(field, value) { setReply((previous) => ({ ...previous, [field]: value })); }
  async function save(event) {
    event.preventDefault(); const next = validateReply(reply); setErrors(next); if (Object.keys(next).length) return;
    setBusy(true); setFailure("");
    try {
      const body = { ...reviewReply(reply), source };
      if (record) await api(`admin/replies/${record.id}`, { method: "PATCH", body: { ...body, included, version: record.version, mutationKey: submissionKey } });
      else await api("admin/replies", { method: "POST", body: { ...body, submissionKey } });
      if (!record) { setReply(blankReply()); setSubmissionKey(newKey()); }
      await onSaved();
    } catch (error) { setFailure(error.message); } finally { setBusy(false); }
  }
  async function replaceLink() {
    setBusy(true); setFailure("");
    try {
      const result = await api(`admin/replies/${record.id}/link`, { method: "POST", body: { version: record.version } });
      setLink(amendmentLink(result.editToken));
    } catch (error) { setFailure(error.message); } finally { setBusy(false); }
  }
  return <form className="reply-form" onSubmit={save} noValidate>
    {failure && <p className="error-summary" role="alert">{failure}</p>}
    {link ? <div className="private-link"><label htmlFor={`link-${record.id}`}>Replacement private link</label><input id={`link-${record.id}`} readOnly value={link} onFocus={(event) => event.target.select()} /><p>The previous link has been revoked. Give this link only to the person concerned.</p><button type="button" className="button" onClick={onSaved}>Done</button></div> : <>
      <ReplyFields prefix={record?.id || "manual"} reply={reply} change={change} errors={errors} disabled={busy} />
      <label className="admin-field">Reply received through<select value={source} disabled={busy} onChange={(event) => setSource(event.target.value)}><option value="telephone">Telephone or message</option><option value="post">Post</option><option value="online">Website</option></select></label>
      {record && <label className="admin-field"><input type="checkbox" checked={Boolean(included)} disabled={busy} onChange={(event) => setIncluded(event.target.checked ? 1 : 0)} /> Include this response in attendance totals</label>}
      <p className="field-hint">Organiser changes do not automatically send a guest receipt. Excluding an unexpected or duplicate response removes it from totals and disables guest access.</p>
      <div className="admin-toolbar"><button className="button" disabled={busy}>{busy ? "Saving…" : record ? "Save amendments" : "Record the reply"}</button>{record?.included === 1 && <button className="button secondary" type="button" disabled={busy} onClick={replaceLink}>Replace private link</button>}</div>
    </>}
  </form>;
}
export function Admin() {
  const [data, setData] = useState(null); const [failure, setFailure] = useState(""); const [busy, setBusy] = useState(false);
  async function load(more = false) {
    setBusy(true); setFailure("");
    try {
      const result = await api(`admin/replies${more ? `?offset=${data.nextOffset}` : ""}`);
      setData((previous) => ({ ...result, replies: more ? [...previous.replies, ...result.replies] : result.replies }));
    } catch (error) { setFailure(error.message); } finally { setBusy(false); }
  }
  useEffect(() => { load(); }, []);
  async function retryMail() {
    setBusy(true);
    try { await api("admin/mail/retry", { method: "POST", body: {} }); await load(); }
    catch (error) { setFailure(error.message); } finally { setBusy(false); }
  }
  return <main className="paper particulars admin-page">
    <header><p className="small-caps">Doreen & Doug · private administration</p><h1 className="admin-title">The replies</h1><p>Received responses, attendance and food notes.</p></header>
    {failure && <p className="error-summary" role="alert">{failure}</p>}
    {!data && !failure && <p role="status">Opening the private list…</p>}
    {data && <>
      {data.localDemo && <p className="preview-note">Local test only. These records are stored on this computer. Production requires organiser sign-in; no email is sent here.</p>}
      <div className="admin-totals" aria-label="Attendance totals">
        <p><strong>{data.totals.included}</strong>Included responses<br />{data.totals.received - data.totals.included} excluded</p>
        <p><strong>{data.totals.fridayYes}</strong>Friday attending<br />{data.totals.fridayUnsure} uncertain · {data.totals.fridayNo} declined</p>
        <p><strong>{data.totals.saturdayYes}</strong>Saturday attending<br />{data.totals.saturdayNo} declined</p>
      </div>
      <p className="field-hint">The shared link has no preloaded invitation list, so these totals cannot show who has yet to reply. Review unexpected entries and possible duplicates before using headcounts.</p>
      <div className="admin-toolbar"><button className="button secondary" disabled={busy} onClick={() => load()}>Refresh replies</button><a className="button secondary" href={apiPath("admin/export?kind=attendance")}>Download attendance CSV</a><a className="button secondary" href={apiPath("admin/export?kind=catering")}>Download catering CSV</a></div>
      <p className="field-hint">Email: {data.mail.configured ? `${data.mail.pending} queued; ${data.mail.failed} need attention.` : "not connected. Saved replies are retained."}</p>
      {data.mail.configured && data.mail.pending > 0 && <button className="quiet-button" disabled={busy} onClick={retryMail}>Retry pending email</button>}
      <details className="admin-entry"><summary>Record a telephone or postal reply</summary><RecordEditor onSaved={() => load()} /></details>
      {data.replies.length === 0 && <p>No replies have been received.</p>}
      {data.replies.map((record) => <details className="admin-entry" key={`${record.id}-${record.version}`}>
        <summary>{record.name}{record.included ? "" : " · excluded"}</summary>
        <p className="field-hint">Friday: {answerLabel[record.friday]} · Saturday: {answerLabel[record.saturday]}<br />Last saved {new Date(record.updated_at).toLocaleString("en-GB", { timeZone: "Europe/London" })} UK time.</p>
        <RecordEditor record={record} onSaved={() => load()} />
      </details>)}
      {data.nextOffset !== null && <button className="button" disabled={busy} onClick={() => load(true)}>Show more replies</button>}
    </>}
    <p><a href="./">Return to the invitation</a></p>
  </main>;
}
