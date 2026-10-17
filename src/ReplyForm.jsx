import { useEffect, useRef, useState } from "react";
import { answerLabel, blankReply, reviewReply, sampleGuest, validateReply } from "./replies.js";

function Attendance({ guest, event, value, onChange, error }) {
  const id = `${guest.id}-${event}`;
  const options = event === "friday" ? ["yes", "no", "unsure"] : ["yes", "no"];
  return (
    <fieldset className="attendance" aria-describedby={error ? `${id}-error` : undefined}>
      <legend>{event === "friday" ? "Friday gathering · 16 July" : "Saturday wedding · 17 July"}</legend>
      <div className="answer-options">
        {options.map((option) => (
          <label key={option} className={value === option ? "answer selected" : "answer"}>
            <input type="radio" name={id} value={option} checked={value === option}
              aria-invalid={Boolean(error)} onChange={() => onChange(option)} />
            <span>{option === "yes" ? "Gladly" : option === "no" ? "With regrets" : "Not yet certain"}</span>
          </label>
        ))}
      </div>
      {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
    </fieldset>
  );
}

export function ReplyForm() {
  const guest = sampleGuest;
  const [stage, setStage] = useState("closed");
  const [reply, setReply] = useState(blankReply);
  const [errors, setErrors] = useState({});
  const stageHeading = useRef(null);
  const errorSummary = useRef(null);
  const attending = reply.friday !== "no" || reply.saturday !== "no";

  function showHeading(element) {
    element?.focus({ preventScroll: true });
    element?.scrollIntoView({ block: "start", behavior: "instant" });
  }
  useEffect(() => { if (stage !== "closed") showHeading(stageHeading.current); }, [stage]);
  useEffect(() => { if (Object.keys(errors).length) showHeading(errorSummary.current); }, [errors]);

  function change(field, value) {
    setReply((previous) => ({ ...previous, [field]: value }));
  }

  function review(event) {
    event.preventDefault();
    const nextErrors = validateReply(reply);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setStage("review");
  }

  function reset() {
    setReply(blankReply());
    setErrors({});
    setStage("complete");
  }

  if (stage === "closed") return (
    <div className="reply-preview">
      <p className="preview-note"><strong>Replies are not yet open.</strong> Each invitation is for one named guest, replying for themselves. This sample uses an invented name; nothing will be sent or saved.</p>
      <button className="button" onClick={() => setStage("edit")}>Preview an individual reply</button>
    </div>
  );

  if (stage === "complete") return (
    <div className="reply-preview">
      <h3 tabIndex={-1} ref={stageHeading}>The preview is complete.</h3>
      <p>Nothing has been sent or saved. Your sample answers have been cleared.</p>
      <button className="button secondary" onClick={() => setStage("edit")}>Try the form again</button>
    </div>
  );

  if (stage === "review") {
    const reviewed = reviewReply(guest, reply);
    return (
      <div className="reply-review">
        <p className="small-caps">Sample invitation · review only</p>
        <h3 tabIndex={-1} ref={stageHeading}>Your reply, for review</h3>
        <section className="guest-review" aria-label={`${reviewed.name} sample reply`}>
          <h4>{reviewed.name} <span className="sample-tag">sample</span></h4>
          <dl>
            <div><dt>Friday, 16 July</dt><dd>{answerLabel[reviewed.friday]}</dd></div>
            <div><dt>Saturday, 17 July</dt><dd>{answerLabel[reviewed.saturday]}</dd></div>
            {attending && <div><dt>Food allergies or intolerances</dt><dd className="allergy-review">{reviewed.allergies || "No notes supplied"}</dd></div>}
          </dl>
        </section>
        <p className="preview-note">This is a preview of the review step. No reply will be delivered.</p>
        <div className="form-actions">
          <button className="button secondary" onClick={() => setStage("edit")}>Amend the reply</button>
          <button className="button" onClick={reset}>Finish preview</button>
        </div>
      </div>
    );
  }

  return (
    <form className="reply-form" onSubmit={review} noValidate>
      <p className="small-caps">Sample invitation · one named guest</p>
      <h3 tabIndex={-1} ref={stageHeading}>Will you join us?</h3>
      <p className="preview-note">Please reply for yourself; each guest has a separate invitation. Use invented notes when trying this preview. Answers remain on this page only and disappear when it is reloaded.</p>
      {Object.keys(errors).length > 0 && <div role="alert" className="error-summary" tabIndex={-1} ref={errorSummary}>
        <strong>A few particulars are missing.</strong>
        <ul>{Object.entries(errors).map(([id, message]) => <li key={id}>{message}</li>)}</ul>
      </div>}
      <section className="guest-form" aria-labelledby={`${guest.id}-title`}>
        <h4 id={`${guest.id}-title`}>{guest.name} <span className="sample-tag">sample</span></h4>
        <Attendance guest={guest} event="friday" value={reply.friday} onChange={(value) => change("friday", value)} error={errors.friday} />
        <Attendance guest={guest} event="saturday" value={reply.saturday} onChange={(value) => change("saturday", value)} error={errors.saturday} />
        {attending && <div className="allergy-field">
          <label htmlFor={`${guest.id}-allergies`}>Food allergies or intolerances <span className="optional">(if any)</span></label>
          <p id={`${guest.id}-allergy-hint`} className="field-hint">The catering is yet to be settled. For now, please note any food allergies or intolerances we should know of.</p>
          <textarea id={`${guest.id}-allergies`} name={`${guest.id}-allergies`} rows={3} maxLength={1000} autoComplete="off"
            aria-describedby={`${guest.id}-allergy-hint${errors.allergies ? ` ${guest.id}-allergies-error` : ""}`}
            aria-invalid={Boolean(errors.allergies)} value={reply.allergies}
            onChange={(event) => change("allergies", event.target.value)} />
          {errors.allergies && <p className="field-error" id={`${guest.id}-allergies-error`}>{errors.allergies}</p>}
        </div>}
      </section>
      <div className="form-actions">
        <button type="button" className="button secondary" onClick={reset}>Clear & close preview</button>
        <button type="submit" className="button">Review the reply</button>
      </div>
      <p className="field-hint">Preview only. No wedding reply will be sent.</p>
    </form>
  );
}
