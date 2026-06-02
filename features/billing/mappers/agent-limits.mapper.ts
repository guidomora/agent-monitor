import type { BillingQuotaSummaryResponseDto } from "@/features/billing/api/billing-usage.dto";
import type { AgentReservationLimits } from "@/features/billing/model/agent-limits.types";

export function mapAgentReservationLimits(
  response: BillingQuotaSummaryResponseDto,
): AgentReservationLimits {
  return {
    period: response.period,
    planName: response.plan?.name ?? null,
    used: response.used,
    remaining: response.remaining,
    state: response.state,
    unavailableReason: response.unavailableReason,
  };
}
