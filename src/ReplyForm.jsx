import { useEffect, useRef, useState } from "react";
import { answerLabel, blankReplies, reviewReplies, sampleGuests, validateReplies } from "./replies.js";

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
  const [stage, setStage] = useState("closed");
  const [replies, setReplies] = useState(blankReplies);
  const [errors, setErrors] = useState({});
  const stageHeading = useRef(null);
  const errorSummary = useRef(null);

  function showHeading(element) {
    element?.focus({ preventScroll: true });
    element?.scrollIntoView({ block: "start", behavior: "instant" });
  }
  useEffect(() => { if (stage !== "closed") showHeading(stageHeading.current); }, [stage]);
  useEffect(() => { if (Object.keys(errors).length) showHeading(errorSummary.current); }, [errors]);

  function change(id, field, value) {
    setReplies((previous) => ({ ...previous, [id]: { ...previous[id], [field]: value } }));
  }

  function review(event) {
    event.preventDefault();
    const nextErrors = validateReplies(sampleGuests, replies);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setStage("review");
  }

  function reset() {
    setReplies(blankReplies());
    setErrors({});
    setStage("complete");
  }

  if (stage === "closed") return (
    <div className="reply-preview">
      <p className="preview-note"><strong>Replies are not yet open.</strong> This preview uses two example guests. Please use invented notes about allergies or intolerances when trying the form; nothing will be sent or saved.</p>
      <button className="button" onClick={() => setStage("edit")}>Try a sample invitation</button>
    </div>
  );

  if (stage === "complete") return (
    <div className="reply-preview">
      <h3 tabIndex={-1} ref={stageHeading}>The preview is complete.</h3>
      <p>Nothing has been sent or saved. Your sample answers have been cleared.</p>
      <button className="button secondary" onClick={() => setStage("edit")}>Try the form again</button>
    </div>
  );

  if (stage === "review") return (
    <div className="reply-review">
      <p className="small-caps">Sample invitation · review only</p>
      <h3 tabIndex={-1} ref={stageHeading}>Your reply, for review</h3>
      {reviewReplies(sampleGuests, replies).map((guest) => (
        <section key={guest.id} className="guest-review" aria-label={`${guest.name} sample reply`}>
          <h4>{guest.name} <span className="sample-tag">example</span></h4>
          <dl>
            <div><dt>Friday, 16 July</dt><dd>{answerLabel[guest.friday]}</dd></div>
            <div><dt>Saturday, 17 July</dt><dd>{answerLabel[guest.saturday]}</dd></div>
            {(guest.friday !== "no" || guest.saturday !== "no") && <div><dt>Food allergies or intolerances</dt><dd className="allergy-review">{guest.allergies || "No notes supplied"}</dd></div>}
          </dl>
        </section>
      ))}
      <p className="preview-note">This is a preview of the review step. No reply will be delivered.</p>
      <div className="form-actions">
        <button className="button secondary" onClick={() => setStage("edit")}>Amend the reply</button>
        <button className="button" onClick={reset}>Finish preview</button>
      </div>
    </div>
  );

  return (
    <form className="reply-form" onSubmit={review} noValidate>
      <p className="small-caps">Sample invitation · two example guests</p>
      <h3 tabIndex={-1} ref={stageHeading}>Who shall join us?</h3>
      <p className="preview-note">Please try this form with invented details. Answers remain on this page only and disappear when it is reloaded.</p>
      {Object.keys(errors).length > 0 && <div role="alert" className="error-summary" tabIndex={-1} ref={errorSummary}>
        <strong>A few particulars are missing.</strong>
        <ul>{Object.entries(errors).map(([id, message]) => <li key={id}>{message}</li>)}</ul>
      </div>}
      {sampleGuests.map((guest) => {
        const reply = replies[guest.id];
        const attending = reply.friday !== "no" || reply.saturday !== "no";
        return (
          <section className="guest-form" key={guest.id} aria-labelledby={`${guest.id}-title`}>
            <h4 id={`${guest.id}-title`}>{guest.name} <span className="sample-tag">example</span></h4>
            <Attendance guest={guest} event="friday" value={reply.friday} onChange={(value) => change(guest.id, "friday", value)} error={errors[`${guest.id}-friday`]} />
            <Attendance guest={guest} event="saturday" value={reply.saturday} onChange={(value) => change(guest.id, "saturday", value)} error={errors[`${guest.id}-saturday`]} />
            {attending && <div className="allergy-field">
              <label htmlFor={`${guest.id}-allergies`}>Food allergies or intolerances <span className="optional">(if any)</span></label>
              <p id={`${guest.id}-allergy-hint`} className="field-hint">The catering is yet to be settled. For now, please note any food allergies or intolerances we should know of.</p>
              <textarea id={`${guest.id}-allergies`} name={`${guest.id}-allergies`} rows={3} maxLength={1000} autoComplete="off"
                aria-describedby={`${guest.id}-allergy-hint${errors[`${guest.id}-allergies`] ? ` ${guest.id}-allergies-error` : ""}`}
                aria-invalid={Boolean(errors[`${guest.id}-allergies`])} value={reply.allergies}
                onChange={(event) => change(guest.id, "allergies", event.target.value)} />
              {errors[`${guest.id}-allergies`] && <p className="field-error" id={`${guest.id}-allergies-error`}>{errors[`${guest.id}-allergies`]}</p>}
            </div>}
          </section>
        );
      })}
      <div className="form-actions">
        <button type="button" className="button secondary" onClick={reset}>Clear & close preview</button>
        <button type="submit" className="button">Review the reply</button>
      </div>
      <p className="field-hint">Preview only. No wedding reply will be sent.</p>
    </form>
  );
}
