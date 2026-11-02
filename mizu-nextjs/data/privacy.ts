export const privacyCopy = {
  title: "Privacy policy",
  label: "Your information, explained.",
  introduction: "What we collect, why we use it, and the choices you have when you visit MIZU or talk to Nami.",
  updated: "3 November 2026",
  updatedDate: "2026-11-03",
  index: "On this page",
  summaryTitle: "The essentials",
  summary: [
    { title: "You choose what to share", text: "Browse our work without an account. Share only what we need to answer your question or discuss your project." },
    { title: "Chat goes to Google Gemini", text: "Nami uses Google's free Gemini API. Keep personal and confidential information out of the chat; use email for a private brief." },
    { title: "A person can help", text: "For privacy questions or a request about your information, email the studio directly." },
  ],
  contactTitle: "Questions about your information?",
  contactText: "Email us with your question or request. Include enough context for us to identify the information you mean, without sending sensitive documents unless we ask for them.",
  contactLabel: "Contact MIZU",
} as const;

export const privacySections = [
  {
    id: "scope",
    title: "Who this policy covers",
    paragraphs: [
      "MIZU is a digital studio based in Pakistan, responsible for how information is used on this portfolio website and in enquiries sent to us. This policy covers browsing the site, using Nami, our AI assistant, and contacting the studio about our services.",
      "Projects shown in our portfolio may have their own websites, apps and privacy policies. This policy does not describe how those separate products handle information.",
    ],
  },
  {
    id: "information",
    title: "Information we collect",
    paragraphs: [
      "When you chat with Nami, we receive the messages you submit and the earlier messages in the current conversation. That can include your name, contact details or project information if you choose to type them.",
      "When you email us, we receive your email address, the name shown by your email account, your message and any attachments. Our contact links open Gmail, and our quote form passes the selected project details and any notes to Gmail to prepare a draft. Google receives those details when you open the draft; MIZU receives the email only after you send it. Gmail's own privacy policy applies to its service.",
      "Requests to the site and chat service include technical information such as your IP address. Our servers and infrastructure providers may record request times, requested URLs, browser information, response status and diagnostic or security events. The chat service uses your IP address and request timestamps to limit repeated requests and prevent abuse.",
    ],
  },
  {
    id: "purposes",
    title: "Why we use it",
    paragraphs: [
      "We use information to deliver the website, answer your questions, discuss your brief, prepare estimates and communicate about potential or ongoing work. Technical information helps us keep the service available, investigate errors and protect it from misuse.",
      "Where data protection law requires a lawful basis, these purposes may involve taking steps at your request before a contract, performing a contract, our legitimate interests in responding to enquiries and running a secure service, or meeting legal obligations. Where a use requires consent, we will ask for it separately. Simply visiting this page does not give consent to unrelated uses.",
    ],
  },
  {
    id: "nami",
    title: "Talking to Nami",
    paragraphs: [
      "Nami is an AI assistant, not a person. When you send a message, our chat service passes it and the current conversation context to Google Gemini. A separate AI check reviews your latest message for misuse before Nami answers. AI replies can be inaccurate; project commitments, quotes and agreements come from a person at MIZU.",
      "The chat interface holds your conversation in memory while it is open. It does not save a conversation history in cookies or browser storage, and our chat application does not write a persistent transcript database. Reloading the page clears the chat interface; it does not delete information already processed by service providers or recorded in diagnostic logs.",
      "Nami currently uses the unpaid Gemini API. Under Google's unpaid-service terms, inputs and generated replies may be used to provide, improve and develop Google's products and machine learning technologies. Human reviewers may read and process that content. Google's terms include regional exceptions and separate conditions for paid services; the linked terms explain those details.",
      "Keep chat to general questions about the studio. Do not submit personal information, names or contact details, passwords, payment details, identity documents or confidential client material. If you want to discuss a private brief or share your contact details, email the studio instead. You can use the website without using Nami.",
    ],
    links: [{ label: "Google Gemini API data-use terms", href: "https://ai.google.dev/gemini-api/terms" }],
  },
  {
    id: "sharing",
    title: "Service providers and sharing",
    paragraphs: [
      "Cloudflare hosts the website frontend and processes requests needed to deliver its pages and assets. Vercel hosts Nami's backend, which receives chat messages, conversation context and request information before calling Google Gemini. Google processes chat content to check for misuse and generate replies. Our email providers process communications sent to the studio.",
      "Cloudflare and Vercel may process technical information and operational logs to deliver and secure their services. Operational and AI diagnostic services may also process error or execution records, which can include message-related information. We do not sell your personal information or share it for targeted advertising.",
      "Information may also be disclosed when necessary to comply with a legal obligation, respond to a valid legal request or protect the rights and security of the studio and its visitors. Service providers may process information in countries other than your own, under their applicable terms and data-protection arrangements.",
    ],
    links: [
      { label: "Cloudflare privacy notice", href: "https://www.cloudflare.com/privacypolicy/" },
      { label: "Vercel privacy policy", href: "https://vercel.com/legal/privacy-policy" },
    ],
  },
  {
    id: "storage",
    title: "Cookies and browser storage",
    paragraphs: [
      "The current website does not use advertising cookies, analytics trackers or a persistent browser chat history. Interface state, including the chat conversation and menu choices, is kept in memory. Infrastructure providers may use technical mechanisms needed to deliver and secure their services.",
      "Links to social platforms, project sites and other external services take you to services with their own privacy and cookie policies. If we introduce optional analytics or other tracking, we will update this policy and provide any choices required by applicable law.",
    ],
  },
  {
    id: "retention",
    title: "How long information stays",
    paragraphs: [
      "The chat application processes conversation content for the current request rather than storing a permanent chat archive. Rate-limit timestamps are evaluated over rolling one-minute and one-hour windows. Application rate-limit records are eligible for cleanup after one hour of inactivity and are removed when new requests are processed or the process restarts. Active-request slots are released when a request ends or become eligible for cleanup after 55 seconds. Hosting firewall counters and logs follow the provider’s configuration. These windows are not a guarantee that infrastructure logs are deleted after an hour.",
      "Enquiries and project correspondence may be retained for follow-up, delivering work, record keeping and resolving disputes. The relevant period depends on whether an enquiry becomes a project, the information involved and applicable legal obligations. Cloudflare and Vercel logs follow the applicable service plan and configuration; email and Google Gemini records follow their respective settings and terms. These provider records are separate from the chat interface and may remain after you reload or leave the site. Contact us for information about a particular record or to request deletion where available.",
    ],
  },
  {
    id: "choices",
    title: "Your choices and rights",
    paragraphs: [
      "You can browse without an account, choose not to use the chat, and decide what information to include in an enquiry. Depending on the law that applies to you, you may have rights to access, correct or delete personal information, restrict or object to processing, receive a portable copy, or withdraw consent where processing relies on it. Some requests are subject to exceptions, including information we must keep by law.",
      "Send privacy requests to the contact address below. We may need proportionate information to verify your identity and locate the relevant records. We will respond within the period required by applicable law. You may also have the right to complain to your local data protection authority.",
    ],
  },
  {
    id: "security",
    title: "Security and younger visitors",
    paragraphs: [
      "We use access controls and service safeguards to protect information, including limits on chat requests and checks for misuse. No internet service is completely secure, so please avoid sending unnecessary sensitive information.",
      "Our services and AI assistant are intended for adults enquiring about professional services. If you believe a child has shared personal information with us, contact the studio so we can investigate and address it.",
    ],
  },
  {
    id: "updates",
    title: "Changes to this policy",
    paragraphs: [
      "We may update this policy when the website, our providers or our information practices change. The date at the top identifies the latest version. We will provide additional notice where required for a material change.",
    ],
  },
] as const;
