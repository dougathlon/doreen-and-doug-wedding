export const apiPath = (path) => `${import.meta.env.BASE_URL}api/${path}`;
export async function api(path, options = {}) {
  const response = await fetch(apiPath(path), {
    credentials: "same-origin", cache: "no-store", ...options,
    headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  if (!response.headers.get("content-type")?.includes("application/json")) throw new Error("The reply service is unavailable. Please try again later.");
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || "Your reply could not be saved. Please try again.");
    error.status = response.status; error.fields = data.fields; throw error;
  }
  return data;
}
export function newKey() {
  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
export function amendmentLink(token) {
  const url = new URL(import.meta.env.BASE_URL, location.href);
  url.hash = `amend=${token}`;
  return url.href;
}
// Consume the bearer credential before making requests or rendering external links.
export function consumeAmendment() {
  const token = new URLSearchParams(location.hash.slice(1)).get("amend");
  if (token !== null) history.replaceState(null, "", `${location.pathname}${location.search}#reply`);
  return token;
}
export const initialAmendment = consumeAmendment();
