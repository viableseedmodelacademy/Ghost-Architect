"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquarePlus, Send, CornerDownLeft, Globe } from "lucide-react";
import { parseCitation } from "../app/lib/citation";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: { document: string; page: number }[];
}

const ChatWindow = () => {
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

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, userMessage], useLocal }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
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
    <div className="flex flex-col h-full bg-navy-light rounded-lg shadow-xl">
      <header className="flex items-center justify-between p-4 border-b border-gold-dark">
        <h2 className="text-2xl font-bold text-gold">Chat with THE ORACLE</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Globe className="text-gold mr-2" size={20} />
            <span className="text-sm text-gold">Local Mode:</span>
            <input
              type="checkbox"
              checked={useLocal}
              onChange={() => setUseLocal(!useLocal)}
              className="ml-2 toggle toggle-gold"
            />
          </div>
          <button className="p-2 rounded-full hover:bg-navy-dark transition-colors">
            <MessageSquarePlus className="text-gold" size={24} />
          </button>
        </div>
      </header>
      <main className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${(
                msg.role === "user"
                  ? "bg-gold text-navy-dark"
                  : "bg-navy-dark text-gold"
              )}
                ${msg.citations && msg.citations.length > 0 ? "mb-2" : ""}`}
            >
              <p>{msg.content}</p>
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  <p className="font-semibold">Sources:</p>
                  <ul className="list-disc list-inside">
                    {msg.citations.map((citation, cIndex) => (
                      <li key={cIndex}>
                        {citation.document} (Page {citation.page})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>
      <footer className="p-4 border-t border-gold-dark flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={loading ? "Thinking..." : "Type your message..."}
            className="w-full p-3 pl-4 pr-12 bg-navy-dark border border-gold-dark rounded-lg text-gold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <CornerDownLeft
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={20}
          />
        </div>
        <button
          onClick={handleSendMessage}
          className="ml-4 p-3 bg-gold text-navy-dark rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center"
          disabled={loading}
        >
          <Send size={24} />
        </button>
      </footer>
    </div>
  );
};

export default ChatWindow;
