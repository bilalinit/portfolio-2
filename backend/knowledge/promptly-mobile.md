# Promptly Mobile — Android voice-to-text app

The Android version of Promptly turns speech into text using a floating
button or quick settings tiles. It copies the transcript to the clipboard;
the user pastes it into their chosen app. Unlike Promptly for Windows, it
does not automatically type or paste into other apps.

## Workflow and controls

A draggable white circular button with a black square floats over the
current app. Tap to record (red), tap again to transcribe (blue), then paste
the finished text when it returns to black. Amber means a recording is saved
after a connection failure and can be retried or discarded.

Press and hold, then drag the bubble onto the close target to dismiss it.
The close target stays out of the way during recording and transcription.
Quick settings tiles can start or stop recording and show or hide the bubble,
so recording can also be started while the bubble is hidden.

## Features

- Groq Whisper Large v3 transcription by default, with a faster Large v3 Turbo
  option in settings.
- Optional AI polish for punctuation, grammar and filler words, preserving
  meaning and language; raw text is used if polish fails.
- A personal word list helps with names, brands and technical terms.
- Automatic retries for temporary connection failures. After unsuccessful
  retries, the saved recording can be retried later or discarded. Invalid
  API keys fail immediately rather than being retried.
- The app sleeps when the floating bubble is hidden, waking for recording
  and transcription rather than doing continuous background work.

## Requirements and installation

Android 8.0 or later, an internet connection and the user's own Groq API key.
Permissions cover the microphone, notifications and display over other apps.
Audio is sent to Groq for cloud transcription; this is not offline dictation.
The app does not keep a transcript/recording history, but may temporarily
retain a failed recording for retry. Do not describe it as never retaining
any audio or promise Groq's provider-side data practices.

The supplied release is an APK downloaded from GitHub releases, not a Google
Play listing. Public repository: https://github.com/AhmedSaeed4/promptly-mobile
Releases: https://github.com/AhmedSaeed4/promptly-mobile/releases
These links are for Android, not Windows or iOS.

## Engineering

Native Android project using Kotlin source and Gradle. Its activity handles
settings, a foreground overlay service manages the floating control and
recording/transcription, and quick settings tile services provide shortcuts.
It records m4a audio and calls Groq's API. Builds require the Android SDK and
Java 17 or later.
