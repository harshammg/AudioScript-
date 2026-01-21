import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  isListening: boolean;
}

const StatusIndicator = ({ isListening }: StatusIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {/* Status Dot with pulse animation */}
      <div className="relative">
        <div
          className={cn(
            "w-3 h-3 rounded-full transition-colors duration-300",
            isListening ? "bg-primary" : "bg-muted-foreground/40"
          )}
        />
        {/* Pulse ring when listening */}
        {isListening && (
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-pulse-ring" />
        )}
      </div>
      
      {/* Status Text */}
      <span
        className={cn(
          "text-base font-medium transition-colors duration-300",
          isListening ? "text-primary" : "text-muted-foreground"
        )}
      >
        {isListening ? "Listening..." : "Not Listening"}
      </span>
    </div>
  );
};

export default StatusIndicator;
