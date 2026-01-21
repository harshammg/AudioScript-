from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from pydantic import BaseModel
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import socketio
import uuid
import os
import shutil
import tempfile
import asyncio
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from io import BytesIO

from transcriber import transcriber_service

# Initialize FastAPI
app = FastAPI(title="Local Audio Transcriber")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Socket.IO
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, app)

# Store transcriptions per session
# Format: {sid: "accumulated text"}
sessions = {}

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Transcriber Socket.IO API is running"}

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")
    sessions[sid] = {"text": "", "segments": [], "offset": 0.0}

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    if sid in sessions:
        del sessions[sid]

@sio.on("audio")
async def handle_audio(sid, data):
    """
    Handle incoming audio chunks (bytes) from frontend.
    Write to temp file -> Transcribe -> Emit text.
    """
    if not data:
        return

    try:
        # Create a temp file for this chunk
        # Frontend sends webm/opus usually, faster-whisper handles it via ffmpeg
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            tmp.write(data)
            tmp_path = tmp.name

        # Transcribe
        # Note: This is blocking. In a high-scale app, we'd offload this.
        # For local single-user, direct call is fine or use run_in_executor.
        
        # We use a helper in transcriber_service to just return text
        # Transcribe
        segments_gen, info = transcriber_service.transcribe_raw(tmp_path)
        
        # Convert generator to list to access properties
        segments = list(segments_gen)
        
        current_offset = sessions[sid]["offset"]
        new_segments = []
        new_text_chunk = ""

        for segment in segments:
            # Adjust timestamps
            adjusted_start = segment.start + current_offset
            adjusted_end = segment.end + current_offset
            
            seg_data = {
                "start": adjusted_start,
                "end": adjusted_end,
                "text": segment.text
            }
            new_segments.append(seg_data)
            new_text_chunk += segment.text + " "
            
        new_text_chunk = new_text_chunk.strip()

        # Update session state
        sessions[sid]["segments"].extend(new_segments)
        sessions[sid]["offset"] += info.duration
        
        if new_text_chunk:
            # Append text
            current_text = sessions[sid]["text"]
            if current_text and not new_text_chunk.startswith(('.', ',', '!', '?')):
                 sessions[sid]["text"] += " " + new_text_chunk
            else:
                 sessions[sid]["text"] += new_text_chunk
            
            print(f"Transcribed: {new_text_chunk}")
            
            # Emit back to client with both text and segments for this chunk
            # (Frontend needs to be updated to handle object, or we send formatted object)
            # To maintain backward compat for a second, let's keep 'text' event as string 
            # and add a new event 'transcript_update'? 
            # OR just update 'text' to return an object.
            # Let's emit an object.
            await sio.emit("text", {
                "text": new_text_chunk, 
                "segments": new_segments
            }, room=sid)

    except Exception as e:
        print(f"Error processing audio: {e}")
        await sio.emit("connect_error", {"message": str(e)}, room=sid)

@app.get("/download")
async def download_pdf():
    """
    Generate PDF of the transcription (simplification: returns last active session or global?)
    The frontend calls GET /download. It doesn't seem to pass session ID in headers easily unless cookie.
    
    For a simplified single-user local app, we can just take the most recent session's text 
    or the longest text in sessions.
    """
    if not sessions:
         return HTTPException(status_code=400, detail="No active transcription found")
    
    # Get the longest text (heuristic for the active user)
    # Get the session with the longest text
    if not sessions:
        return HTTPException(status_code=400, detail="No active transcription found")
        
    # Find active session with most text
    session_data = max(sessions.values(), key=lambda s: len(s["text"]), default={"text": ""})
    text = session_data["text"]
    
    if not text:
        text = "No transcription content."

    # Generate PDF in memory
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, height - 72, "Transcription Report")
    
    c.setFont("Helvetica", 10)
    c.drawString(72, height - 90, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    c.setFont("Helvetica", 12)
    text_object = c.beginText(72, height - 120)
    
    # Simple word wrap
    margin = 72
    page_width = width - 2 * margin
    
    # Split text roughly
    words = text.split()
    line = []
    for word in words:
        line.append(word)
        if c.stringWidth(" ".join(line), "Helvetica", 12) > page_width:
             line.pop()
             text_object.textLine(" ".join(line))
             line = [word]
    if line:
        text_object.textLine(" ".join(line))
        
    c.drawText(text_object)
    c.showPage()
    c.save()
    
    buffer.seek(0)
    
    # Save to a temp file to serve (FileResponse needs a path usually, or use StreamingResponse)
    # Using temp file for simplicity with FileResponse
    pdf_path = os.path.join(tempfile.gettempdir(), f"transcription_{uuid.uuid4()}.pdf")
    with open(pdf_path, "wb") as f:
        f.write(buffer.read())

    return FileResponse(pdf_path, filename="transcription.pdf", media_type="application/pdf")
class PDFRequest(BaseModel):
    text: str

@app.post("/generate-pdf")
async def generate_pdf(request: PDFRequest):
    """
    Generate PDF from provided text.
    Attributes:
        request (PDFRequest): JSON body containing 'text' field.
    """
    text = request.text
    if not text:
        text = "No transcription content."

    # Generate PDF in memory
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, height - 72, "Transcription Report")
    
    c.setFont("Helvetica", 10)
    c.drawString(72, height - 90, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    c.setFont("Helvetica", 12)
    text_object = c.beginText(72, height - 120)
    
    # Simple word wrap
    margin = 72
    page_width = width - 2 * margin
    
    # Split text roughly
    words = text.split()
    line = []
    for word in words:
        line.append(word)
        if c.stringWidth(" ".join(line), "Helvetica", 12) > page_width:
             line.pop()
             text_object.textLine(" ".join(line))
             line = [word]
    if line:
        text_object.textLine(" ".join(line))
        
    c.drawText(text_object)
    c.showPage()
    c.save()
    
    buffer.seek(0)
    
    # Save to a temp file
    pdf_path = os.path.join(tempfile.gettempdir(), f"transcription_{uuid.uuid4()}.pdf")
    with open(pdf_path, "wb") as f:
        f.write(buffer.read())

    return FileResponse(pdf_path, filename="transcription.pdf", media_type="application/pdf")

@app.post("/transcribe")
async def transcribe_file(file: UploadFile = File(...)):
    """
    Handle file uploads for full transcription.
    """
    try:
        # Create unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        temp_file_path = os.path.join(tempfile.gettempdir(), unique_filename)
        
        # Save uploaded file
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        print(f"Transcribing uploaded file: {temp_file_path}")

        # Use the full transcribe method (with timestamps if needed, or just text)
        # Using transcribe_raw for consistency with main thread, or the full one:
        # Let's use the full one to get better results for files
        result = transcriber_service.transcribe(temp_file_path)
        
        # Cleanup
        os.remove(temp_file_path)
        
        return result

    except Exception as e:
        print(f"Error processing file upload: {e}")
        return HTTPException(status_code=500, detail=str(e))
