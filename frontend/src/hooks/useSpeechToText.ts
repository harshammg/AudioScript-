import { useState, useRef, useCallback } from "react";

interface Segment {
  start: number;
  end: number;
  text: string;
}

export const useSpeechToText = (onRecorderStop?: (blob: Blob) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Processing state
  const [transcription, setTranscription] = useState("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      if (isListening) return;

      setIsStarting(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100, // Standard quality
        },
      });

      mediaStreamRef.current = stream;
      audioChunksRef.current = []; // Reset chunks

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Recording stopped
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        if (onRecorderStop) {
          onRecorderStop(audioBlob);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setIsListening(true);
      setIsStarting(false);

    } catch (err: any) {
      console.error("Error starting recording:", err);
      // Handle specific error types
      if (err.name === "NotAllowedError") {
        setError("Microphone permission denied. Please allow microphone access.");
      } else if (err.name === "NotFoundError") {
        setError("No microphone found.");
      } else {
        setError("Microphone error: " + (err.message || "Unknown error"));
      }
      setIsStarting(false);
    }
  }, [isListening, onRecorderStop]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop(); // This triggers onstop above
    }

    // Cleanup stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    setIsListening(false);
  }, []);

  const clearTranscription = useCallback(() => {
    setTranscription("");
    setSegments([]);
    setError(null);
  }, []);

  const downloadAsPdf = useCallback(async () => {
    if (!transcription) return;
    try {
      const response = await fetch("http://localhost:8001/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcription }),
      });
      if (!response.ok) throw new Error("Failed to download PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "transcription.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download PDF");
    }
  }, [transcription]);

  const dismissError = useCallback(() => setError(null), []);

  return {
    isListening,
    isStarting,
    isLoading, // Export loading state
    transcription,
    segments,
    error,
    startListening,
    stopListening,
    clearTranscription,
    downloadAsPdf,
    dismissError,
    setTranscription,
    setSegments,
  };
};
