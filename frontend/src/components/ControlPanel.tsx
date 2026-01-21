import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusIndicator from "./StatusIndicator";

interface ControlPanelProps {
  isListening: boolean;
  isStarting?: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
}

const ControlPanel = ({
  isListening,
  isStarting = false,
  onStartListening,
  onStopListening,
}: ControlPanelProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
      {/* Status Indicator */}
      <StatusIndicator isListening={isListening} />

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        {/* Start Listening Button */}
        <Button
          variant="listen"
          size="xl"
          className="flex-1"
          onClick={onStartListening}
          disabled={isListening || isStarting}
        >
          {isStarting ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Starting...
            </span>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Start Listening
            </>
          )}
        </Button>

        {/* Stop Listening Button */}
        <Button
          variant="stop"
          size="xl"
          className="flex-1"
          onClick={onStopListening}
          disabled={!isListening}
        >
          <MicOff className="w-5 h-5" />
          Stop Listening
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel;
