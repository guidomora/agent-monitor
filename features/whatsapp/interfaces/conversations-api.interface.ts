import type { ConversationSummary } from "./conversation.interface";
import type { ConversationMessage } from "./message.interface";

export interface ConversationsResponse {
  conversations: ConversationSummary[];
  nextCursor: string | null;
  hasMore: boolean;
  pageSize: number;
}

export interface MessagesResponse {
  messages: ConversationMessage[];
  nextCursor: string | null;
  hasMore: boolean;
  pageSize: number;
}

export interface ApiErrorResponse {
  error?: string;
}
