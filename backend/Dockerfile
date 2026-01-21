# Use Python 3.10
FROM python:3.10-slim

# Install system dependencies (FFmpeg is required for Whisper)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first (for caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Create a non-root user for security (optional but good practice)
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Expose the port (Render/Railway/Fly.io will map this)
EXPOSE 8000

# Command to run the application
# Use the PORT environment variable if available, otherwise 8000
CMD uvicorn main:socket_app --host 0.0.0.0 --port ${PORT:-8000}
