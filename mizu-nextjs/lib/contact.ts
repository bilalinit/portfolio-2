import { CONTACT_EMAIL } from "@/data/pricing";

/** Open a Gmail draft; the visitor reviews it and sends it themselves. */
export function gmailComposeUrl(subject = "", body = "") {
  const params = new URLSearchParams({ view: "cm", fs: "1", to: CONTACT_EMAIL });
  if (subject) params.set("su", subject);
  if (body) params.set("body", body);
  return `https://mail.google.com/mail/?${params.toString()}`;
}
