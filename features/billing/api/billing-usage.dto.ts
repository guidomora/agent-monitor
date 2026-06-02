export type WhatsappReservationQuotaState =
  | "available"
  | "near_limit"
  | "exhausted"
  | "unlimited"
  | "unavailable";

export type BillingQuotaUnavailableReason =
  | "missing_active_subscription"
  | "inactive_plan"
  | "invalid_plan_limit";

export type BillingQuotaSummaryResponseDto = {
  accountId: string;
  period: string;
  periodStart: string | null;
  periodEnd: string | null;
  plan: {
    id: string;
    code: string;
    name: string;
    monthlyWhatsappReservationLimit: number | null;
  } | null;
  used: number;
  remaining: number;
  overage: number;
  state: WhatsappReservationQuotaState;
  unavailableReason?: BillingQuotaUnavailableReason;
};
