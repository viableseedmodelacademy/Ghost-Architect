interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export class ChatMemory {
  private chatHistory: ChatMessage[] = [];

  async getChatHistory(): Promise<ChatMessage[]> {
    // In a real application, this would load from a database or a persistent store.
    // For this demo, we'll return the in-memory history.
    return this.chatHistory;
  }

  async addMessage(message: ChatMessage): Promise<void> {
    // In a real application, this would save to a database or a persistent store.
    this.chatHistory.push(message);
  }

  async clearChatHistory(): Promise<void> {
    this.chatHistory = [];
  }
}
