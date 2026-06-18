import "server-only";
import { getTwilioEnv } from "@/infrastructure/twilio/twilio-env";
import type {
  PaginationMode,
  ParsePaginationParamsOptions,
} from "@/features/whatsapp/interfaces";
import { PaginationRequestError } from "@/features/whatsapp/services/conversation-pagination-cursor";

export function parsePaginationMode(value: string | null): PaginationMode {
  if (!value || value === "page") {
    return "page";
  }

  if (value === "refresh") {
    return "refresh";
  }

  throw new PaginationRequestError("El modo de paginacion no es valido.");
}

export function parsePaginationLimit(
  value: string | null,
  { defaultLimit, maxLimit }: ParsePaginationParamsOptions,
) {
  if (!value) {
    return defaultLimit;
  }

  const limit = Number(value);

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new PaginationRequestError("El limite de paginacion no es valido.");
  }

  return Math.min(limit, maxLimit);
}

export function parseConversationPaginationParams(searchParams: URLSearchParams) {
  const env = getTwilioEnv();

  return {
    cursor: searchParams.get("cursor"),
    limit: parsePaginationLimit(searchParams.get("limit"), {
      defaultLimit: env.conversationPageSize,
      maxLimit: 100,
    }),
    mode: parsePaginationMode(searchParams.get("mode")),
  };
}

export function parseMessagesPaginationParams(searchParams: URLSearchParams) {
  const env = getTwilioEnv();
  const direction = searchParams.get("direction") ?? "older";

  if (direction !== "older") {
    throw new PaginationRequestError("La direccion de paginacion no es valida.");
  }

  return {
    cursor: searchParams.get("cursor"),
    direction,
    limit: parsePaginationLimit(searchParams.get("limit"), {
      defaultLimit: env.messagePageSize,
      maxLimit: 100,
    }),
    mode: parsePaginationMode(searchParams.get("mode")),
  };
}
