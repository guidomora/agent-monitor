import type {
  ReservationsByDateResponseDto,
  UpdateReservationRequestDto,
  UpdateReservationResponseDto,
} from "@/features/reservations/types/reservations.dto";
import type {
  ReservationsByDateQuery,
  ReservationsClientErrorResponse,
  UpdateReservationClientErrorResponse,
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
    const message = getClientErrorMessage(errorPayload?.message);

    throw new Error(message || "No se pudieron cargar las reservas.");
  }

  return (await response.json()) as ReservationsByDateResponseDto;
}

export async function updateReservationClient(payload: UpdateReservationRequestDto) {
  const response = await fetch("/api/reservations", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload =
      (await response.json().catch(() => null)) as UpdateReservationClientErrorResponse | null;
    const message = getClientErrorMessage(errorPayload?.message);

    throw new Error(message || "No se pudo actualizar la reserva.");
  }

  return (await response.json()) as UpdateReservationResponseDto;
}

function getClientErrorMessage(message?: string | string[]): string | undefined {
  if (Array.isArray(message) && message.length > 0) {
    return message.join(", ");
  }

  return typeof message === "string" ? message : undefined;
}
