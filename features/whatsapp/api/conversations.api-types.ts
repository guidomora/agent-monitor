import type { ConversationSummary } from "@/features/whatsapp/model/conversation.types";
import type { ConversationMessage } from "@/features/whatsapp/model/message.types";

export type ConversationsResponse = {
  conversations: ConversationSummary[];
};

export type MessagesResponse = {
  messages: ConversationMessage[];
};

export type ApiErrorResponse = {
  error?: string;
};
