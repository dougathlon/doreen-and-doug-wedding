export const printLimits = { guests: 50, name: 80, contact: 180, contactLines: 3 };

export function preparePrintInvitations({ names, replyContact, replyBy }) {
  const recipients = names.split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
  const contact = replyContact.trim();
  const errors = {};
  if (!recipients.length) errors.names = "Add at least one guest's name.";
  else if (recipients.length > printLimits.guests) errors.names = `Print up to ${printLimits.guests} invitations at a time.`;
  else if (recipients.some((name) => name.length > printLimits.name)) errors.names = `Keep each name to ${printLimits.name} characters or fewer, on its own line.`;
  if (!contact) errors.replyContact = "Add an email, telephone number or postal address for replies.";
  else if (contact.length > printLimits.contact || contact.split(/\r?\n/).length > printLimits.contactLines) {
    errors.replyContact = `Keep the reply contact to ${printLimits.contact} characters and no more than three lines.`;
  }
  let deadline = "";
  if (replyBy) {
    const date = new Date(`${replyBy}T12:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(replyBy) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== replyBy || replyBy > "2027-07-17") {
      errors.replyBy = "Choose a valid reply date no later than 17 July 2027.";
    } else {
      deadline = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
    }
  }
  return { recipients, contact, deadline, errors };
}
