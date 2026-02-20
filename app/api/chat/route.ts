import { NextRequest, NextResponse } from "next/server";
import { ChatCloud, ChatLocal } from "../../../lib/chat";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { messages, useLocal } = await req.json();

  if (useLocal) {
    const stream = await ChatLocal(messages);
    return new NextResponse(stream);
  } else {
    const stream = await ChatCloud(messages);
    return new NextResponse(stream);
  }
}