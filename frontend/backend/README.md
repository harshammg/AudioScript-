# Speech-to-Text Backend

A real-time speech-to-text system using OpenAI Whisper for local transcription and PDF generation.

## Features

- Real-time speech transcription using Whisper
- Live text streaming to frontend via Socket.IO
- PDF generation from transcribed text
- No external APIs required (uses local Whisper model)

## Requirements

- Python 3.8+
- Whisper model (automatically downloaded)

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

3. Access the application at `http://localhost:5000`

## How It Works

1. The frontend captures audio from the user's microphone
2. Audio chunks are sent to the backend via Socket.IO
3. The backend processes audio with Whisper and returns transcriptions
4. Transcriptions are accumulated and displayed in real-time
5. Users can download the full transcription as a PDF

## Endpoints

- `GET /` - Serves the main application page
- `POST /audio` - Receives audio chunks for transcription (via Socket.IO)
- `GET /download` - Generates and returns a PDF of the transcription

## Architecture

- Flask backend with Flask-SocketIO for real-time communication
- Whisper model (base) for local speech recognition
- ReportLab for PDF generation
- Frontend connects to backend via WebSocket