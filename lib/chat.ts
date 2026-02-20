interface Message {
  role: string;
  content: string;
}

interface FileContext {
  name: string;
  content: string;
  type: string;
}

// Together AI API configuration
const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";

// Get API key from environment or use provided key
function getApiKey(providedKey?: string): string {
  const apiKey = providedKey || process.env.TOGETHER_API_KEY || "";
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

// Together AI chat completion
async function togetherChat(
  messages: Message[], 
  apiKey: string, 
  fileContexts?: FileContext[],
  stream: boolean = true
): Promise<ReadableStream> {
  const systemPrompt = buildSystemPrompt(fileContexts);
  
  // Format messages for Together AI (OpenAI-compatible format)
  const formattedMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    })),
  ];

  const response = await fetch(TOGETHER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      messages: formattedMessages,
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.9,
      stream: stream,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Together AI error: ${response.status}`);
  }

  if (!stream) {
    // Non-streaming response
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const encoder = new TextEncoder();
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(content));
        controller.close();
      },
    });
  }

  // Streaming response
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
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch {
                // Skip invalid JSON
              }
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

// Cloud chat using Together AI
export async function ChatCloud(messages: Message[], apiKey?: string, fileContexts?: FileContext[]) {
  const key = getApiKey(apiKey);
  
  if (!key) {
    throw new Error("API key is required. Please set TOGETHER_API_KEY in your environment or provide it in settings.");
  }

  return togetherChat(messages, key, fileContexts, true);
}

// Local chat (Ollama) - kept for backward compatibility
export async function ChatLocal(messages: Message[], fileContexts?: FileContext[]) {
  const systemPrompt = buildSystemPrompt(fileContexts);

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