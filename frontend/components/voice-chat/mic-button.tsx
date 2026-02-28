import { AudioRecorder } from "@/lib/audio";
import { Mic, Square } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface MicButtonProps {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
}

export function MicButton({ onRecordingComplete, disabled }: MicButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<AudioRecorder>(new AudioRecorder());

  const toggleRecording = async () => {
    if (isRecording) {
      const blob = await recorderRef.current.stop();
      setIsRecording(false);
      onRecordingComplete(blob);
    } else {
      await recorderRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <Button
      onClick={toggleRecording}
      disabled={disabled && !isRecording}
      size="icon"
      className={`relative h-12 w-12 rounded-full shadow-lg shrink-0 transition-all ${
        isRecording
          ? "bg-red-500 hover:bg-red-600 animate-pulse"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {isRecording ? (
        <Square className="h-5 w-5 text-white fill-white" />
      ) : (
        <Mic className="h-5 w-5 text-white" />
      )}
      {isRecording && (
        <span className="absolute -inset-2 rounded-full border-2 border-red-500 animate-ping opacity-75" />
      )}
    </Button>
  );
}