import { useState, useRef, useEffect } from 'react';
import { Upload, FileAudio, Loader2, Play, Pause, AlertCircle, X, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FileUploadProps {
    onTranscriptionComplete: (text: string, segments: any[]) => void;
    externalFile?: File | null;
}

const FileUpload = ({ onTranscriptionComplete, externalFile }: FileUploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Effect to handle external file (recording)
    useEffect(() => {
        if (externalFile) {
            handleFileSelect(externalFile);
        }
    }, [externalFile]);

    const [error, setError] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (selectedFile: File) => {
        // Basic validation
        if (!selectedFile.type.startsWith('audio/') && !selectedFile.type.startsWith('video/')) {
            setError("Please upload an audio or video file.");
            return;
        }

        setError(null);
        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setAudioUrl(url);
        setIsPlaying(false);
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the container's onClick
        setFile(null);
        setAudioUrl(null);
        setIsPlaying(false);
        setIsComplete(false);
        setError(null);
        // Reset file input value so same file can be selected again if needed
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleTranscribe = async () => {
        if (!file) return;

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Use configured API URL or default to localhost:8001
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
            const response = await fetch(`${API_URL}/transcribe`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Transcription failed');
            }

            const data = await response.json();

            // Combine segments into full text
            const fullText = data.segments.map((s: any) => s.text).join(' ');
            onTranscriptionComplete(fullText, data.segments);
            setIsComplete(true);

        } catch (err: any) {
            console.error("Transcription error:", err);
            let errorMessage = err.message || 'An error occurred during transcription';

            if (errorMessage.includes('Failed to fetch')) {
                errorMessage = "Connection Failed. Only 'localhost' or HTTPS backends are supported by browsers. If you are on Vercel, you cannot connect to HTTP localhost.";
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="p-6 w-full animate-fade-in-up">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Upload Audio File</h3>

                <div
                    className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
            ${file ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}
          `}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput')?.click()}
                >
                    <input
                        id="fileInput"
                        type="file"
                        accept="audio/*,video/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    />

                    {file ? (
                        <div className="flex flex-col items-center relative w-full">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive z-10"
                                onClick={clearFile}
                            >
                                <X className="h-4 w-4" />
                            </Button>

                            {/* Download Original File Button */}
                            {audioUrl && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-8 -right-2 h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary z-10"
                                    title="Download Audio"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const link = document.createElement('a');
                                        link.href = audioUrl;
                                        link.download = file.name;
                                        link.click();
                                    }}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            )}

                            <FileAudio className="w-12 h-12 text-primary mb-2" />
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground mb-4">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>

                            {audioUrl && (
                                <div className="flex items-center gap-2 bg-background/50 rounded-full px-4 py-2 border">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                    >
                                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    </Button>
                                    <span className="text-xs font-mono">Preview</span>
                                    <audio
                                        ref={audioRef}
                                        src={audioUrl}
                                        onEnded={() => setIsPlaying(false)}
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-muted-foreground">
                            <Upload className="w-12 h-12 mb-2" />
                            <p>Drag & drop or click to upload</p>
                            <p className="text-sm opacity-70">MP3, WAV, M4A</p>
                        </div>
                    )}
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Button
                    className="w-full"
                    onClick={isComplete ? clearFile : handleTranscribe}
                    disabled={(!file && !isComplete) || isLoading}
                    variant={isComplete ? "outline" : "default"}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Transcribing File...
                        </>
                    ) : isComplete ? (
                        "Transcribe Another File"
                    ) : (
                        "Transcribe File"
                    )}
                </Button>
            </div>
        </Card>
    );
};

export default FileUpload;
