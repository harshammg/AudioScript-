import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import TranscriptionArea from "@/components/TranscriptionArea";
import ActionButtons from "@/components/ActionButtons";
import ErrorMessage from "@/components/ErrorMessage";
import FileUpload from "@/components/FileUpload";
import FloatingMicrophone from "@/components/FloatingMicrophone";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { generateSRT, generateVTT, generateTimestampedText, downloadFile } from "@/lib/exportUtils";

const Index = () => {
  const [recordedFile, setRecordedFile] = useState<File | null>(null);

  const handleRecordingStop = (blob: Blob) => {
    const file = new File([blob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
    setRecordedFile(file);
  };

  const {
    isListening,
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
    isStarting,
    isLoading,
  } = useSpeechToText(handleRecordingStop);

  const hasText = transcription.trim().length > 0;

  const handleDownloadSRT = () => {
    const content = generateSRT(segments);
    downloadFile(content, `transcription_${Date.now()}.srt`, 'text/plain');
  };

  const handleDownloadVTT = () => {
    const content = generateVTT(segments);
    downloadFile(content, `transcription_${Date.now()}.vtt`, 'text/vtt');
  };

  const handleDownloadTimestamped = () => {
    const content = generateTimestampedText(segments);
    downloadFile(content, `transcription_${Date.now()}.txt`, 'text/plain');
  };

  const handleDownloadText = () => {
    downloadFile(transcription, `transcription_${Date.now()}.txt`, 'text/plain');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription);
  };

  const handleSpeak = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    } else {
      const utterance = new SpeechSynthesisUtterance(transcription);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-6 md:py-10">
        {/* Header Section */}
        <Header />

        {/* Main Content */}
        <main className="space-y-6">
          {/* Error Message */}
          {error && (
            <ErrorMessage message={error} onDismiss={dismissError} />
          )}



          {/* File Upload Section */}
          <FileUpload
            externalFile={recordedFile}
            onTranscriptionComplete={(text, newSegments) => {
              setTranscription((prev) => prev ? prev + " " + text : text);
              if (newSegments) {
                setSegments((prev) => [...prev, ...newSegments]);
              }
            }} />

          {/* Live Transcription Area (Editable) */}
          <TranscriptionArea
            text={transcription}
            isListening={isListening}
            onTextChange={setTranscription}
          />

          {/* Action Buttons */}
          <ActionButtons
            onClear={() => {
              window.speechSynthesis.cancel();
              clearTranscription();
            }}
            onCopy={handleCopy}
            onSpeak={handleSpeak}
            onDownloadText={handleDownloadText}
            onDownloadSRT={handleDownloadSRT}
            onDownloadVTT={handleDownloadVTT}
            onDownloadTimestamped={handleDownloadTimestamped}
            hasText={hasText}
          />
        </main>


        {/* Footer */}
        {/* Footer */}
        <Footer />

        {/* Floating Microphone Button */}
        <FloatingMicrophone
          isListening={isListening}
          isStarting={isStarting}
          isLoading={isLoading}
          onToggleListening={isListening ? stopListening : startListening}
        />
      </div>
    </div>
  );
};

export default Index;
