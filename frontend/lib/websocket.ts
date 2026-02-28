import { ServerResponse } from "./types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/voice";

export class SahajWebSocket {
  private ws: WebSocket | null = null;
  private onMessage: (data: ServerResponse) => void;
  private onConnect: () => void;
  private onDisconnect: () => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(callbacks: {
    onMessage: (data: ServerResponse) => void;
    onConnect: () => void;
    onDisconnect: () => void;
  }) {
    this.onMessage = callbacks.onMessage;
    this.onConnect = callbacks.onConnect;
    this.onDisconnect = callbacks.onDisconnect;
  }

  connect(userId?: string, language: string = "hi-IN") {
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.onConnect();
      // Send init message
      this.ws?.send(JSON.stringify({
        user_id: userId || null,
        language,
      }));
    };

    this.ws.onmessage = (event) => {
      try {
        const data: ServerResponse = JSON.parse(event.data);
        this.onMessage(data);
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    this.ws.onclose = () => {
      this.onDisconnect();
      this.attemptReconnect(userId, language);
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  private attemptReconnect(userId?: string, language: string = "hi-IN") {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(userId, language), 2000 * this.reconnectAttempts);
    }
  }

  sendAudio(audioBlob: Blob) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      audioBlob.arrayBuffer().then((buffer) => {
        this.ws?.send(buffer);
      });
    }
  }

  sendText(text: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "text_message",
        text,
      }));
    }
  }

  changeState(state: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: "change_state",
        state,
      }));
    }
  }

  disconnect() {
    this.maxReconnectAttempts = 0; // Prevent reconnect
    this.ws?.close();
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
