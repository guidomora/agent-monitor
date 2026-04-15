import type { AvailableReservationDatesResponseDto } from "@/features/reservations/types/reservations.dto";

type AvailableDatesErrorResponse = {
  message?: string;
};

export async function getAvailableReservationDatesClient() {
  const response = await fetch("/api/reservations/available-dates", {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorPayload =
      (await response.json().catch(() => null)) as AvailableDatesErrorResponse | null;

    throw new Error(
      errorPayload?.message || "No se pudieron cargar las fechas disponibles.",
    );
  }

  return (await response.json()) as AvailableReservationDatesResponseDto;
}
