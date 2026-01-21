from faster_whisper import WhisperModel
import os

# Use 'tiny' model for Cloud Free Tier (Render/Railway) to prevent timeouts/OOM.
MODEL_SIZE = "tiny"
# Run on CPU with INT8 by default to be safe for most local machines.
DEVICE = "cpu" 
COMPUTE_TYPE = "int8"

class Transcriber:
    def __init__(self):
        print(f"Loading Whisper model: {MODEL_SIZE} on {DEVICE}...")
        self.model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)
        print("Model loaded successfully.")

    def transcribe(self, audio_path: str):
        """Original method for full file transcription (with timestamps)"""
        segments, info = self.model.transcribe(audio_path, beam_size=5)
        
        result = []
        for segment in segments:
            result.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text
            })
        
        return {
            "language": info.language,
            "language_probability": info.language_probability,
            "segments": result
        }

    def transcribe_raw(self, audio_path: str):
        """Simplified transcription for streaming chunks (just returns segments generator)"""
        # We can disable some features for speed
        segments, info = self.model.transcribe(
            audio_path, 
            beam_size=5, # Better accuracy
            language="en", 
            vad_filter=False # Disable VAD to capture all speech in chunks
        )
        return segments, info

# Singleton instance to be reused
transcriber_service = Transcriber()
