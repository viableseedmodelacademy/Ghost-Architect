"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquarePlus, Send, CornerDownLeft, Globe, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { parseCitation } from "../app/lib/citation";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: { document: string; page: number }[];
}

interface FileContext {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  content?: string;
}

interface ChatWindowProps {
  processedFiles?: FileContext[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ processedFiles = [] }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [useLocal, setUseLocal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === "" || loading) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Get API key from localStorage (optional - env variable takes priority)
    const apiKey = typeof window !== 'undefined' ? localStorage.getItem("gemini_api_key") : null;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage], 
          useLocal,
          apiKey: useLocal ? undefined : apiKey,
          fileContexts: processedFiles.length > 0 ? processedFiles.map(f => ({
            name: f.name,
            content: f.content || '',
            type: f.type
          })) : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText);
      }

      const data = response.body;
      if (!data) return;

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantResponse += chunk;

        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            const { content, citations } = parseCitation(assistantResponse);
            return [
              ...prev.slice(0, prev.length - 1),
              { ...lastMessage, content, citations },
            ];
          } else {
            const { content, citations } = parseCitation(assistantResponse);
            return [...prev, { role: "assistant", content, citations }];
          }
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error instanceof Error ? error.message : "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-navy-light rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-5 border-b border-border bg-surface/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
            <Bot className="text-navy-dark" size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gold">THE LEGAL ORACLE</h2>
            <p className="text-xs text-muted">AI-Powered Legal Research Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Mode Toggle */}
          <div className="flex items-center gap-3 px-4 py-2 bg-navy-dark/50 rounded-lg border border-border">
            <Globe size={16} className={useLocal ? "text-success" : "text-muted"} />
            <span className="text-sm text-muted">{useLocal ? "Ollama" : "Gemini"}</span>
            <button
              onClick={() => setUseLocal(!useLocal)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                useLocal ? "bg-success" : "bg-gold"
              }`}
              title={useLocal ? "Switch to Gemini API (Cloud)" : "Switch to Ollama (Local)"}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  useLocal ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          {/* New Chat Button */}
          <button
            onClick={() => setMessages([])}
            className="p-2.5 rounded-xl bg-surface hover:bg-surface/80 border border-border hover:border-gold/30 transition-all duration-200 btn-hover-lift"
            title="New Chat"
          >
            <MessageSquarePlus className="text-gold" size={20} />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center mb-6 glow-gold-sm">
              <Sparkles className="text-gold" size={36} />
            </div>
            <h3 className="text-2xl font-bold text-gold mb-2">Welcome to THE LEGAL ORACLE</h3>
            <p className="text-muted max-w-md mb-8">
              Your AI-powered legal research assistant. Ask any legal question and get instant, cited responses from your document vault.
            </p>
            {processedFiles.length > 0 && (
              <p className="text-sm text-success mb-4">
                📄 {processedFiles.length} document{processedFiles.length !== 1 ? "s" : ""} loaded and ready for analysis
              </p>
            )}
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              {[
                "What are the key provisions of Nigerian contract law?",
                "Explain the doctrine of stare decisis",
                "Recent Supreme Court rulings on property rights",
                "Corporate governance requirements for PLCs"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="p-4 text-left text-sm text-muted bg-surface/50 hover:bg-surface border border-border hover:border-gold/30 rounded-xl transition-all duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-4 animate-fade-in ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                msg.role === "user"
                  ? "bg-gold/20"
                  : "bg-gradient-to-br from-gold to-gold-light"
              }`}
            >
              {msg.role === "user" ? (
                <User className="text-gold" size={20} />
              ) : (
                <Bot className="text-navy-dark" size={20} />
              )}
            </div>

            {/* Message Content */}
            <div
              className={`flex-1 max-w-[75%] ${
                msg.role === "user" ? "text-right" : ""
              }`}
            >
              <div
                className={`inline-block p-4 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-gold text-navy-dark rounded-tr-sm"
                    : "bg-surface border border-border rounded-tl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
              
              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 p-3 bg-navy-dark/50 rounded-lg border border-border">
                  <p className="text-xs font-semibold text-gold mb-2">📚 Sources:</p>
                  <ul className="space-y-1">
                    {msg.citations.map((citation, cIndex) => (
                      <li key={cIndex} className="text-xs text-muted flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full"></span>
                        {citation.document} (Page {citation.page})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-4 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
              <Bot className="text-navy-dark" size={20} />
            </div>
            <div className="bg-surface border border-border rounded-2xl rounded-tl-sm p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="text-gold animate-spin" size={18} />
                <span className="text-sm text-muted">Analyzing legal documents...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-5 border-t border-border bg-surface/30">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={loading ? "Analyzing..." : "Ask a legal question..."}
              className="w-full px-5 py-4 pr-12 bg-navy-dark border border-border rounded-xl text-gold placeholder-muted focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <CornerDownLeft
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
              size={18}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-4 bg-gradient-to-r from-gold to-gold-light text-navy-dark font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 btn-hover-lift flex items-center gap-2"
          >
            <Send size={20} />
            <span>Send</span>
          </button>
        </div>
        <p className="mt-3 text-xs text-muted text-center">
          THE LEGAL ORACLE provides AI-assisted research. Always verify with official sources.
        </p>
      </footer>
    </div>
  );
};

export default ChatWindow;