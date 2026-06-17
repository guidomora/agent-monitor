import "server-only";
import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";
import { getTwilioClient } from "@/infrastructure/twilio/twilio-client";
import { getTwilioEnv } from "@/infrastructure/twilio/twilio-env";
import {
  decodeConversationCursor,
  decodeMessagesCursor,
  encodePaginationCursor,
} from "@/features/whatsapp/services/conversation-pagination-cursor";
import type { PaginationMode } from "@/features/whatsapp/services/conversation-pagination-params";
import type { ConversationSummary } from "@/features/whatsapp/model/conversation.types";
import type { ConversationMessage } from "@/features/whatsapp/model/message.types";

type ConversationPageResult = {
  conversations: ConversationSummary[];
  nextCursor: string | null;
  hasMore: boolean;
  pageSize: number;
};

type MessagePageResult = {
  messages: ConversationMessage[];
  nextCursor: string | null;
  hasMore: boolean;
  pageSize: number;
};

type PaginationOptions = {
  limit?: number;
  cursor?: string | null;
  mode?: PaginationMode;
};

function normalizeAddress(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.replace(/^whatsapp:/i, "").trim();
}

function isWhatsappAddress(value: string | null | undefined) {
  return typeof value === "string" && value.toLowerCase().startsWith("whatsapp:");
}

function resolveTimestamp(message: MessageInstance) {
  const value = message.dateSent ?? message.dateCreated ?? message.dateUpdated;

  return value ? new Date(value).toISOString() : null;
}

function resolveDirection(message: MessageInstance, agentNumber: string) {
  return normalizeAddress(message.from) === agentNumber ? "outbound" : "inbound";
}

function resolveConversationNumber(message: MessageInstance, agentNumber: string) {
  const from = normalizeAddress(message.from);
  const to = normalizeAddress(message.to);

  return from === agentNumber ? to : from;
}

function resolvePreview(message: ConversationMessage) {
  if (message.body.trim()) {
    return message.body.trim().replace(/\s+/g, " ").slice(0, 110);
  }

  if (message.mediaCount > 0) {
    return "[Mensaje multimedia]";
  }

  return "[Sin contenido]";
}

function compareDescendingByDate(
  left: { sentAt?: string | null; lastMessageAt?: string | null },
  right: { sentAt?: string | null; lastMessageAt?: string | null },
) {
  const leftValue = left.sentAt ?? left.lastMessageAt ?? "";
  const rightValue = right.sentAt ?? right.lastMessageAt ?? "";

  return rightValue.localeCompare(leftValue);
}

function compareAscendingByDate(
  left: { sentAt?: string | null },
  right: { sentAt?: string | null },
) {
  return (left.sentAt ?? "").localeCompare(right.sentAt ?? "");
}

function isWhatsappAgentMessage(message: MessageInstance, agentNumber: string) {
  const matchesWhatsApp =
    isWhatsappAddress(message.from) || isWhatsappAddress(message.to);

  if (!matchesWhatsApp) {
    return false;
  }

  const from = normalizeAddress(message.from);
  const to = normalizeAddress(message.to);

  return from === agentNumber || to === agentNumber;
}

function mapConversationMessage(
  message: MessageInstance,
  agentNumber: string,
): ConversationMessage {
  const phoneNumber = resolveConversationNumber(message, agentNumber);

  return {
    id: message.sid,
    conversationId: phoneNumber,
    phoneNumber,
    direction: resolveDirection(message, agentNumber),
    body: message.body ?? "",
    sentAt: resolveTimestamp(message),
    status: message.status ?? null,
    mediaCount: Number(message.numMedia ?? 0),
  };
}

async function fetchTwilioMessagePage(options: {
  pageSize: number;
  nextPageUrl?: string;
}) {
  if (options.nextPageUrl) {
    return getTwilioClient().messages.getPage(options.nextPageUrl);
  }

  return getTwilioClient().messages.page({
    pageSize: options.pageSize,
  });
}

function buildConversationCursor({
  nextPageUrl,
  bufferedConversations,
}: {
  nextPageUrl?: string;
  bufferedConversations?: ConversationSummary[];
}) {
  if (!nextPageUrl && (!bufferedConversations || bufferedConversations.length === 0)) {
    return null;
  }

  return encodePaginationCursor({
    scope: "conversations",
    nextPageUrl,
    bufferedConversations,
  });
}

function buildMessagesCursor({
  conversationId,
  nextPageUrl,
  bufferedMessages,
}: {
  conversationId: string;
  nextPageUrl?: string;
  bufferedMessages?: ConversationMessage[];
}) {
  if (!nextPageUrl && (!bufferedMessages || bufferedMessages.length === 0)) {
    return null;
  }

  return encodePaginationCursor({
    scope: "messages",
    conversationId,
    nextPageUrl,
    bufferedMessages,
  });
}

export async function getConversationSummaries({
  cursor,
  limit,
  mode = "page",
}: PaginationOptions = {}): Promise<ConversationPageResult> {
  const env = getTwilioEnv();
  const pageSize = limit ?? env.conversationPageSize;
  const twilioPageSize = Math.min(env.twilioPageSize, pageSize);
  const conversations = new Map<string, ConversationSummary>();
  const decodedCursor =
    cursor && mode !== "refresh" ? decodeConversationCursor(cursor) : null;
  const firstPageUrl = decodedCursor?.nextPageUrl;
  let nextPageUrl = firstPageUrl;
  let lastTwilioNextPageUrl: string | undefined;

  for (const conversation of decodedCursor?.bufferedConversations ?? []) {
    conversations.set(conversation.id, conversation);
  }

  for (
    let pageIndex = 0;
    conversations.size < pageSize && pageIndex < env.maxTwilioPagesPerRequest;
    pageIndex += 1
  ) {
    if (!nextPageUrl && (pageIndex > 0 || decodedCursor)) {
      break;
    }

    const page = await fetchTwilioMessagePage({
      pageSize: twilioPageSize,
      nextPageUrl,
    });

    lastTwilioNextPageUrl = page.nextPageUrl;

    const messages = page.instances
      .filter((message) => isWhatsappAgentMessage(message, env.whatsappNumber))
      .map((message) => mapConversationMessage(message, env.whatsappNumber))
      .sort(compareDescendingByDate);

    for (const message of messages) {
      const current = conversations.get(message.conversationId);

      if (!current) {
        conversations.set(message.conversationId, {
          id: message.conversationId,
          phoneNumber: message.phoneNumber,
          lastMessagePreview: resolvePreview(message),
          lastMessageAt: message.sentAt,
          lastMessageStatus: message.status,
          messageCount: 1,
        });
        continue;
      }

      current.messageCount += 1;
    }

    if (!page.nextPageUrl) {
      break;
    }

    nextPageUrl = page.nextPageUrl;
  }

  const sortedConversations = Array.from(conversations.values()).sort(
    compareDescendingByDate,
  );
  const visibleConversations = sortedConversations.slice(0, pageSize);
  const bufferedConversations = sortedConversations.slice(pageSize);
  const nextCursor = buildConversationCursor({
    nextPageUrl: lastTwilioNextPageUrl,
    bufferedConversations,
  });

  return {
    conversations: visibleConversations,
    nextCursor,
    hasMore: Boolean(nextCursor),
    pageSize,
  };
}

export async function getConversationMessages(
  conversationId: string,
  { cursor, limit, mode = "page" }: PaginationOptions = {},
): Promise<MessagePageResult> {
  const env = getTwilioEnv();
  const normalizedConversationId = normalizeAddress(conversationId);
  const pageSize = limit ?? env.messagePageSize;
  const twilioPageSize = Math.min(env.twilioPageSize, pageSize);
  const messages = new Map<string, ConversationMessage>();
  const decodedCursor =
    cursor && mode !== "refresh"
      ? decodeMessagesCursor(cursor, normalizedConversationId)
      : null;
  const firstPageUrl = decodedCursor?.nextPageUrl;
  let nextPageUrl = firstPageUrl;
  let lastTwilioNextPageUrl: string | undefined;

  for (const message of decodedCursor?.bufferedMessages ?? []) {
    messages.set(message.id, message);
  }

  for (
    let pageIndex = 0;
    messages.size < pageSize && pageIndex < env.maxTwilioPagesPerRequest;
    pageIndex += 1
  ) {
    if (!nextPageUrl && (pageIndex > 0 || decodedCursor)) {
      break;
    }

    const page = await fetchTwilioMessagePage({
      pageSize: twilioPageSize,
      nextPageUrl,
    });

    lastTwilioNextPageUrl = page.nextPageUrl;

    const conversationMessages = page.instances
      .filter((message) => isWhatsappAgentMessage(message, env.whatsappNumber))
      .map((message) => mapConversationMessage(message, env.whatsappNumber))
      .filter((message) => message.conversationId === normalizedConversationId);

    for (const message of conversationMessages) {
      messages.set(message.id, message);
    }

    if (!page.nextPageUrl) {
      break;
    }

    nextPageUrl = page.nextPageUrl;
  }

  const sortedMessages = Array.from(messages.values()).sort(compareAscendingByDate);
  const visibleMessages = sortedMessages.slice(-pageSize);
  const bufferedMessages = sortedMessages.slice(
    0,
    Math.max(0, sortedMessages.length - pageSize),
  );
  const nextCursor = buildMessagesCursor({
    conversationId: normalizedConversationId,
    nextPageUrl: lastTwilioNextPageUrl,
    bufferedMessages,
  });

  return {
    messages: visibleMessages,
    nextCursor,
    hasMore: Boolean(nextCursor),
    pageSize,
  };
}
