import { NextRequest, NextResponse } from "next/server";
import { ChatCloud, ChatLocal } from "../../../lib/chat";

export const runtime = "nodejs"; // Changed from edge to nodejs for better compatibility

interface FileContext {
  name: string;
  content: string;
  type: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, useLocal, apiKey, fileContexts } = body as {
      messages: Array<{ role: string; content: string }>;
      useLocal?: boolean;
      apiKey?: string;
      fileContexts?: FileContext[];
    };

    // For cloud mode, check if API key is available (from env or provided)
    if (!useLocal) {
      const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY;
      if (!effectiveApiKey) {
        return NextResponse.json(
          { error: "API key is required. Please set GEMINI_API_KEY in your .env.local file or provide it in Settings." },
          { status: 400 }
        );
      }
    }

    try {
      if (useLocal) {
        const stream = await ChatLocal(messages, fileContexts);
        return new NextResponse(stream);
      } else {
        const stream = await ChatCloud(messages, apiKey, fileContexts);
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