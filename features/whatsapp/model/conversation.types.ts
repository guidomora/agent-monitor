export type ConversationSummary = {
  id: string;
  phoneNumber: string;
  lastMessagePreview: string;
  lastMessageAt: string | null;
  lastMessageStatus: string | null;
  messageCount: number;
};
