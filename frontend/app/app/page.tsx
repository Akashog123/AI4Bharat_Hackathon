"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SahajWebSocket } from "@/lib/websocket";
import { ChatPanel } from "@/components/voice-chat/chat-panel";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { ChatMessage, UserProfile, Course, Job, ServerResponse, ConversationState } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LANGUAGES = [
  { code: "hi-IN", label: "हिन्दी (Hindi)" },
  { code: "en-IN", label: "English" },
  { code: "bn-IN", label: "বাংলা (Bengali)" },
  { code: "ta-IN", label: "தமிழ் (Tamil)" },
  { code: "te-IN", label: "తెలుగు (Telugu)" },
  { code: "kn-IN", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml-IN", label: "മലയാളം (Malayalam)" },
  { code: "mr-IN", label: "मराठी (Marathi)" },
  { code: "gu-IN", label: "ગુજરાતી (Gujarati)" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "od-IN", label: "ଓଡ଼ିଆ (Odia)" },
];

export default function AppPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: null, education_level: null, education_stream: null,
    skills: [], work_experience: [], location_preference: null,
    job_type_preference: null, profile_complete: false,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [state, setState] = useState<ConversationState>("greeting");
  const [language, setLanguage] = useState("hi-IN");
  const [connected, setConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const wsRef = useRef<SahajWebSocket | null>(null);

  const handleServerMessage = useCallback((data: ServerResponse) => {
    setIsProcessing(false);

    if (data.type === "session_init") {
      setUserId(data.user_id || null);
      if (data.profile) setProfile(data.profile);
      if (data.state) setState(data.state as ConversationState);
      return;
    }

    if (data.type === "greeting" || data.type === "response") {
      if (data.transcript) {
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          role: "user",
          content: data.transcript!,
          timestamp: new Date().toISOString(),
        }]);
      }

      if (data.response_text) {
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.response_text!,
          audioUrl: data.response_audio || undefined,
          timestamp: new Date().toISOString(),
        }]);
      }

      if (data.profile_update) {
        setProfile((prev) => ({ ...prev, ...data.profile_update }));
      }

      if (data.state) setState(data.state as ConversationState);
      if (data.profile_complete) setProfile((prev) => ({ ...prev, profile_complete: true }));

      if (data.recommendations?.length) {
        if (data.state === "courses") {
          setCourses(data.recommendations as Course[]);
        } else if (data.state === "jobs") {
          setJobs(data.recommendations as Job[]);
        }
      }
    }

    if (data.type === "error") {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message || "Something went wrong. Please try again.",
        timestamp: new Date().toISOString(),
      }]);
    }
  }, []);

  useEffect(() => {
    const savedUserId = localStorage.getItem("sahaj_user_id");
    const ws = new SahajWebSocket({
      onMessage: handleServerMessage,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
    });
    ws.connect(savedUserId || undefined, language);
    wsRef.current = ws;

    return () => ws.disconnect();
  }, [language, handleServerMessage]);

  useEffect(() => {
    if (userId) localStorage.setItem("sahaj_user_id", userId);
  }, [userId]);

  const handleSendAudio = (audioBlob: Blob) => {
    setIsProcessing(true);
    wsRef.current?.sendAudio(audioBlob);
  };

  const handleSendText = (text: string) => {
    setIsProcessing(true);
    setMessages((prev) => [...prev, {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    }]);
    wsRef.current?.sendText(text);
  };

  const handleStateChange = (newState: string) => {
    wsRef.current?.changeState(newState);
    setState(newState as ConversationState);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="h-14 border-b bg-white px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-blue-900">सहज</span>
          <span className="text-xs text-gray-400">Voice Career Counselor</span>
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        </div>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat Panel */}
        <div className="w-2/5 border-r bg-white flex flex-col">
          <ChatPanel
            messages={messages}
            onSendAudio={handleSendAudio}
            onSendText={handleSendText}
            isProcessing={isProcessing}
            connected={connected}
          />
        </div>

        {/* Right: Dashboard */}
        <div className="w-3/5 bg-gray-50 overflow-auto">
          <DashboardPanel
            profile={profile}
            courses={courses}
            jobs={jobs}
            state={state}
            onStateChange={handleStateChange}
          />
        </div>
      </div>
    </div>
  );
}
