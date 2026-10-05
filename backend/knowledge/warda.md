# Warda — Quran teaching studio website

Warda is the online home of Wardah, a professional Quran and Tajweed teacher.
Wardah and Ustadhah Wardah refer to this same portfolio project.
MIZU built the website and its AI support assistant; MIZU does not teach the
courses. Warda Assistant is separate from Nami, MIZU's portfolio assistant.

## Website experience

- A calm, emerald-and-cream design using Playfair Display and Lato, subtle
  Framer Motion animations, and light and dark themes.
- Teacher introduction, teaching philosophy, lessons, a Quran verse break,
  frequently asked questions, student stories and contact calls to action.
- Three highlighted learning tracks: the basics (Noorani Qaida), fluent
  reading and memorisation (Hifz).
- Booking enquiries go to Wardah through WhatsApp. The site does not itself
  complete a class booking or collect a course payment.
- The Wall of Love lets students sign in with Google and post reviews.
  Firestore listeners display review updates live.
- A protected profile page lets signed-in students view and delete their
  own reviews, manage their session and change theme.

## Warda Assistant

- Answers studio, course and scheduling questions in English or Roman Urdu,
  mirroring the visitor's language. It is a support assistant, not Wardah.
- Its course context includes Noorani Qaida, basic and advanced Tajweed,
  Quran recitation, Masnoon Dua, Salat Mastery and Islamic Essentials.
- Scheduling context includes 30- and 40-minute sessions and flexible time
  zones; actual availability and pricing must be confirmed with Wardah.
- Pricing and platform enquiries are routed to the teacher's WhatsApp.
  Religious rulings are deferred to the teacher rather than generated.
- An output guardrail catches off-topic replies. Requests carry conversation
  history to a stateless API.

## Engineering

The frontend uses Next.js 16, React 19, Tailwind CSS 4 and Firebase. Google
sign-in uses Firebase Authentication; reviews use Cloud Firestore with
security rules and indexes. The project includes Firebase Hosting setup.

The assistant uses Python, FastAPI and the OpenAI Agents SDK with a Gemini
model through an OpenAI-compatible API. Its Docker deployment targets
Hugging Face Spaces. The API provides chat and health endpoints.

No verified public website URL, course prices or live schedule are included
in the supplied project content. Do not invent those details. For enquiries
about commissioning a similar site, connect the visitor to MIZU.
