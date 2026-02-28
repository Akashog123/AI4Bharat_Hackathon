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

      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center gap-2">
          <MicButton onRecordingComplete={onSendAudio} disabled={!connected || isProcessing} />

          <form onSubmit={handleSendText} className="flex-1 flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Or type here..."
              disabled={!connected || isProcessing}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!inputText.trim() || !connected || isProcessing}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}