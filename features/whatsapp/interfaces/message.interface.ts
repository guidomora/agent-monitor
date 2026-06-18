export type ConversationDirection = "inbound" | "outbound";

export interface ConversationMessage {
  id: string;
  conversationId: string;
  phoneNumber: string;
  direction: ConversationDirection;
  body: string;
  sentAt: string | null;
  status: string | null;
  mediaCount: number;
}
