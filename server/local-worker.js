import { createApp } from "./app.js";
import { HttpError } from "./security.js";
// Separate local-only entry point. The production Worker has no login bypass.
export default createApp({
  localDemo: true,
  authorizeAdmin(request) {
    if (!["127.0.0.1", "localhost"].includes(new URL(request.url).hostname)) throw new HttpError(403, "Local test only.");
    return "local-test";
  },
});
