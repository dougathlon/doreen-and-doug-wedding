import { useEffect, useRef, useState } from "react";
import { answerLabel, blankReply, reviewReply, validateReply } from "./replies.js";
import { amendmentLink, api, consumeAmendment, initialAmendment, newKey } from "./rsvp-api.js";

function Attendance({ prefix, event, value, onChange, error, disabled }) {
  const id = `${prefix}-${event}`;
  const options = event === "friday" ? ["yes", "no", "unsure"] : ["yes", "no"];
  return <fieldset className="attendance" disabled={disabled} aria-describedby={error ? `${id}-error` : undefined}>
    <legend>{event === "friday" ? "Friday gathering · 16 July" : "Saturday wedding · 17 July"}</legend>
    <div className="answer-options">{options.map((option) => <label key={option} className={value === option ? "answer selected" : "answer"}>
      <input type="radio" name={id} value={option} checked={value === option} aria-invalid={Boolean(error)} onChange={() => onChange(option)} />
      <span>{option === "yes" ? "Gladly" : option === "no" ? "With regrets" : "Not yet certain"}</span>
    </label>)}</div>
    {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
  </fieldset>;
}
export function ReplyFields({ reply, change, errors = {}, prefix = "reply", disabled = false, emailReceipts = false }) {
  const attending = reply.friday !== "no" || reply.saturday !== "no";
  return <div className="guest-form">
    <div className="reply-field">
      <label htmlFor={`${prefix}-name`}>Your full name</label>
      <input id={`${prefix}-name`} name="name" autoComplete="name" maxLength={100} disabled={disabled} value={reply.name} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${prefix}-name-error` : undefined} onChange={(event) => change("name", event.target.value)} />
      {errors.name && <p className="field-error" id={`${prefix}-name-error`}>{errors.name}</p>}
    </div>
    <Attendance prefix={prefix} event="friday" value={reply.friday} onChange={(value) => change("friday", value)} error={errors.friday} disabled={disabled} />
    <Attendance prefix={prefix} event="saturday" value={reply.saturday} onChange={(value) => change("saturday", value)} error={errors.saturday} disabled={disabled} />
    {attending && <div className="allergy-field reply-field">
      <label htmlFor={`${prefix}-allergies`}>Food allergies or intolerances <span className="optional">(if any)</span></label>
      <p id={`${prefix}-allergy-hint`} className="field-hint">The catering is yet to be settled. For now, please note any food allergies or intolerances we should know of.</p>
      <textarea id={`${prefix}-allergies`} name="allergies" rows={3} maxLength={1000} autoComplete="off" disabled={disabled}
        aria-describedby={`${prefix}-allergy-hint${errors.allergies ? ` ${prefix}-allergies-error` : ""}`} aria-invalid={Boolean(errors.allergies)}
        value={reply.allergies} onChange={(event) => change("allergies", event.target.value)} />
      {errors.allergies && <p className="field-error" id={`${prefix}-allergies-error`}>{errors.allergies}</p>}
    </div>}
    <div className="reply-field">
      <label htmlFor={`${prefix}-email`}>Email address <span className="optional">(optional)</span></label>
      <p id={`${prefix}-email-hint`} className="field-hint">{emailReceipts ? "We shall send a copy of your reply and a private link for amendments." : "Leave an address if you would like us to contact you about your reply."}</p>
      <input id={`${prefix}-email`} name="email" type="email" autoComplete="email" maxLength={254} disabled={disabled} value={reply.email}
        aria-describedby={`${prefix}-email-hint${errors.email ? ` ${prefix}-email-error` : ""}`} aria-invalid={Boolean(errors.email)} onChange={(event) => change("email", event.target.value)} />
      {errors.email && <p className="field-error" id={`${prefix}-email-error`}>{errors.email}</p>}
    </div>
  </div>;
}
export function ReplySummary({ reply }) {
  return <section className="guest-review" aria-label={`${reply.name} reply`}>
    <h4>{reply.name}</h4><dl>
      <div><dt>Friday, 16 July</dt><dd>{answerLabel[reply.friday]}</dd></div>
      <div><dt>Saturday, 17 July</dt><dd>{answerLabel[reply.saturday]}</dd></div>
      {(reply.friday !== "no" || reply.saturday !== "no") && <div><dt>Food allergies or intolerances</dt><dd className="allergy-review">{reply.allergies || "No notes supplied"}</dd></div>}
      {reply.email && <div><dt>Email</dt><dd>{reply.email}</dd></div>}
    </dl>
  </section>;
}
export function ReplyForm({ config }) {
  const [stage, setStage] = useState("closed");
  const [reply, setReply] = useState(blankReply);
  const [saved, setSaved] = useState(null);
  const [token, setToken] = useState(initialAmendment);
  const [amendment, setAmendment] = useState({ token: initialAmendment });
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState(false);
  const [website, setWebsite] = useState("");
  const [uncertainSave, setUncertainSave] = useState(false);
  const submissionKey = useRef(newKey());
  const mutationKey = useRef(newKey());
  const stageHeading = useRef(null);
  const errorSummary = useRef(null);
  const preview = !config.available;
  const live = config.open;

  useEffect(() => {
    const openLink = () => {
      const nextToken = consumeAmendment();
      if (nextToken !== null) { setToken(nextToken); setAmendment({ token: nextToken }); }
    };
    window.addEventListener("hashchange", openLink);
    return () => window.removeEventListener("hashchange", openLink);
  }, []);
  useEffect(() => {
    if (!config.available) return;
    let current = true;
    setBusy(true);
    (amendment.token ? api("session", { method: "POST", body: { token: amendment.token } }) : api("reply"))
      .then(({ reply: stored, editToken: restoredToken }) => { if (current) { setSaved(stored); setReply(stored); setToken(restoredToken); setFailure(""); setErrors({}); setStage("edit"); } })
      .catch((error) => { if (current && (amendment.token || error.status !== 401)) { setFailure(error.message); setStage("link-error"); } })
      .finally(() => { if (current) setBusy(false); });
    return () => { current = false; };
  }, [config.available, amendment]);
  useEffect(() => {
    const heading = stageHeading.current;
    if (stage !== "closed" && heading) { heading.focus({ preventScroll: true }); heading.scrollIntoView({ block: "start" }); }
  }, [stage]);
  useEffect(() => { if (failure || Object.keys(errors).length) errorSummary.current?.focus(); }, [errors, failure]);

  function change(field, value) { setReply((previous) => ({ ...previous, [field]: value })); }
  function review(event) {
    event.preventDefault(); const next = validateReply(reply); setErrors(next); setFailure("");
    if (!Object.keys(next).length) { mutationKey.current = newKey(); setStage("review"); }
  }
  async function reset() {
    if (saved && !preview) {
      try { await api("session", { method: "DELETE" }); } catch (error) { if (error.status !== 401) { setFailure(error.message); return; } }
    }
    setReply(blankReply()); setSaved(null); setToken(null); setErrors({}); setFailure(""); setUncertainSave(false);
    submissionKey.current = newKey(); setStage("edit");
  }
  async function save() {
    if (preview) { setReply(blankReply()); setStage("complete"); return; }
    setBusy(true); setFailure("");
    try {
      const data = reviewReply(reply);
      const result = saved
        ? await api("reply", { method: "PATCH", body: { ...data, id: saved.id, version: saved.version, mutationKey: mutationKey.current } })
        : await api("replies", { method: "POST", body: { ...data, submissionKey: submissionKey.current, website } });
      setSaved(result.reply); setReply(result.reply); setUncertainSave(false);
      if (result.editToken) {
        setToken(result.editToken);
        // A failed session exchange must not turn a successful durable save into an apparent failed reply.
        try { await api("session", { method: "POST", body: { token: result.editToken } }); } catch { /* The private link remains usable. */ }
      }
      setStage("complete");
    } catch (error) {
      setFailure(error.message); setErrors(error.fields || {});
      setUncertainSave(!error.status || error.status >= 500);
    } finally { setBusy(false); }
  }
  const notice = config.localDemo
    ? "Local test: invented details only. Replies are saved on this computer; no email is sent."
    : preview ? "Design preview: use invented details. Nothing will be sent or saved." : null;
  const alert = (failure || Object.keys(errors).length > 0) && <div role="alert" className="error-summary" tabIndex={-1} ref={errorSummary}>
    {failure && <p>{failure}</p>}{Object.keys(errors).length > 0 && <ul>{Object.entries(errors).map(([key, message]) => <li key={key}>{message}</li>)}</ul>}
    {uncertainSave && <p>Keep this page open and retry the same reply. A retry will not create a second response.</p>}
  </div>;
  const contact = config.contactEmail && <p className="field-hint">For any other particulars, write to <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>.</p>;
  if (busy && stage === "closed") return <p role="status">Opening the reply form…</p>;
  if (stage === "closed") return <div className="reply-preview">
    {notice && <p className="preview-note">{notice}</p>}
    {!live && !preview && <p>Replies are presently closed.</p>}
    <p>Kindly submit a separate reply for each person named in your invitation.</p>
    {(live || preview) && <button className="button" onClick={() => setStage("edit")}>{preview ? "Preview the reply form" : "Give your reply"}</button>}{contact}
  </div>;
  if (stage === "link-error") return <div className="reply-preview"><h3 tabIndex={-1} ref={stageHeading}>Your private reply</h3>{alert}<p>Please reopen the private link you kept, or contact Doreen or Doug for assistance.</p>{contact}</div>;
  if (stage === "complete") return <div className="reply-preview">
    <h3 tabIndex={-1} ref={stageHeading}>{preview ? "The preview is complete." : "Your reply is received."}</h3>
    {notice && <p className="preview-note">{notice}</p>}
    {preview ? <p>Nothing has been sent or saved. Your sample answers have been cleared.</p> : <>
      <p>Thank you for letting us know.</p><ReplySummary reply={reply} />
      {token && <div className="private-link"><label htmlFor="amendment-link">Keep this private link to amend your reply</label>
        <input id="amendment-link" readOnly value={amendmentLink(token)} onFocus={(event) => event.target.select()} />
        <p className="field-hint">Anyone with this link can see and change your reply. Keep it for yourself.</p>
      </div>}
      {config.emailReceipts && reply.email && <p className="field-hint">A receipt has been queued for your email address. Your reply is saved even if the email is delayed.</p>}
      <button className="button secondary" onClick={() => setStage("edit")}>Amend your reply</button>
    </>}
    {alert}<p><button className="quiet-button" onClick={reset}>{preview ? "Try the form again" : "Finish and clear this form"}</button></p>{contact}
  </div>;
  if (stage === "review") return <div className="reply-review">
    <h3 tabIndex={-1} ref={stageHeading}>Your reply, for review</h3>
    {notice && <p className="preview-note">{notice}</p>}<ReplySummary reply={reviewReply(reply)} />{alert}
    <div className="form-actions">
      <button className="button secondary" disabled={busy || uncertainSave} onClick={() => { setErrors({}); setStage("edit"); }}>Amend the reply</button>
      <button className="button" disabled={busy || (!live && !preview)} onClick={save}>{busy ? "Saving your reply…" : preview ? "Finish preview" : "Send your reply"}</button>
    </div>{contact}
  </div>;
  return <form className="reply-form" onSubmit={review} noValidate>
    <h3 tabIndex={-1} ref={stageHeading}>{saved ? "Amend your reply" : "Will you join us?"}</h3>
    {notice && <p className="preview-note">{notice}</p>}
    <p>Kindly submit a separate reply for each person named in your invitation.</p>
    {config.deadline && <p>Please reply by {new Date(config.deadline).toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "long", year: "numeric" })}.</p>}
    {!live && !preview && <p>Replies are presently closed. Please contact us for amendments.</p>}
    {alert}<ReplyFields reply={reply} change={change} errors={errors} disabled={busy || (!live && !preview)} emailReceipts={config.emailReceipts} />
    <div className="bot-trap" aria-hidden="true"><label htmlFor="reply-website">Leave this field empty</label><input id="reply-website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></div>
    <p className="field-hint">Your reply is private to Doreen and Doug. Food notes will be shared only as needed with those arranging the catering, and removed when the wedding arrangements are complete. You may ask us to correct or remove your details.</p>
    <div className="form-actions"><button type="button" className="button secondary" disabled={busy} onClick={reset}>{saved ? "Reply for another invited person" : "Clear the form"}</button><button type="submit" className="button" disabled={busy || (!live && !preview)}>Review the reply</button></div>{contact}
  </form>;
}
