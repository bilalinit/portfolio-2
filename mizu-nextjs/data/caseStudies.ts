export const caseStudyCopy = { allWork: "All work", credit: "By MIZU Studio", overview: "The idea", capabilities: "Inside the product", technical: "How we built it", source: "View source", year: "Year", contribution: "Our contribution", example: "In practice", next: "Keep exploring", view: "View project" } as const;

type CaseStudy = { tone: string; liveLabel: string; features: { title: string; text: string }[] };

export const projectBuilds: Record<string, { summary: string; tools: string[] }> = {
  "digital-fte": { summary: "FastAPI and PostgreSQL connect customer intake to a separate agent worker. Kafka carries events, with database polling as a fallback. The OpenAI Agents SDK handles specialist handoffs, while Docker and Kubernetes manifests define the deployment and separate API/worker scaling.", tools: ["OpenAI Agents SDK", "FastAPI", "PostgreSQL", "Kafka", "Kubernetes"] },
  dropsync: { summary: "Privacy shaped the architecture. Drops are encrypted in the browser before upload, while shared workspaces sync across devices. The assistant verifies requests on the server and keeps password-protected content behind separate checks.", tools: ["Browser encryption", "Real-time sync", "AI backend"] },
  "game-cam": { summary: "A native C++ plugin connects to the control panel through shared memory. Camera movement is recorded onto separate yaw and pitch layers, keeping the resulting keyframes editable inside After Effects.", tools: ["C++", "Shared memory", "After Effects"] },
  atlas: { summary: "The workspace runs on HTML, CSS and JavaScript modules. Local maps stay in browser storage; optional Google sign-in and Firestore provide cloud workspaces and owner-controlled sharing. Atlas imports architecture evidence without uploading source repository files.", tools: ["JavaScript", "Browser storage", "Firebase", "Firestore"] },
  warda: { summary: "Next.js and React power the website, with Firebase Authentication and Firestore behind student profiles and live reviews. A separate Python assistant answers studio questions in English and Roman Urdu, leaving teaching and religious guidance to Wardah.", tools: ["Next.js", "React", "Firebase", "Python"] },
  promptly: { summary: "Python and PyQt6 handle the tray app and recording overlay. Background workers send audio to Groq’s Whisper API, while native Windows hotkeys and paste controls connect the result to the active application.", tools: ["Python", "PyQt6", "Groq Whisper", "Windows APIs"] },
  "promptly-mobile": { summary: "Built for Android 8.0 and later, the app sends audio to Groq’s Whisper API with the user’s own key. It retries temporary connection failures and copies finished text to the clipboard for manual pasting.", tools: ["Android", "Groq Whisper", "Clipboard", "Connection retries"] },
};
export const caseStudies: Record<string, CaseStudy> = {
  "digital-fte": { tone: "charcoal", liveLabel: "Explore TechFlow", features: [
    { title: "Three channels, one history", text: "Gmail, WhatsApp and web-form enquiries share customer and ticket records, giving support the context to continue a conversation across channels." },
    { title: "Specialists with clear roles", text: "Triage routes requests to support or escalation. Knowledge-base tools and ticket operations help the agents respond, while escalation records cases for human attention." },
    { title: "A resilient processing pipeline", text: "Separate workers process queued requests. Database polling provides an alternative when Kafka is unavailable, and API and worker scaling are configured independently." },
  ] },
  dropsync: { tone: "blue", liveLabel: "Open DropSync", features: [
    { title: "Share, then disappear", text: "Files, notes, voice memos and drawings carry an expiry you choose. Browser encryption protects them before they leave your device." },
    { title: "A shared workspace", text: "Bring a team together with an invite code. Group chat, live calls and screen sharing keep the conversation alongside the work." },
    { title: "An assistant that acts", text: "Find, create and organise drops through conversation, with server-side verification and separate protection for locked content." },
  ] },
  "game-cam": { tone: "charcoal", liveLabel: "Explore Game cam", features: [
    { title: "Fly through the scene", text: "WASD movement and mouse-look make camera positioning feel familiar. Steer a first-person flight directly inside After Effects." },
    { title: "Keep the keyframes", text: "Your flight becomes editable animation. Separate yaw and pitch layers let you retime and refine each movement." },
    { title: "Built for real time", text: "A native C++ plugin and shared-memory control panel keep input responsive. Draft resolution helps the viewport keep up while you move." },
  ] },
  atlas: { tone: "olive", liveLabel: "Open Atlas", features: [
    { title: "Evidence becomes a map", text: "Use the coding agent already in your repository to create architecture JSON. Import it to see components, dependencies and source evidence together." },
    { title: "Explore and refine", text: "Pan, filter and inspect a system, switch to dependency-step Timeline view, then edit the map with undo and redo. Export JSON, SVG or PNG." },
    { title: "Choose how to share", text: "Work locally without an account, share an independent snapshot, or use optional cloud workspaces with owner-controlled read-only live links." },
  ] },
  warda: { tone: "cream", liveLabel: "Visit Warda", features: [
    { title: "A welcoming introduction", text: "A considered emerald identity brings Wardah’s Quran and Tajweed teaching approach, learning tracks and common questions into one place." },
    { title: "Stories from students", text: "Google sign-in lets students publish and manage their reviews. Live updates bring their experiences together on the Wall of Love." },
    { title: "A clearer path to a class", text: "An English and Roman Urdu assistant answers studio questions and directs booking enquiries to Wardah through WhatsApp." },
  ] },
  promptly: { tone: "lavender", liveLabel: "Open Promptly", features: [
    { title: "Speak where you work", text: "A global hotkey starts and stops recording. Transcribed words can be pasted straight into your active editor, terminal, browser or chat." },
    { title: "Make the words yours", text: "Optional AI polish cleans up filler words and punctuation. A personal word list helps recognise names and technical terms." },
    { title: "Quietly within reach", text: "A system-tray app and compact draggable overlay show recording progress without taking over the desktop. Uses your own Groq API key." },
  ] },
  "promptly-mobile": { tone: "lavender", liveLabel: "Get the Android release", features: [
    { title: "One floating button", text: "Record over the Android app you are already using. Colour changes show recording, transcription and a recording waiting for a connection." },
    { title: "Ready for your clipboard", text: "Whisper transcription and optional text polish turn speech into clean text. Copy the result, then paste it wherever you need it." },
    { title: "Built around mobile", text: "Quick settings tiles, a dismissible bubble and retries for connection failures keep the workflow convenient. Uses your own Groq API key." },
  ] },
};
