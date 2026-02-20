import { NextRequest, NextResponse } from "next/server";
import { ChatCloud, ChatLocal } from "../../../lib/chat";

export const runtime = "nodejs";

interface FileContext {
  name: string;
  content: string;
  type: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Support both old and new request formats
    const { message, messages, useLocal, apiKey, files, fileContexts, mode } = body as {
      message?: string;
      messages?: Array<{ role: string; content: string }>;
      useLocal?: boolean;
      apiKey?: string;
      files?: FileContext[];
      fileContexts?: FileContext[];
      mode?: string;
    };

    // Determine if using local mode
    const isLocalMode = useLocal || mode === "local";
    
    // Get the message - either single message or from messages array
    const userMessage = message || (messages && messages.length > 0 ? messages[messages.length - 1].content : "");
    
    // Get file contexts - support both 'files' and 'fileContexts' property names
    const effectiveFileContexts = files || fileContexts || [];

    // For cloud mode, check if API key is available (from env or provided)
    if (!isLocalMode) {
      const effectiveApiKey = apiKey || process.env.TOGETHER_API_KEY;
      if (!effectiveApiKey || effectiveApiKey === "your_together_api_key_here") {
        return NextResponse.json(
          { error: "API key is required. Please set TOGETHER_API_KEY in your environment variables. Get your free key at https://api.together.xyz/" },
          { status: 400 }
        );
      }
    }

    try {
      if (isLocalMode) {
        const stream = await ChatLocal(
          userMessage ? [{ role: "user", content: userMessage }] : messages || [],
          effectiveFileContexts
        );
        return new NextResponse(stream);
      } else {
        const stream = await ChatCloud(
          userMessage ? [{ role: "user", content: userMessage }] : messages || [],
          apiKey,
          effectiveFileContexts
        );
        return new NextResponse(stream);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process your request. Please try again.";
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (parseError) {
    console.error("Request parsing error:", parseError);
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }
}