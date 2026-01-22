# AudioScript 🎙️ [Open Source]

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React_18-61DAFB.svg?logo=react)
![Vite](https://img.shields.io/badge/build-Vite-646CFF.svg?logo=vite)
![Python](https://img.shields.io/badge/backend-Python_3.10-3776AB.svg?logo=python)
![FastAPI](https://img.shields.io/badge/api-FastAPI-009688.svg?logo=fastapi)

**AudioScript** is a privacy-first web application that turns your voice into text. It processes audio **100% locally** on your device using OpenAI's Whisper technology—ensuring your data never leaves your computer.

> **"Cloud UI, Local Privacy"**: The interface runs in the browser, but the brain runs on your machine.

---

## 🌟 Key Features

-   **🔒 Privacy First**: Audio processing happens on `localhost`. No data sent to the cloud.
-   **⚡ Real-time Transcription**: Powered by `faster-whisper` and WebSockets.
-   **🎯 High Accuracy**: Uses OpenAI's state-of-the-art Whisper models.
-   **📄 Rich Exports**: Export to PDF, SRT, VTT, or Text with timestamps.
-   **🎨 Modern UI**: Beautiful generic React + Shadcn UI interface.

---

## 🏗️ Project Structure (How it's built)

This project is divided into two main parts: the **Backend** (the brain) and the **Frontend** (the face).

```
A2T/
├── backend/                # The Python Server (The Brain)
│   ├── main.py             # The entry point that runs the API server
│   ├── transcriber.py      # The logic that uses AI to convert Audio -> Text
│   ├── requirements.txt    # List of python libraries needed
│   └── venv/               # (Created by you) A sandbox for python libraries
│
├── frontend/               # The React Website (The Face)
│   ├── src/
│   │   ├── components/     # Building blocks (Buttons, FileUpload, Header)
│   │   ├── hooks/          # Logic for Recording (useSpeechToText.ts)
│   │   ├── pages/          # The main layout (Index.tsx)
│   │   └── App.tsx         # The root component
│   ├── package.json        # List of javascript libraries needed
│   └── vite.config.ts      # Configuration for the website builder
│
└── README.md               # This guide!
```

### How it works properly:
1.  **Frontend**: You click "Record" on the website. Your browser captures audio.
2.  **File Handling**: When you stop, the website creates an audio file.
3.  **Sending**: You click "Transcribe", and the website sends this file to the **Backend**.
4.  **Processing**: The **Backend** receives the file and feeds it to the AI model.
5.  **Result**: The text is sent back to the **Frontend** for you to see and edit.

---

## 🚀 Installation Guide (Step-by-Step for Beginners)

To run this app, you need to set up two things running at the same time: the Backend and the Frontend.

### Prerequisites (Download these first!)
1.  **Node.js**: [Download Here](https://nodejs.org/) (Choose "LTS" version). This runs the website.
2.  **Python**: [Download Here](https://www.python.org/downloads/) (Version 3.8 to 3.11). This runs the AI.
3.  **FFmpeg**: [Download Here](https://ffmpeg.org/download.html).
    *   *Why?* The AI needs this tool to read audio files.
    *   *Important*: Make sure to [add FFmpeg to your system PATH](https://www.wikihow.com/Install-FFmpeg-on-Windows).

---

### Step 1: Set up the Backend (The Brain)

This runs the AI server.

1.  Open your terminal (Command Prompt or PowerShell).
2.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
3.  **Create a Virtual Environment** (This keeps your computer clean):
    ```bash
    # Windows
    python -m venv venv
    
    # macOS/Linux
    python3 -m venv venv
    ```
4.  **Activate it**:
    ```bash
    # Windows
    .\venv\Scripts\activate
    
    # macOS/Linux
    source venv/bin/activate
    ```
    *(You should see `(venv)` appear at the start of your command line).*
5.  **Install Libraries**:
    ```bash
    pip install -r requirements.txt
    ```
6.  **Start the Server**:
    ```bash
    uvicorn main:socket_app --reload --port 8001
    ```
    You should see: `Uvicorn running on http://127.0.0.1:8001`

**Stop here!** Keep this terminal window **OPEN**. Do not close it.

---

### Step 2: Set up the Frontend (The Website)

This shows the user interface.

1.  Open a **NEW** terminal window.
2.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
3.  **Install Libraries**:
    ```bash
    npm install
    ```
4.  **Start the Website**:
    ```bash
    npm run dev
    ```
5.  Look for a link like `http://localhost:5173` in the terminal. **Ctrl + Click** it to open your browser.

---

## �️ Usage

1.  **Allow Microphone**: Your browser will ask for permission. Click "Allow".
2.  **Record**: Click the **Red Microphone Button** at the bottom right.
    *   *Status*: It will pulse red while recording.
3.  **Stop**: Click the button again to stop.
4.  **Preview**: You will see your recording appear in the box. You can play it back to check.
5.  **Transcribe**: Click the blue **"Transcribe File"** button.
    *   *Wait*: It might take a few seconds depending on your computer speed.
6.  **Read & Edit**: The text appears! You can fix typos directly in the text box.
7.  **Listen**: Click the **"Speak"** button (speaker icon) to hear it read out loud.
8.  **Save**: Click **"Download options"** to save as a PDF or text file.

---

## ❓ Troubleshooting

**"Unable to connect to server"**
*   Is your Backend terminal running?
*   Did you see any errors in the Backend terminal?
*   Refresh the page.

**"Transcription failed" or "Error processing audio"**
*   Do you have **FFmpeg** installed? The AI cannot read audio without it.
*   Try a shorter recording to test.

**"Microphone not working"**
*   Check your browser permissions (lock icon in address bar).
*   Check your system sound settings.

---

## 🤝 Contributing

We love contributions! If you know code:

1.  **Fork** this repo.
2.  **Clone** it to your machine.
3.  Create a branch: `git checkout -b my-new-feature`
4.  Commit changes: `git commit -m 'Add some feature'`
5.  Push: `git push origin my-new-feature`
6.  Open a **Pull Request** on GitHub.

## ☁️ Deployment

### Frontend (Vercel)
You can deploy the Frontend to [Vercel](https://vercel.com) easily:
1.  Push this repo to GitHub.
2.  Import the project in Vercel.
3.  Select the `frontend` directory as the **Root Directory**.
4.  Vercel will auto-detect Vite and deploy it.

**Note**: Since the Backend runs locally, the deployed frontend will still connect to your `localhost:8001` server. This enables a "Cloud UI, Local Privacy" architecture.

### Backend
The backend utilizes `faster-whisper` and requires GPU/CPU resources and `ffmpeg`. It is **not recommended** to deploy this on serverless platforms like Vercel.
Keep running the backend locally for usage.

### 🌍 Connecting Vercel to Localhost

If you deploy the frontend to Vercel, it will run on **HTTPS**. Your local backend runs on **HTTP**. Browsers block this connection (Mixed Content Error).

**To make it work:**

1.  **Option A (Easiest)**: Run the frontend locally (`npm run dev`) at `http://localhost:5173`.
2.  **Option B (Advanced)**: Expose your local backend via HTTPS using **ngrok**:
    *   Install ngrok.
    *   Run `ngrok http 8001`.
    *   Copy the `https://...` URL.
    *   In Vercel Project Settings > Environment Variables, add: `VITE_API_URL` = `https://your-ngrok-url.ngrok-free.app`.

## 📄 License

MIT License - You are free to use, modify, and distribute this software.
