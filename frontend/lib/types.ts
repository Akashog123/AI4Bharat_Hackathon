export interface UserProfile {
  name: string | null;
  education_level: string | null;
  education_stream: string | null;
  skills: string[];
  work_experience: { type: string; domain: string; years: number }[];
  location_preference: string | null;
  job_type_preference: string | null;
  profile_complete: boolean;
}

export interface Course {
  title: string;
  provider: string;
  duration: string;
  cost: number;
  url: string;
  reason: string;
}

export interface Job {
  title: string;
  company: string;
  salary: string;
  location: string;
  job_type: string;
  reason: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  timestamp: string;
}

export interface ServerResponse {
  type: "greeting" | "response" | "session_init" | "state_changed" | "error";
  transcript?: string;
  response_text?: string;
  response_audio?: string; // base64
  profile_update?: Partial<UserProfile>;
  recommendations?: (Course | Job)[];
  state?: string;
  user_id?: string;
  session_id?: string;
  profile?: UserProfile;
  discovery_step?: number;
  profile_complete?: boolean;
  message?: string;
}

export type ConversationState = "greeting" | "discovery" | "profile_complete" | "courses" | "jobs" | "interview" | "resume" | "resume_ready";