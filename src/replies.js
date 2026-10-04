export const sampleGuests = [
  { id: "example-one", name: "Guest One", example: true },
  { id: "example-two", name: "Guest Two", example: true },
];

export function blankReplies(guests = sampleGuests) {
  return Object.fromEntries(guests.map(({ id }) => [id, { friday: "", saturday: "", allergies: "" }]));
}

export function validateReplies(guests, replies) {
  const errors = {};
  for (const guest of guests) {
    const reply = replies[guest.id];
    if (!reply || !["yes", "no", "unsure"].includes(reply.friday)) {
      errors[`${guest.id}-friday`] = `Please choose a Friday answer for ${guest.name}.`;
    }
    if (!reply || !["yes", "no"].includes(reply.saturday)) {
      errors[`${guest.id}-saturday`] = `Please choose a Saturday answer for ${guest.name}.`;
    }
    if (reply && (typeof reply.allergies !== "string" || reply.allergies.length > 1000)) {
      errors[`${guest.id}-allergies`] = "Please keep allergy notes to 1,000 characters.";
    }
  }
  return errors;
}

export function reviewReplies(guests, replies) {
  return guests.map((guest) => {
    const { friday, saturday, allergies } = replies[guest.id];
    return {
      id: guest.id,
      name: guest.name,
      friday,
      saturday,
      allergies: friday === "no" && saturday === "no" ? "" : allergies.trim(),
    };
  });
}

export const answerLabel = { yes: "Will attend", no: "Will not attend", unsure: "Not yet certain" };
