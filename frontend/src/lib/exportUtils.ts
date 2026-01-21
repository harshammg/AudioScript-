
export const formatTime = (seconds: number): string => {
    const date = new Date(0);
    date.setSeconds(seconds);
    const hh = date.getUTCHours().toString().padStart(2, '0');
    const mm = date.getUTCMinutes().toString().padStart(2, '0');
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
    return `${hh}:${mm}:${ss},${ms}`;
};

export const formatTimeVTT = (seconds: number): string => {
    return formatTime(seconds).replace(',', '.');
};

export const generateSRT = (segments: { start: number; end: number; text: string }[]): string => {
    return segments.map((seg, index) => {
        return `${index + 1}\n${formatTime(seg.start)} --> ${formatTime(seg.end)}\n${seg.text.trim()}\n`;
    }).join('\n');
};

export const generateVTT = (segments: { start: number; end: number; text: string }[]): string => {
    const content = segments.map((seg) => {
        return `${formatTimeVTT(seg.start)} --> ${formatTimeVTT(seg.end)}\n${seg.text.trim()}\n`;
    }).join('\n');
    return `WEBVTT\n\n${content}`;
};

export const generateTimestampedText = (segments: { start: number; end: number; text: string }[]): string => {
    return segments.map((seg) => {
        return `[${formatTime(seg.start).split(',')[0]} - ${formatTime(seg.end).split(',')[0]}] ${seg.text.trim()}`;
    }).join('\n');
};

export const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
