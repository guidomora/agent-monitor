import "server-only";
import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";
import { getTwilioClient } from "@/infrastructure/twilio/twilio-client";
import { getTwilioEnv } from "@/infrastructure/twilio/twilio-env";
import type { ConversationSummary } from "@/features/whatsapp/model/conversation.types";
import type { ConversationMessage } from "@/features/whatsapp/model/message.types";

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

async function listWhatsappMessages() {
  const env = getTwilioEnv();
  const messages = await getTwilioClient().messages.list({
    limit: env.messageLimit,
    pageSize: env.messageLimit,
  });

  return messages.filter((message) => {
    const matchesWhatsApp =
      isWhatsappAddress(message.from) || isWhatsappAddress(message.to);

    if (!matchesWhatsApp) {
      return false;
    }

    const from = normalizeAddress(message.from);
    const to = normalizeAddress(message.to);

    return from === env.whatsappNumber || to === env.whatsappNumber;
  });
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

export async function getConversationSummaries(): Promise<ConversationSummary[]> {
  const env = getTwilioEnv();
  const messages = (await listWhatsappMessages())
    .map((message) => mapConversationMessage(message, env.whatsappNumber))
    .sort(compareDescendingByDate);

  const conversations = new Map<string, ConversationSummary>();

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

  return Array.from(conversations.values()).sort(compareDescendingByDate);
}

export async function getConversationMessages(
  conversationId: string,
): Promise<ConversationMessage[]> {
  const env = getTwilioEnv();
  const normalizedConversationId = normalizeAddress(conversationId);
  const messages = (await listWhatsappMessages())
    .map((message) => mapConversationMessage(message, env.whatsappNumber))
    .filter((message) => message.conversationId === normalizedConversationId)
    .sort((left, right) => (left.sentAt ?? "").localeCompare(right.sentAt ?? ""));

  return messages;
}
