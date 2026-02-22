"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Scale, Loader2, FileText, AlertCircle, Trash2, MessageSquare, Menu, X } from "lucide-react";
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
  quickPrompt?: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ processedFiles, quickPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
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

  // Handle quick prompt from parent
  useEffect(() => {
    if (quickPrompt && processedFiles.length > 0) {
      setInput(quickPrompt);
    }
  }, [quickPrompt, processedFiles.length]);

  const handleNewChat = () => {
    const newSession = createChatSession("New Chat");
    setCurrentSession(newSession);
    setMessages([]);
    setSessions(prev => [newSession, ...prev]);
    setShowSidebar(false);
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSession(session);
    setMessages(session.messages);
    setShowSidebar(false);
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
      // Prepare file context - extract content from base64 data URLs
      const fileContexts = processedFiles.map(f => {
        let content = f.content || "";
        // If it's a data URL, we need to extract the base64 content
        // For PDFs, we'll send the full data URL so the API can process it
        return {
          name: f.name,
          content: content,
          type: f.type
        };
      });

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response. Please try again.");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to read response stream");
      }

      let assistantMessage = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;
        
        // Update the last assistant message or add a new one
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            return [...prev.slice(0, -1), { ...lastMsg, content: assistantMessage }];
          }
          return [...prev, {
            id: Date.now().toString(),
            role: "assistant" as const,
            content: assistantMessage,
            timestamp: Date.now()
          }];
        });
      }

      // Save the final message to session
      if (currentSession && assistantMessage) {
        addMessageToSession(currentSession.id, "assistant", assistantMessage);
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
    <div className="flex h-full relative">
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Chat Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        w-72 bg-surface/30 border-r border-border flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <button
            onClick={handleNewChat}
            className="flex-1 py-2.5 bg-gradient-to-r from-gold to-gold-light text-navy-dark font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/20 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} />
            New Chat
          </button>
          <button
            onClick={() => setShowSidebar(false)}
            className="lg:hidden ml-2 p-2 hover:bg-surface rounded-lg"
          >
            <X size={20} className="text-muted" />
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-4 lg:px-6 py-4 border-b border-border bg-surface/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-surface rounded-lg transition-colors"
            >
              <Menu size={20} className="text-gold lg:hidden" />
              <MessageSquare size={20} className="text-gold hidden lg:block" />
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
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gold mb-4" size={48} />
              <h3 className="text-xl font-bold text-gold mb-2">Start Chatting</h3>
              <p className="text-muted max-w-md mx-auto px-4">
                Ask any legal question or upload documents for analysis.
                I'm here to help with Nigerian law, contracts, and legal research.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] lg:max-w-[80%] p-4 rounded-2xl ${
                  message.role === "user"
                    ? "bg-gold text-navy-dark"
                    : "bg-surface/50 border border-border text-gold"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
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
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 lg:px-6 py-3 bg-error/10 border-t border-error/20">
            <div className="flex items-center gap-2 text-error">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto p-1 hover:bg-error/20 rounded"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-surface/20">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize textarea
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
              onKeyDown={(e) => {
                // Submit on Enter (without Shift)
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask a legal question or upload documents for analysis..."
              disabled={loading}
              rows={1}
              className="flex-1 min-w-0 px-4 py-3 bg-navy-dark border border-border rounded-xl text-gold placeholder-muted focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 disabled:opacity-50 resize-none overflow-y-auto"
              style={{ maxHeight: '200px' }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 lg:px-6 py-3 bg-gradient-to-r from-gold to-gold-light text-navy-dark font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center flex-shrink-0"
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