import { AxiosError } from "axios";
import { backendApi } from "@/infrastructure/http/backend-api";
import { mapAgentReservationLimits } from "@/features/billing/mappers/agent-limits.mapper";
import type { BillingQuotaSummaryResponseDto } from "@/features/billing/api/billing-usage.dto";

type BackendErrorPayload = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export async function getWhatsappReservationQuota(accountId: string) {
  try {
    const response = await backendApi.get<BillingQuotaSummaryResponseDto>(
      `bot/billing-usage/accounts/${encodeURIComponent(
        accountId,
      )}/whatsapp-reservation-quota`,
    );

    return mapAgentReservationLimits(response.data);
  } catch (error) {
    throw createBillingUsageServiceError(
      error,
      "No se pudieron obtener los limites del agente.",
    );
  }
}

export class BillingUsageServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "BillingUsageServiceError";
  }
}

function createBillingUsageServiceError(error: unknown, fallbackMessage: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as BackendErrorPayload | undefined;
    const status = error.response?.status ?? 500;

    if (Array.isArray(data?.message) && data.message.length > 0) {
      return new BillingUsageServiceError(data.message.join(", "), status);
    }

    if (typeof data?.message === "string" && data.message.length > 0) {
      return new BillingUsageServiceError(data.message, status);
    }

    if (error.response) {
      return new BillingUsageServiceError(
        `${fallbackMessage} (${error.response.status}).`,
        status,
      );
    }
  }

  return new BillingUsageServiceError(fallbackMessage, 500);
}
