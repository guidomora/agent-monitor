import "server-only";
import type { ConversationSummary } from "@/features/whatsapp/model/conversation.types";
import type { ConversationMessage } from "@/features/whatsapp/model/message.types";

export type ConversationCursorPayload = {
  scope: "conversations";
  nextPageUrl?: string;
  bufferedConversations?: ConversationSummary[];
};

export type MessagesCursorPayload = {
  scope: "messages";
  conversationId: string;
  nextPageUrl?: string;
  bufferedMessages?: ConversationMessage[];
};

export type PaginationCursorPayload =
  | ConversationCursorPayload
  | MessagesCursorPayload;

export class PaginationRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaginationRequestError";
  }
}

export function encodePaginationCursor(payload: PaginationCursorPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePaginationCursor(cursor: string): PaginationCursorPayload {
  try {
    const rawValue = Buffer.from(cursor, "base64url").toString("utf8");
    const payload = JSON.parse(rawValue) as Partial<PaginationCursorPayload>;

    if (payload.scope === "conversations") {
      return {
        scope: "conversations",
        nextPageUrl:
          typeof payload.nextPageUrl === "string" && payload.nextPageUrl
            ? payload.nextPageUrl
            : undefined,
        bufferedConversations: Array.isArray(payload.bufferedConversations)
          ? payload.bufferedConversations
          : undefined,
      };
    }

    if (
      payload.scope === "messages" &&
      typeof payload.conversationId === "string" &&
      payload.conversationId
    ) {
      return {
        scope: "messages",
        conversationId: payload.conversationId,
        nextPageUrl:
          typeof payload.nextPageUrl === "string" && payload.nextPageUrl
            ? payload.nextPageUrl
            : undefined,
        bufferedMessages: Array.isArray(payload.bufferedMessages)
          ? payload.bufferedMessages
          : undefined,
      };
    }
  } catch {
    throw new PaginationRequestError("El cursor de paginacion no es valido.");
  }

  throw new PaginationRequestError("El cursor de paginacion no es valido.");
}

export function decodeConversationCursor(cursor: string) {
  const payload = decodePaginationCursor(cursor);

  if (payload.scope !== "conversations") {
    throw new PaginationRequestError("El cursor no corresponde a conversaciones.");
  }

  return payload;
}

export function decodeMessagesCursor(cursor: string, conversationId: string) {
  const payload = decodePaginationCursor(cursor);

  if (payload.scope !== "messages" || payload.conversationId !== conversationId) {
    throw new PaginationRequestError("El cursor no corresponde a esta conversacion.");
  }

  return payload;
}
