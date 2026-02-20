// Chat Memory Storage - Vercel-compatible using localStorage on client side

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  citations?: { document: string; page: number }[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "legal_oracle_chat_history";
const MAX_SESSIONS = 50; // Maximum number of sessions to store
const MAX_MESSAGES_PER_SESSION = 100; // Maximum messages per session

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get all chat sessions from localStorage
export function getChatSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const sessions = JSON.parse(stored) as ChatSession[];
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt); // Most recent first
  } catch {
    return [];
  }
}

// Get a specific chat session
export function getChatSession(sessionId: string): ChatSession | null {
  const sessions = getChatSessions();
  return sessions.find(s => s.id === sessionId) || null;
}

// Create a new chat session
export function createChatSession(title?: string): ChatSession {
  const sessions = getChatSessions();
  
  const newSession: ChatSession = {
    id: generateId(),
    title: title || `Chat ${sessions.length + 1}`,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  // Add to beginning of array
  sessions.unshift(newSession);
  
  // Limit number of sessions
  const trimmedSessions = sessions.slice(0, MAX_SESSIONS);
  
  saveSessions(trimmedSessions);
  
  return newSession;
}

// Add a message to a session
export function addMessageToSession(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  citations?: { document: string; page: number }[]
): ChatMessage | null {
  const sessions = getChatSessions();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);
  
  if (sessionIndex === -1) return null;
  
  const message: ChatMessage = {
    id: generateId(),
    role,
    content,
    timestamp: Date.now(),
    citations,
  };
  
  // Add message to session
  sessions[sessionIndex].messages.push(message);
  
  // Limit messages per session
  if (sessions[sessionIndex].messages.length > MAX_MESSAGES_PER_SESSION) {
    sessions[sessionIndex].messages = sessions[sessionIndex].messages.slice(-MAX_MESSAGES_PER_SESSION);
  }
  
  // Update timestamp
  sessions[sessionIndex].updatedAt = Date.now();
  
  // Update title based on first user message
  if (role === "user" && sessions[sessionIndex].messages.filter(m => m.role === "user").length === 1) {
    sessions[sessionIndex].title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
  }
  
  // Move to front (most recent)
  const session = sessions.splice(sessionIndex, 1)[0];
  sessions.unshift(session);
  
  saveSessions(sessions);
  
  return message;
}

// Delete a chat session
export function deleteChatSession(sessionId: string): boolean {
  const sessions = getChatSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  
  if (filtered.length === sessions.length) return false;
  
  saveSessions(filtered);
  return true;
}

// Clear all chat history
export function clearAllChatHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// Update session title
export function updateSessionTitle(sessionId: string, title: string): boolean {
  const sessions = getChatSessions();
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) return false;
  
  session.title = title;
  session.updatedAt = Date.now();
  
  saveSessions(sessions);
  return true;
}

// Save sessions to localStorage
function saveSessions(sessions: ChatSession[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to save chat sessions:", error);
    // If storage is full, remove oldest sessions
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      const trimmed = sessions.slice(0, Math.floor(sessions.length / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
  }
}

// Export chat history as JSON
export function exportChatHistory(): string {
  const sessions = getChatSessions();
  return JSON.stringify(sessions, null, 2);
}

// Import chat history from JSON
export function importChatHistory(jsonData: string): boolean {
  try {
    const sessions = JSON.parse(jsonData) as ChatSession[];
    
    if (!Array.isArray(sessions)) return false;
    
    // Validate structure
    for (const session of sessions) {
      if (!session.id || !session.messages || !Array.isArray(session.messages)) {
        return false;
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return true;
  } catch {
    return false;
  }
}