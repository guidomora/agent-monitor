export type ConversationDirection = "inbound" | "outbound";

export type ConversationMessage = {
  id: string;
  conversationId: string;
  phoneNumber: string;
  direction: ConversationDirection;
  body: string;
  sentAt: string | null;
  status: string | null;
  mediaCount: number;
};

export type ConversationSummary = {
  id: string;
  phoneNumber: string;
  lastMessagePreview: string;
  lastMessageAt: string | null;
  lastMessageStatus: string | null;
  messageCount: number;
};
