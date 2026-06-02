import { ReservationsOverview } from "@/features/reservations/components/reservations-overview";
import { getWhatsappReservationQuota } from "@/features/billing/api/billing-usage.service";
import { getReservationsByDate } from "@/features/reservations/api/reservations.service";
import {
  createEmptyReservationsOverview,
  mapReservationsOverview,
} from "@/features/reservations/mappers/reservations.mapper";
import type { AgentReservationLimits } from "@/features/billing/model/agent-limits.types";
import type { ReservationOverviewViewModel } from "@/features/reservations/types/reservation.view-model";

export const dynamic = "force-dynamic";

const DEFAULT_ACCOUNT_ID = "default";

export default async function HomePage() {
  const currentDate = new Date();
  const formattedHeading = getFormattedHeading(currentDate);
  const date = getIsoDate(currentDate);

  let overview: ReservationOverviewViewModel = createEmptyReservationsOverview();
  let errorMessage: string | undefined;
  let agentLimits: AgentReservationLimits | null = null;

  try {
    const [reservationsResult, agentLimitsResult] = await Promise.allSettled([
      getReservationsByDate(date),
      getWhatsappReservationQuota(DEFAULT_ACCOUNT_ID),
    ]);

    if (agentLimitsResult.status === "fulfilled") {
      agentLimits = agentLimitsResult.value;
      overview = createEmptyReservationsOverview(agentLimits);
    }

    if (reservationsResult.status === "fulfilled") {
      overview = mapReservationsOverview(
        reservationsResult.value,
        currentDate,
        agentLimits,
      );
    } else {
      throw reservationsResult.reason;
    }
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "No se pudo cargar el dashboard.";
  }

  return (
    <ReservationsOverview
      formattedHeading={formattedHeading}
      overview={overview}
      errorMessage={errorMessage}
    />
  );
}

function getFormattedHeading(currentDate: Date) {
  const [weekday, date] = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(currentDate)
    .split(", ");

  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}\u00A0\u00A0\u00A0${date}`;
}

function getIsoDate(currentDate: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(currentDate);
}
