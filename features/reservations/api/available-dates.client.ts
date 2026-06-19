import type { AvailableReservationDatesResponseDto } from "@/features/reservations/types/reservations.dto";
import type { ReservationsClientErrorResponse } from "@/features/reservations/types/reservations.api-types";

export async function getAvailableReservationDatesClient() {
  const response = await fetch("/api/reservations/available-dates", {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorPayload =
      (await response.json().catch(() => null)) as ReservationsClientErrorResponse | null;

    throw new Error(
      getClientErrorMessage(errorPayload?.message) ||
        "No se pudieron cargar las fechas disponibles.",
    );
  }

  return (await response.json()) as AvailableReservationDatesResponseDto;
}

function getClientErrorMessage(message?: string | string[]): string | undefined {
  if (Array.isArray(message) && message.length > 0) {
    return message.join(", ");
  }

  return typeof message === "string" ? message : undefined;
}
