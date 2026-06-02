import type {
  BillingQuotaUnavailableReason,
  WhatsappReservationQuotaState,
} from "@/features/billing/api/billing-usage.dto";

export type AgentReservationLimits = {
  period: string;
  planName: string | null;
  used: number;
  remaining: number;
  state: WhatsappReservationQuotaState;
  unavailableReason?: BillingQuotaUnavailableReason;
};
