import { ChatMessage } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { playAudioBase64 } from "@/lib/audio";
import { PlayCircle } from "lucide-react";
import { useState, useEffect } from "react";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (message.audioUrl && !isUser) {
      handlePlayAudio();
    }
  }, [message.audioUrl]);

  const handlePlayAudio = async () => {
    if (message.audioUrl && !isPlaying) {
      setIsPlaying(true);
      try {
        await playAudioBase64(message.audioUrl);
      } catch (e) {
        console.error("Failed to play audio:", e);
      } finally {
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : ""}`}>
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src={isUser ? undefined : "/bot-avatar.png"} />
        <AvatarFallback>{isUser ? "U" : "S"}</AvatarFallback>
      </Avatar>

      <div
        className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-gray-100 text-gray-800 rounded-tl-sm border"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {message.audioUrl && !isUser && (
          <button
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className={`mt-2 flex items-center gap-1.5 text-xs font-medium transition-colors ${
              isPlaying ? "text-blue-500 animate-pulse" : "text-gray-500 hover:text-blue-600"
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            {isPlaying ? "Playing..." : "Play Audio"}
          </button>
        )}
      </div>
    </div>
  );
}