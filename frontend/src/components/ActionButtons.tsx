import { Trash2, Download, FileText, FileCode, Clock, Copy, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionButtonsProps {
  onClear: () => void;
  onCopy: () => void;
  onDownloadText: () => void;
  onSpeak: () => void;
  onDownloadSRT?: () => void;
  onDownloadVTT?: () => void;
  onDownloadTimestamped?: () => void;
  hasText: boolean;
}

const ActionButtons = ({
  onClear,
  onCopy,
  onSpeak,
  onDownloadText,
  onDownloadSRT,
  onDownloadVTT,
  onDownloadTimestamped,
  hasText
}: ActionButtonsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      {/* Clear Text Button */}
      <Button
        variant="action"
        size="lg"
        onClick={onClear}
        disabled={!hasText}
        className="min-w-[140px]"
      >
        <Trash2 className="w-4 h-4" />
        Clear Text
      </Button>

      <Button
        variant="action"
        size="lg"
        onClick={onSpeak}
        disabled={!hasText}
        className="min-w-[140px]"
      >
        <Volume2 className="w-4 h-4" />
        Speak
      </Button>

      {/* Copy Text Button */}
      <Button
        variant="action"
        size="lg"
        onClick={onCopy}
        disabled={!hasText}
        className="min-w-[140px]"
      >
        <Copy className="w-4 h-4" />
        Copy Text
      </Button>

      {/* Download Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="action"
            size="lg"
            disabled={!hasText}
            className="min-w-[160px]"
          >
            <Download className="w-4 h-4" />
            Download options
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={onDownloadText}>
            <FileText className="mr-2 h-4 w-4" />
            Download as Text
          </DropdownMenuItem>

          {onDownloadSRT && (
            <DropdownMenuItem onClick={onDownloadSRT}>
              <FileCode className="mr-2 h-4 w-4" />
              Download as SRT (Captions)
            </DropdownMenuItem>
          )}
          {onDownloadVTT && (
            <DropdownMenuItem onClick={onDownloadVTT}>
              <FileCode className="mr-2 h-4 w-4" />
              Download as VTT (Web)
            </DropdownMenuItem>
          )}
          {onDownloadTimestamped && (
            <DropdownMenuItem onClick={onDownloadTimestamped}>
              <Clock className="mr-2 h-4 w-4" />
              Download w/ Timestamps
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ActionButtons;
