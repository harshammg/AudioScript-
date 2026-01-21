import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingMicrophoneProps {
    isListening: boolean;
    isStarting: boolean;
    isLoading?: boolean;
    onToggleListening: () => void;
}

const FloatingMicrophone = ({ isListening, isStarting, isLoading, onToggleListening }: FloatingMicrophoneProps) => {
    return (
        <div className="fixed bottom-8 right-8 z-50">
            <Button
                size="icon"
                className={`
                    h-16 w-16 rounded-full shadow-2xl transition-all duration-300
                    ${isListening
                        ? 'bg-destructive hover:bg-destructive/90 animate-pulse'
                        : isLoading
                            ? 'bg-muted-foreground cursor-wait'
                            : 'bg-primary hover:bg-primary/90 hover:scale-105'
                    }
                `}
                onClick={onToggleListening}
                disabled={isStarting || isLoading}
            >
                {isStarting || isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
                ) : isListening ? (
                    <MicOff className="h-8 w-8 text-destructive-foreground" />
                ) : (
                    <Mic className="h-8 w-8 text-primary-foreground" />
                )}
            </Button>
            {isListening && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-border animate-in fade-in slide-in-from-bottom-2">
                    Recording...
                </span>
            )}
            {isLoading && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-border animate-in fade-in slide-in-from-bottom-2">
                    Processing...
                </span>
            )}
        </div>
    );
};

export default FloatingMicrophone;
