import { AxiosError } from "axios";
import { backendApi } from "@/infrastructure/http/backend-api";
import type {
  AvailableReservationDatesResponseDto,
  ReservationsByDateResponseDto,
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
    throw new Error(getReservationsErrorMessage(error));
  }
}

export async function getAvailableReservationDates() {
  try {
    const response = await backendApi.get<AvailableReservationDatesResponseDto>(
      "bot/reservations/available-dates",
    );

    return response.data;
  } catch (error) {
    throw new Error(getAvailableDatesErrorMessage(error));
  }
}

function getReservationsErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as BackendErrorPayload | undefined;

    if (Array.isArray(data?.message) && data.message.length > 0) {
      return data.message.join(", ");
    }

    if (typeof data?.message === "string" && data.message.length > 0) {
      return data.message;
    }

    if (error.response) {
      return `No se pudieron obtener las reservas (${error.response.status}).`;
    }
  }

  return "No se pudieron obtener las reservas.";
}

function getAvailableDatesErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as BackendErrorPayload | undefined;

    if (Array.isArray(data?.message) && data.message.length > 0) {
      return data.message.join(", ");
    }

    if (typeof data?.message === "string" && data.message.length > 0) {
      return data.message;
    }

    if (error.response) {
      return `No se pudieron obtener las fechas disponibles (${error.response.status}).`;
    }
  }

  return "No se pudieron obtener las fechas disponibles.";
}
