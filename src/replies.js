export function blankReply() {
  return { name: "", email: "", friday: "", saturday: "", allergies: "" };
}

export function validateReply(reply) {
  const errors = {};
  if (typeof reply.name !== "string" || !reply.name.trim() || reply.name.trim().length > 100 || /[\x00-\x1f\x7f]/.test(reply.name)) {
    errors.name = "Please give your full name, using no more than 100 characters.";
  }
  if (typeof reply.email !== "string" || reply.email.length > 254 || (reply.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reply.email.trim()))) {
    errors.email = "Please check the email address, or leave it blank.";
  }
  if (!["yes", "no", "unsure"].includes(reply.friday)) errors.friday = "Please choose your Friday answer.";
  if (!["yes", "no"].includes(reply.saturday)) errors.saturday = "Please choose your Saturday answer.";
  if (typeof reply.allergies !== "string" || reply.allergies.length > 1000) {
    errors.allergies = "Please keep notes about food allergies or intolerances to 1,000 characters.";
  }
  return errors;
}

export function reviewReply(reply) {
  return {
    name: reply.name.trim(), email: reply.email.trim(), friday: reply.friday, saturday: reply.saturday,
    allergies: reply.friday === "no" && reply.saturday === "no" ? "" : reply.allergies.trim(),
  };
}
export const answerLabel = { yes: "Will attend", no: "Will not attend", unsure: "Not yet certain" };
