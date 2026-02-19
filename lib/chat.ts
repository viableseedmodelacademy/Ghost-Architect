import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { ChatMemory } from "./memory";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

interface Message {
  role: string;
  content: string;
}

// Initialize Google Generative AI (Cloud Mode)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const modelCloud = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Initialize Ollama (Local Mode)
const modelLocal = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: "llama2", // You can change this to your desired local model
});

export async function ChatCloud(messages: Message[]) {
  const memory = new ChatMemory();
  const chatHistory = await memory.getChatHistory();

  const formattedMessages = [
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

export async function ChatLocal(messages: Message[]) {
  const memory = new ChatMemory();
  const chatHistory = await memory.getChatHistory();

  const formattedMessages = [
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
        controller.enqueue(encoder.encode(chunk.content));
      }
      controller.close();
    },
  });

  return readableStream;
}
