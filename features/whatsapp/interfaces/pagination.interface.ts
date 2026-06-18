import type { ConversationSummary } from "./conversation.interface";
import type { ConversationMessage } from "./message.interface";

export type PaginationMode = "page" | "refresh";

export interface ConversationCursorPayload {
  scope: "conversations";
  nextPageUrl?: string;
  bufferedConversations?: ConversationSummary[];
}

export interface MessagesCursorPayload {
  scope: "messages";
  conversationId: string;
  nextPageUrl?: string;
  bufferedMessages?: ConversationMessage[];
}

export type PaginationCursorPayload =
  | ConversationCursorPayload
  | MessagesCursorPayload;

export interface ParsePaginationParamsOptions {
  defaultLimit: number;
  maxLimit: number;
}

export interface PaginationOptions {
  limit?: number;
  cursor?: string | null;
  mode?: PaginationMode;
}

export interface ConversationPageResult {
  conversations: ConversationSummary[];
  nextCursor: string | null;
  hasMore: boolean;
  pageSize: number;
}

export interface MessagePageResult {
  messages: ConversationMessage[];
  nextCursor: string | null;
  hasMore: boolean;
  pageSize: number;
}
