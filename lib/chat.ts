import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { ChatMemory } from "./memory";

interface Message {
  role: string;
  content: string;
}

interface FileContext {
  name: string;
  content: string;
  type: string;
}

// Initialize Ollama (Local Mode)
const modelLocal = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "llama3", // Updated to llama3 as requested
});

// Get API key from environment or use provided key
function getApiKey(providedKey?: string): string {
  // Priority: provided key > environment variable
  const apiKey = providedKey || process.env.GEMINI_API_KEY || "";
  return apiKey;
}

// Build system prompt with file context
function buildSystemPrompt(fileContexts?: FileContext[]): string {
  let systemPrompt = `You are THE LEGAL ORACLE, an expert AI legal research assistant for a prestigious Nigerian law firm. You specialize in Nigerian law, corporate law, contract law, property law, and legal research.

Your capabilities include:
- Analyzing legal documents and extracting key information
- Providing accurate legal citations and references
- Explaining complex legal concepts in clear terms
- Assisting with legal research and case analysis
- Drafting legal documents and correspondence

Always maintain a professional, authoritative, yet accessible tone. When citing legal sources, be specific and accurate. If you're uncertain about something, acknowledge it and suggest verification methods.`;

  if (fileContexts && fileContexts.length > 0) {
    systemPrompt += `\n\nThe user has uploaded the following documents for analysis. Use this context to provide more accurate and relevant responses:\n`;
    
    fileContexts.forEach((file, index) => {
      systemPrompt += `\n--- Document ${index + 1}: ${file.name} ---\n${file.content.substring(0, 50000)}\n`; // Limit content to avoid token limits
    });
    
    systemPrompt += `\nWhen answering questions, reference specific documents when relevant and cite page numbers if available.`;
  }

  return systemPrompt;
}

export async function ChatCloud(messages: Message[], apiKey?: string, fileContexts?: FileContext[]) {
  // Get API key from environment or provided key
  const key = getApiKey(apiKey);
  
  if (!key) {
    throw new Error("API key is required. Please set GEMINI_API_KEY in your environment or provide it in settings.");
  }

  const genAI = new GoogleGenerativeAI(key);
  const modelCloud = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const memory = new ChatMemory();
  const chatHistory = await memory.getChatHistory();

  // Build system prompt with file context
  const systemPrompt = buildSystemPrompt(fileContexts);

  // Format messages for Gemini
  const formattedMessages = [
    { role: "user", parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: "I understand. I am THE LEGAL ORACLE, ready to assist with your legal research needs. I will analyze any uploaded documents and provide accurate, professional legal assistance." }] },
    ...chatHistory.map((msg) => ({ role: msg.role, parts: [{ text: msg.content }] })),
    ...messages.map((msg) => ({ role: msg.role, parts: [{ text: msg.content }] })),
  ];

  const result = await modelCloud.generateContentStream({
    contents: formattedMessages,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  });

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        controller.enqueue(encoder.encode(chunkText));
      }
      controller.close();
    },
  });

  return readableStream;
}

export async function ChatLocal(messages: Message[], fileContexts?: FileContext[]) {
  const memory = new ChatMemory();
  const chatHistory = await memory.getChatHistory();

  // Build system prompt with file context
  const systemPrompt = buildSystemPrompt(fileContexts);

  const formattedMessages = [
    { role: "system", content: systemPrompt },
    ...chatHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    })),
    ...messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    })),
  ];

  const stream = await modelLocal.stream(formattedMessages);

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = typeof chunk.content === 'string' 
          ? chunk.content 
          : JSON.stringify(chunk.content);
        controller.enqueue(encoder.encode(content));
      }
      controller.close();
    },
  });

  return readableStream;
}