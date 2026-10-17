export const sampleGuest = { id: "example-guest", name: "Example Guest" };

export function blankReply() {
  return { friday: "", saturday: "", allergies: "" };
}

export function validateReply(reply) {
  const errors = {};
  if (!["yes", "no", "unsure"].includes(reply.friday)) {
    errors.friday = "Please choose your Friday answer.";
  }
  if (!["yes", "no"].includes(reply.saturday)) {
    errors.saturday = "Please choose your Saturday answer.";
  }
  if (typeof reply.allergies !== "string" || reply.allergies.length > 1000) {
    errors.allergies = "Please keep notes about food allergies or intolerances to 1,000 characters.";
  }
  return errors;
}

export function reviewReply(guest, reply) {
  const { friday, saturday, allergies } = reply;
  return {
    id: guest.id,
    name: guest.name,
    friday,
    saturday,
    allergies: friday === "no" && saturday === "no" ? "" : allergies.trim(),
  };
}

export const answerLabel = { yes: "Will attend", no: "Will not attend", unsure: "Not yet certain" };
