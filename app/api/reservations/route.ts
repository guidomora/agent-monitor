import { NextRequest, NextResponse } from "next/server";
import {
  getReservationsByDate,
  ReservationServiceError,
  updateReservation,
} from "@/features/reservations/api/reservations.service";
import type { UpdateReservationRequestDto } from "@/features/reservations/types/reservations.dto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { message: "La fecha es obligatoria para consultar reservas." },
      { status: 400 },
    );
  }

  try {
    const response = await getReservationsByDate(date);

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudieron obtener las reservas.";
    const status = error instanceof ReservationServiceError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  let payload: UpdateReservationRequestDto;

  try {
    payload = (await request.json()) as UpdateReservationRequestDto;
  } catch {
    return NextResponse.json(
      { message: "No se pudo leer el body de actualizacion." },
      { status: 400 },
    );
  }

  try {
    const response = await updateReservation(payload);

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo actualizar la reserva.";
    const status = error instanceof ReservationServiceError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
