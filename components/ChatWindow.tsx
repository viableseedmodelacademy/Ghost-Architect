"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Scale, Loader2, FileText, AlertCircle, Trash2, MessageSquare } from "lucide-react";
import { createChatSession, addMessageToSession, getChatSessions, deleteChatSession, ChatSession, ChatMessage } from "../lib/chatMemory";

interface FileContext {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  content?: string;
}

interface ChatWindowProps {
  processedFiles: FileContext[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ processedFiles }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load sessions on mount
  useEffect(() => {
    const loadedSessions = getChatSessions();
    setSessions(loadedSessions);
    
    // Create new session if none exists
    if (loadedSessions.length === 0) {
      const newSession = createChatSession("New Chat");
      setCurrentSession(newSession);
      setSessions([newSession]);
    } else {
      setCurrentSession(loadedSessions[0]);
      setMessages(loadedSessions[0].messages);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = () => {
    const newSession = createChatSession("New Chat");
    setCurrentSession(newSession);
    setMessages([]);
    setSessions(prev => [newSession, ...prev]);
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSession(session);
    setMessages(session.messages);
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteChatSession(sessionId);
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    
    if (currentSession?.id === sessionId) {
      if (updatedSessions.length > 0) {
        setCurrentSession(updatedSessions[0]);
        setMessages(updatedSessions[0].messages);
      } else {
        handleNewChat();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;
    
    // Check if documents are uploaded
    if (processedFiles.length === 0) {
      setError("Please upload documents first to start chatting.");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setError(null);
    setLoading(true);

    // Add user message to state and storage
    const userMsg = currentSession 
      ? addMessageToSession(currentSession.id, "user", userMessage)
      : null;
    
    if (userMsg) {
      setMessages(prev => [...prev, userMsg]);
    }

    try {
      // Prepare file context
      const fileContexts = processedFiles.map(f => ({
        name: f.name,
        content: f.content || ""
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          files: fileContexts,
          mode: "cloud"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response. Please try again.");
      }

      const data = await response.json();
      
      // Add assistant message
      const assistantMsg = currentSession
        ? addMessageToSession(currentSession.id, "assistant", data.response)
        : null;
      
      if (assistantMsg) {
        setMessages(prev => [...prev, assistantMsg]);
      }

      // Update sessions list
      setSessions(getChatSessions());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Chat Sidebar */}
      {showSidebar && (
        <div className="w-64 bg-surface/30 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <button
              onClick={handleNewChat}
              className="w-full py-2.5 bg-gradient-to-r from-gold to-gold-light text-navy-dark font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/20 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <MessageSquare size={18} />
              New Chat
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`group p-3 rounded-xl mb-1 cursor-pointer transition-all duration-200 ${
                  currentSession?.id === session.id
                    ? "bg-gold/20 border border-gold/30"
                    : "hover:bg-surface/50"
                }`}
                onClick={() => handleSelectSession(session)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gold truncate flex-1">{session.title}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-error/20 rounded transition-all"
                  >
                    <Trash2 size={14} className="text-error" />
                  </button>
                </div>
                <p className="text-xs text-muted mt-1">
                  {session.messages.length} messages
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-surface/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-surface rounded-lg transition-colors"
            >
              <MessageSquare size={20} className="text-gold" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gold">Document Chat</h2>
              <p className="text-xs text-muted">
                {processedFiles.length} documents loaded
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gold mb-4" size={48} />
              <h3 className="text-xl font-bold text-gold mb-2">Start Chatting</h3>
              <p className="text-muted max-w-md mx-auto">
                Upload documents in the Private Vault and ask questions about them.
                The AI will analyze your documents and provide insights.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.role === "user"
                    ? "bg-gold text-navy-dark"
                    : "bg-surface/50 border border-border text-gold"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.role === "user" ? "text-navy-dark/60" : "text-muted"
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface/50 border border-border p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-gold">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Analyzing documents...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-3 bg-error/10 border-t border-error/20">
            <div className="flex items-center gap-2 text-error">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-surface/20">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={processedFiles.length === 0 
                ? "Upload documents first to start chatting..." 
                : "Ask a question about your documents..."
              }
              disabled={loading || processedFiles.length === 0}
              className="flex-1 px-4 py-3 bg-navy-dark border border-border rounded-xl text-gold placeholder-muted focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || processedFiles.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-gold to-gold-light text-navy-dark font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;