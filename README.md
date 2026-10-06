# W Log

W Log is a Chrome extension that turns a spoken workout description into a clean, formatted workout log. You click **Speak**, describe what you did, and the extension uses a language model to rewrite it as one line per exercise with weights in both kilograms and pounds.

W Log was built as a hackathon project. It is a prototype rather than a finished product.

## Features

- **Voice input** using the browser's Web Speech API (`en-US`), with a live transcript shown while you talk
- **Workout formatting** by sending the transcript to `openai/gpt-4.1` through the GitHub Models chat completions API, producing lines like:

  ```
  Calf Raises - 2x16 (20 kg / 44 lbs)
  Pogo Hops - 3x20 (Bodyweight) (90 sec rest)
  ```

- **Copy** the formatted log to the clipboard
- **Save** the log as a text file named `workout_YYYY-MM-DD.txt`

The **Save to Docs** button is a placeholder and is not implemented yet. `popup.html` also contains a text box and a **Submit Workout** button for typed input, but they are hidden and not connected to any code.

## Tech stack

- Chrome Extension (Manifest V3)
- HTML, CSS, and vanilla JavaScript
- Web Speech API for speech recognition
- GitHub Models API (`https://models.github.ai/inference/chat/completions`)

There are no dependencies and no build step.

## Getting started

1. Clone the repository:

   ```bash
   git clone https://github.com/SummerPandey/Google-Hackathon.git
   ```

2. Add an API token. `popup.js` sends `this.apiKey` as a bearer token, but the value is not set in the repository. Create a GitHub personal access token with access to GitHub Models, then set it in the `VoiceAssistant` constructor in `popup.js`:

   ```js
   this.apiKey = 'your-github-token';
   ```

   Do not commit the token. Anything in an extension's source can be read by whoever installs it, so this setup is only suitable for local use.

3. Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and select the repository folder.

4. Click the W Log icon in the toolbar, press **Speak**, and allow microphone access when prompted.

## Project structure

```
manifest.json        Extension manifest (permissions, popup, icon)
popup.html           Popup layout and styles
popup.js             Speech recognition, API call, copy and save logic
icon.png             Extension icon
icon2.png-icon5.png  Additional images (not referenced by the manifest)
untitled/            Default IntelliJ Java starter project (not used by the extension)
```
