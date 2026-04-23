import { AxiosError } from "axios";
import { backendApi } from "@/infrastructure/http/backend-api";
import type {
  AvailableReservationDatesResponseDto,
  CloseReservationDayRequestDto,
  CloseReservationDayResponseDto,
  CloseReservationSlotRequestDto,
  CloseReservationSlotResponseDto,
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

type BackendErrorPayload = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export async function getReservationsByDate(date: string) {
  try {
    const response = await backendApi.get<ReservationsByDateResponseDto>(
      "bot/reservations",
      {
        params: { date },
      },
    );

    return response.data;
  } catch (error) {
    throw createReservationServiceError(error, "No se pudieron obtener las reservas.");
  }
}

export async function getAvailableReservationDates() {
  try {
    const response = await backendApi.get<AvailableReservationDatesResponseDto>(
      "bot/reservations/available-dates",
    );

    return response.data;
  } catch (error) {
    throw createReservationServiceError(
      error,
      "No se pudieron obtener las fechas disponibles.",
    );
  }
}

export async function getReservationSlotsByDate(date: string) {
  try {
    const response = await backendApi.get<ReservationSlotsByDateResponseDto>(
      "bot/reservations/slots",
      {
        params: { date },
      },
    );

    return response.data;
  } catch (error) {
    throw createReservationServiceError(
      error,
      "No se pudieron obtener los horarios disponibles.",
    );
  }
}

export async function createReservation(payload: CreateReservationRequestDto) {
  try {
    const response = await backendApi.post<CreateReservationResponseDto>(
      "bot/reservations",
      payload,
      {
        timeout: 30000,
      },
    );

    return response.data;
  } catch (error) {
    throw createReservationServiceError(error, "No se pudo crear la reserva.");
  }
}

export async function updateReservation(payload: UpdateReservationRequestDto) {
  try {
    const response = await backendApi.patch<UpdateReservationResponseDto>(
      "bot/reservations",
      payload,
      {
        timeout: 30000,
      },
    );

    return response.data;
  } catch (error) {
    throw createReservationServiceError(error, "No se pudo actualizar la reserva.");
  }
}

export async function deleteReservation(payload: DeleteReservationRequestDto) {
  try {
    const response = await backendApi.delete<DeleteReservationResponseDto>(
      "bot/reservations",
      {
        data: payload,
        timeout: 30000,
      },
    );

    return response.data;
  } catch (error) {
    throw createReservationServiceError(error, "No se pudo eliminar la reserva.");
  }
}

export async function closeReservationDay({
  date,
  reason,
}: CloseReservationDayRequestDto) {
  try {
    const response = await backendApi.put<CloseReservationDayResponseDto>(
      `bot/reservations/closed-days/${date}`,
      reason ? { reason } : undefined,
      {
        timeout: 30000,
      },
    );

    return response.data;
  } catch (error) {
    throw createReservationServiceError(error, "No se pudo cerrar la fecha.");
  }
}

export async function reopenReservationDay(date: string) {
  try {
    const response = await backendApi.delete<ReopenReservationDayResponseDto>(
      `bot/reservations/closed-days/${date}`,
      {
        timeout: 30000,
      },
    );

    return response.data;
  } catch (error) {
    throw createReservationServiceError(error, "No se pudo reabrir la fecha.");
  }
}

export async function closeReservationSlot({
  date,
  fromTime,
  toTime,
  reason,
}: CloseReservationSlotRequestDto) {
  try {
    const response = await backendApi.put<CloseReservationSlotResponseDto>(
      `bot/reservations/closed-slots/${date}`,
      {
        fromTime,
        toTime,
        reason,
      },
      {
        timeout: 30000,
      },
    );

    return response.data;
  } catch (error) {
    throw createReservationServiceError(error, "No se pudo cerrar la franja horaria.");
  }
}

export class ReservationServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ReservationServiceError";
  }
}

function createReservationServiceError(error: unknown, fallbackMessage: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as BackendErrorPayload | undefined;
    const status = error.response?.status ?? 500;

    if (Array.isArray(data?.message) && data.message.length > 0) {
      return new ReservationServiceError(data.message.join(", "), status);
    }

    if (typeof data?.message === "string" && data.message.length > 0) {
      return new ReservationServiceError(data.message, status);
    }

    if (error.response) {
      return new ReservationServiceError(`${fallbackMessage} (${error.response.status}).`, status);
    }
  }

  return new ReservationServiceError(fallbackMessage, 500);
}
