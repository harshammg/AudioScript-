from flask import Flask, render_template, send_file
from flask_socketio import SocketIO, emit
import numpy as np
import io
import wave
import whisper
import tempfile
import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import base64
import struct
from dotenv import load_dotenv
# import pydub
# from pydub import AudioSegment
# import ffmpeg  # commented out for now
import imageio_ffmpeg

# Load environment variables
load_dotenv()

# Set the path to ffmpeg for Whisper
os.environ["IMAGEIO_FFMPEG_EXE"] = imageio_ffmpeg.get_ffmpeg_exe()

# Global variable to store the complete transcription
full_transcription = ""

# Initialize Flask app and SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback-secret-key-for-development')
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

# Global variable to hold the Whisper model (loaded once at startup)
whisper_model = None

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

def load_whisper_model():
    """Load the Whisper model only once at startup"""
    global whisper_model
    print("Loading Whisper model...")
    # Load the 'base' model as specified in the requirements
    whisper_model = whisper.load_model("base")
    print("Whisper model loaded successfully!")

def audio_to_wav_buffer(audio_data):
    """
    Convert audio buffer to WAV format in memory
    """
    # Create an in-memory buffer for the WAV file
    wav_buffer = io.BytesIO()
    
    # Calculate duration based on sample rate (assuming 16kHz)
    sample_rate = 16000
    
    # Create WAV file in memory
    with wave.open(wav_buffer, 'wb') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes per sample (16-bit)
        wav_file.setframerate(sample_rate)
        
        # Convert float32 audio data to 16-bit integers
        if audio_data.dtype == np.float32:
            # Clamp values to [-1, 1] range
            audio_data = np.clip(audio_data, -1.0, 1.0)
            # Convert to 16-bit integers
            audio_data = (audio_data * 32767).astype(np.int16)
        
        # Write audio frames
        wav_file.writeframes(audio_data.tobytes())
    
    # Reset buffer position to beginning
    wav_buffer.seek(0)
    return wav_buffer

@socketio.on('audio')
def handle_audio(audio_chunk):
    """
    Handle incoming audio chunks from the frontend
    """
    global full_transcription
    global whisper_model
    
    print(f"Received audio chunk, type: {type(audio_chunk)}, size: {len(audio_chunk) if hasattr(audio_chunk, '__len__') else 'unknown'}")
    
    try:
        # Check if audio chunk is empty
        if not audio_chunk:
            print("Received empty audio chunk, skipping...")
            return
        
        # Handle audio data based on type
        if isinstance(audio_chunk, str):
            # If it's a base64 string, decode it
            print("Processing audio as base64 string")
            audio_bytes = base64.b64decode(audio_chunk)
        elif isinstance(audio_chunk, bytes):
            # If it's already bytes, use directly
            print("Processing audio as bytes")
            audio_bytes = audio_chunk
        else:
            # If it's ArrayBuffer from JavaScript, convert to bytes
            print(f"Processing audio as {type(audio_chunk)}")
            audio_bytes = bytes(audio_chunk)

        # Save the audio data to a temporary file
        # The frontend sends audio in webm format
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_input:
            temp_input.write(audio_bytes)
            temp_input_path = temp_input.name
            print(f"Saved audio to temporary file: {temp_input_path}")
        
        try:
            # Process audio with Whisper model directly with the webm file
            if whisper_model is None:
                print("Error: Whisper model not loaded!")
                return
            
            print(f"Attempting to transcribe file: {temp_input_path}")
            
            # Try to transcribe the audio - Whisper should handle webm files
            # If this fails due to missing ffmpeg, we'll catch the error
            try:
                result = whisper_model.transcribe(temp_input_path)
                new_text = result['text']
                
                print(f"Whisper transcription successful: {new_text}")
                
                # Add the new transcription to the global transcription
                if full_transcription:
                    full_transcription = full_transcription + " " + new_text
                else:
                    full_transcription = new_text
                
                # Emit the transcribed text back to the frontend
                emit('text', {'transcript': full_transcription})
                
                print(f"Emitted transcription to frontend: {new_text}")
            
            except Exception as transcribe_error:
                print(f"Transcription error: {transcribe_error}")
                # Fallback: emit error message to frontend
                emit('text', {'error': f"Transcription failed: {str(transcribe_error)}"})
                
        finally:
            # Clean up temporary file
            if os.path.exists(temp_input_path):
                os.remove(temp_input_path)
                print(f"Removed temporary file: {temp_input_path}")
                
    except Exception as e:
        print(f"Error processing audio: {str(e)}")
        import traceback
        traceback.print_exc()  # Print full traceback for debugging
        # Emit error message to frontend
        emit('text', {'error': str(e)})

@app.route('/download')
def download_pdf():
    """
    Generate and return a PDF of the current transcription
    """
    global full_transcription
    
    # Create a PDF in memory
    pdf_buffer = io.BytesIO()
    
    # Create PDF document
    doc = SimpleDocTemplate(pdf_buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Add title
    title = Paragraph("Speech to Text Transcription", styles['Title'])
    story.append(title)
    
    # Add timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    timestamp_para = Paragraph(f"Transcription Date/Time: {timestamp}", styles['Normal'])
    story.append(timestamp_para)
    story.append(Spacer(1, 12))
    
    # Add transcription text
    if full_transcription.strip():
        transcript_para = Paragraph(full_transcription.replace('\n', '<br/>'), styles['Normal'])
        story.append(transcript_para)
    else:
        no_text = Paragraph("No transcription available yet.", styles['Normal'])
        story.append(no_text)
    
    # Build the PDF
    doc.build(story)
    
    # Move buffer position to the beginning
    pdf_buffer.seek(0)
    
    # Return the PDF as a downloadable file
    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name=f"transcription_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
        mimetype='application/pdf'
    )

if __name__ == '__main__':
    # Load the Whisper model before starting the server
    load_whisper_model()
    
    # Run the Flask-SocketIO server
    host = os.getenv('HOST', 'localhost')
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'true').lower() == 'true'
    
    print(f"Starting server on http://{host}:{port}")
    socketio.run(app, host=host, port=port, debug=debug)