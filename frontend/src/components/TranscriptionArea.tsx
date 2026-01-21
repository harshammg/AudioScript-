import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TranscriptionAreaProps {
  text: string;
  isListening: boolean;
  onTextChange?: (text: string) => void;
}

const TranscriptionArea = ({ text, isListening, onTextChange }: TranscriptionAreaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new text arrives
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);

  const hasText = text.trim().length > 0;

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">
          Transcription
        </h2>
        <span className="text-xs text-muted-foreground">Editable</span>
      </div>

      {/* Transcription Content */}
      <div className="relative flex-grow">
        <textarea
          ref={containerRef as any}
          className={cn(
            "w-full h-64 md:h-80 lg:h-96 p-6 resize-none bg-transparent outline-none text-lg md:text-xl leading-relaxed text-foreground animate-fade-in transition-colors duration-300 font-sans",
            isListening && "bg-primary/[0.02]"
          )}
          value={text}
          onChange={(e) => onTextChange && onTextChange(e.target.value)}
          placeholder=""
        />
      </div>

      {/* Visual indicator when listening */}
      {isListening && (
        <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 animate-pulse" />
      )}
    </div>
  );
};

export default TranscriptionArea;
