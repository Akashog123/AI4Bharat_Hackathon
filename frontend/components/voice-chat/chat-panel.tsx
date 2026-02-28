import { ChatMessage } from "@/lib/types";
import { MicButton } from "./mic-button";
import { MessageBubble } from "./message-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendAudio: (blob: Blob) => void;
  onSendText: (text: string) => void;
  isProcessing: boolean;
  connected: boolean;
}

export function ChatPanel({ messages, onSendAudio, onSendText, isProcessing, connected }: ChatPanelProps) {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isProcessing]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && connected) {
      onSendText(inputText.trim());
      setInputText("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg w-fit">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75" />
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150" />
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-slate-100">
        <div className="flex items-center gap-3">
          <MicButton onRecordingComplete={onSendAudio} disabled={!connected || isProcessing} />

          <form onSubmit={handleSendText} className="flex-1 flex gap-2 relative">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              disabled={!connected || isProcessing}
              className="flex-1 rounded-full bg-slate-100 border-transparent focus-visible:ring-blue-500 focus-visible:bg-white pl-4 pr-12 h-12 shadow-inner"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputText.trim() || !connected || isProcessing}
              className="absolute right-1 top-1 h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 shadow-md"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}