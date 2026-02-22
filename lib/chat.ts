import mammoth from "mammoth";

interface Message {
  role: string;
  content: string;
}

interface FileContext {
  name: string;
  content: string;
  type: string;
}

// Cohere API configuration
const COHERE_API_URL = "https://api.cohere.ai/v1/chat";

// Get API key from environment or use provided key
function getApiKey(providedKey?: string): string {
  const apiKey = providedKey || process.env.COHERE_API_KEY || "";
  return apiKey;
}

// Extract text from PDF base64 data URL using dynamic import
async function extractPdfText(dataUrl: string): Promise<string> {
  try {
    // Dynamic import to avoid build-time issues
    const pdfParse = (await import("pdf-parse")).default;
    
    // Extract base64 data from data URL
    const base64Match = dataUrl.match(/^data:application\/pdf;base64,(.+)$/);
    if (!base64Match) {
      return dataUrl; // Not a PDF data URL, return as-is
    }
    
    const base64Data = base64Match[1];
    const buffer = Buffer.from(base64Data, "base64");
    
    // Parse PDF
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF extraction error:", error);
    return "[Could not extract text from this PDF]";
  }
}

// Extract text from Word document (docx)
async function extractWordText(dataUrl: string): Promise<string> {
  try {
    // Extract base64 data from data URL
    const base64Match = dataUrl.match(/^data:application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document;base64,(.+)$/);
    if (!base64Match) {
      // Try alternative mime type
      const altMatch = dataUrl.match(/^data:application\/octet-stream;base64,(.+)$/);
      if (!altMatch) {
        return dataUrl; // Not a Word data URL, return as-is
      }
      const base64Data = altMatch[1];
      const buffer = Buffer.from(base64Data, "base64");
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    
    const base64Data = base64Match[1];
    const buffer = Buffer.from(base64Data, "base64");
    
    // Extract text from Word document
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("Word extraction error:", error);
    return "[Could not extract text from this Word document]";
  }
}

// Extract text from plain text file
function extractTextFile(dataUrl: string): string {
  try {
    // Extract base64 data from data URL
    const base64Match = dataUrl.match(/^data:text\/plain;base64,(.+)$/);
    if (!base64Match) {
      // Try to decode as plain text
      if (!dataUrl.startsWith("data:")) {
        return dataUrl;
      }
      return "";
    }
    
    const base64Data = base64Match[1];
    return Buffer.from(base64Data, "base64").toString("utf-8");
  } catch (error) {
    console.error("Text file extraction error:", error);
    return "[Could not extract text from this file]";
  }
}

// Process file content - extract text from various formats
async function processFileContent(file: FileContext): Promise<string> {
  const content = file.content;
  
  if (!content) {
    return "[No content available]";
  }

  // Check if it's a PDF data URL
  if (content.startsWith("data:application/pdf")) {
    return await extractPdfText(content);
  }
  
  // Check if it's a Word document
  if (content.startsWith("data:application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
      content.startsWith("data:application/octet-stream") ||
      file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
    return await extractWordText(content);
  }
  
  // Check if it's a plain text file
  if (content.startsWith("data:text/plain") || file.name.endsWith(".txt")) {
    return extractTextFile(content);
  }
  
  // Check if it's already plain text (not a data URL)
  if (!content.startsWith("data:")) {
    return content;
  }
  
  return "[Binary file - content not readable]";
}

// Build system prompt with file context
async function buildSystemPromptWithFiles(fileContexts?: FileContext[]): Promise<string> {
  let systemPrompt = `You are Legal Oracle, an expert AI legal research assistant created by Umar Luqman in 2006. You specialize in Nigerian law, corporate law, contract law, property law, and legal research.

IMPORTANT IDENTITY INFORMATION:
- Your name is: Legal Oracle
- Your creator is: Umar Luqman
- Umar Luqman is a young developer who solely runs Alwen Team
- Umar Luqman specializes in: automation, software development, AI/ML, and other computer science and technology fields
- You were built in: 2006
- Your model name is: "Model You" of Alwen Team
- When asked about your creator, you MUST say: "I was created by Umar Luqman, a young developer who runs Alwen Team. He specializes in automation, software development, AI/ML, and other computer science and technology fields."
- When asked about your model, you MUST say: "I am Model You, created by Umar Luqman of Alwen Team."

Your capabilities include:
- Analyzing legal documents and extracting key information
- Providing accurate legal citations and references
- Explaining complex legal concepts in clear terms
- Assisting with legal research and case analysis
- Drafting legal documents and correspondence
- Answering general legal questions even without uploaded documents

Always maintain a professional, authoritative, yet accessible tone. When citing legal sources, be specific and accurate. If you're uncertain about something, acknowledge it and suggest verification methods.

You can chat and answer legal questions even when no documents are uploaded. Be helpful and provide general legal guidance when documents are not available.`;

  if (fileContexts && fileContexts.length > 0) {
    systemPrompt += `\n\nThe user has uploaded the following documents for analysis. Use this context to provide more accurate and relevant responses:\n`;
    
    for (let i = 0; i < fileContexts.length; i++) {
      const file = fileContexts[i];
      const extractedText = await processFileContent(file);
      // Limit to 50000 characters per document
      const limitedText = extractedText.substring(0, 50000);
      systemPrompt += `\n--- Document ${i + 1}: ${file.name} ---\n${limitedText}\n`;
    }
    
    systemPrompt += `\nWhen answering questions, reference specific documents when relevant and cite page numbers if available.`;
  }

  return systemPrompt;
}

// Cohere chat completion - Non-streaming for reliability
async function cohereChat(
  messages: Message[], 
  apiKey: string, 
  fileContexts?: FileContext[]
): Promise<ReadableStream> {
  const systemPrompt = await buildSystemPromptWithFiles(fileContexts);
  
  // Get the last user message
  const lastMessage = messages[messages.length - 1];
  const userMessage = lastMessage?.content || "";

  // Build chat history for Cohere
  const chatHistory = messages.slice(0, -1).map((msg) => ({
    role: msg.role === "user" ? "USER" : "CHATBOT",
    message: msg.content,
  }));

  console.log("Sending to Cohere with system prompt length:", systemPrompt.length);

  // Use non-streaming for reliability
  const response = await fetch(COHERE_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "command-a-03-2025",
      message: userMessage,
      preamble: systemPrompt,
      chat_history: chatHistory.length > 0 ? chatHistory : undefined,
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Cohere API error: ${response.status}`);
  }

  // Parse the response
  const data = await response.json();
  const content = data.text || "";
  
  console.log("Cohere response length:", content.length);

  // Return as a stream for consistency
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(content));
      controller.close();
    },
  });
}

// Cloud chat using Cohere
export async function ChatCloud(messages: Message[], apiKey?: string, fileContexts?: FileContext[]) {
  const key = getApiKey(apiKey);
  
  if (!key) {
    throw new Error("API key is required. Please set COHERE_API_KEY in your environment or provide it in settings.");
  }

  return cohereChat(messages, key, fileContexts);
}

// Local chat (Ollama) - kept for backward compatibility
export async function ChatLocal(messages: Message[], fileContexts?: FileContext[]) {
  const systemPrompt = await buildSystemPromptWithFiles(fileContexts);

  const formattedMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    })),
  ];

  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3",
      messages: formattedMessages,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}. Make sure Ollama is running locally.`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Failed to get response stream");
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(Boolean);

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              const content = parsed.message?.content || "";
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}