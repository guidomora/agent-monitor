import type {
  CloseReservationDayRequestDto,
  CloseReservationDayResponseDto,
  CreateReservationRequestDto,
  CreateReservationResponseDto,
  DeleteReservationRequestDto,
  DeleteReservationResponseDto,
  ReopenReservationDayResponseDto,
  ReservationSlotsByDateResponseDto,
  ReservationsByDateResponseDto,
  UpdateReservationRequestDto,
  UpdateReservationResponseDto,
} from "@/features/reservations/types/reservations.dto";
import type {
  CloseReservationDayClientErrorResponse,
  CreateReservationClientErrorResponse,
  DeleteReservationClientErrorResponse,
  ReopenReservationDayClientErrorResponse,
  ReservationSlotsByDateQuery,
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

export async function getReservationSlotsByDateClient({
  date,
}: ReservationSlotsByDateQuery) {
  const searchParams = new URLSearchParams({ date });
  const response = await fetch(`/api/reservations/slots?${searchParams.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorPayload =
      (await response.json().catch(() => null)) as ReservationsClientErrorResponse | null;
    const message = getClientErrorMessage(errorPayload?.message);

    throw new Error(message || "No se pudieron cargar los horarios disponibles.");
  }

  return (await response.json()) as ReservationSlotsByDateResponseDto;
}

export async function createReservationClient(payload: CreateReservationRequestDto) {
  const response = await fetch("/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload =
      (await response.json().catch(() => null)) as CreateReservationClientErrorResponse | null;
    const message = getClientErrorMessage(errorPayload?.message);

    throw new Error(message || "No se pudo crear la reserva.");
  }

  return (await response.json()) as CreateReservationResponseDto;
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

export async function deleteReservationClient(payload: DeleteReservationRequestDto) {
  const response = await fetch("/api/reservations", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload =
      (await response.json().catch(() => null)) as DeleteReservationClientErrorResponse | null;
    const message = getClientErrorMessage(errorPayload?.message);

    throw new Error(message || "No se pudo eliminar la reserva.");
  }

  return (await response.json()) as DeleteReservationResponseDto;
}

export async function closeReservationDayClient({
  date,
  reason,
}: CloseReservationDayRequestDto) {
  const response = await fetch(`/api/reservations/closed-days/${date}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reason ? { reason } : {}),
  });

  if (!response.ok) {
    const errorPayload =
      (await response.json().catch(() => null)) as CloseReservationDayClientErrorResponse | null;
    const message = getClientErrorMessage(errorPayload?.message);

    throw new Error(message || "No se pudo cerrar la fecha.");
  }

  return (await response.json()) as CloseReservationDayResponseDto;
}

export async function reopenReservationDayClient(date: string) {
  const response = await fetch(`/api/reservations/closed-days/${date}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorPayload =
      (await response.json().catch(() => null)) as ReopenReservationDayClientErrorResponse | null;
    const message = getClientErrorMessage(errorPayload?.message);

    throw new Error(message || "No se pudo reabrir la fecha.");
  }

  return (await response.json()) as ReopenReservationDayResponseDto;
}

function getClientErrorMessage(message?: string | string[]): string | undefined {
  if (Array.isArray(message) && message.length > 0) {
    return message.join(", ");
  }

  return typeof message === "string" ? message : undefined;
}
