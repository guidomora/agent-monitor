import type { ReservationsByDateResponseDto } from "@/features/reservations/types/reservations.dto";
import type {
  ReservationsByDateQuery,
  ReservationsClientErrorResponse,
} from "@/features/reservations/types/reservations.api-types";

export async function getReservationsByDateClient({
  date,
}: ReservationsByDateQuery) {
  const searchParams = new URLSearchParams({ date });
  const response = await fetch(`/api/reservations?${searchParams.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorPayload =
      (await response.json().catch(() => null)) as ReservationsClientErrorResponse | null;

    throw new Error(errorPayload?.message || "No se pudieron cargar las reservas.");
  }

  return (await response.json()) as ReservationsByDateResponseDto;
}
