# Promptly — Windows desktop voice-to-text app

Promptly turns spoken prompts into text in the Windows application the user
is already working in: terminals, editors, browsers, chat apps and other
text inputs. It can be used with coding assistants, but is not tied to one.
It is separate from Promptly Mobile, the Android version.

## Everyday workflow

Press a configurable global hotkey to start recording, speak, then press it
again to stop. The default hotkey is Ctrl+Alt+V. Groq's Whisper API transcribes
the audio, and Promptly copies the result to the clipboard and, if enabled,
auto-pastes into the active window using Windows Ctrl+V input.

## Features

- System tray application with recording, transcription and completion states.
- Two draggable overlay designs: a classic bar and a minimal black-and-white
  pill. The tray icon can show or hide the overlay.
- Optional AI text polish fixes punctuation, grammar and filler words while
  preserving meaning and language. If polish fails, it uses the raw transcript.
- A personal word list helps recognise names, brands and technical terms.
- Configurable hotkey with conflict reporting and restoration of the last
  working hotkey; no administrator privileges needed for the hotkey.
- Optional launch with Windows, overlay visibility and automatic pasting.
- First-run settings for the user's own Groq API key, with preferences saved
  through QSettings in the Windows registry.
- Audio/video file test mode for transcription without a microphone.
- Transcription runs in a background thread to keep the UI responsive.
- A portable single-executable release for Windows 64-bit.

## Requirements and limitations

The desktop app needs Windows 64-bit, an internet connection and the user's
own Groq API key. Normal recording needs a microphone; file test mode does
not. Transcription is cloud-based, not offline or on-device. The target app
must be active for auto-paste, and auto-paste can be switched off.

The app offers Whisper Large v3 Turbo and Whisper Large v3 transcription
options. Do not promise fixed latency, perfect transcription, perpetual free
API usage, or support for macOS or Linux.

## Engineering

Built with Python and PyQt6, sounddevice/numpy/scipy for microphone audio,
Groq's SDK for transcription, pyperclip for clipboard access and Win32 APIs
through ctypes for hotkeys and paste input. Qt signals and background workers
separate recording/transcription work from the GUI. PyInstaller packages the
portable executable; uv manages dependencies.

Public repository: https://github.com/AhmedSaeed4/promptly
No verified direct Windows download URL is included in the supplied content.
Do not invent one. The Android project's releases are not a download for the
Windows app.
