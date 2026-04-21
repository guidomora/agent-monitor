import { NextRequest, NextResponse } from "next/server";
import {
  closeReservationDay,
  ReservationServiceError,
  reopenReservationDay,
} from "@/features/reservations/api/reservations.service";
import type { CloseReservationDayRequestDto } from "@/features/reservations/types/reservations.dto";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    date: string;
  }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const { date } = await context.params;
  let payload: Partial<CloseReservationDayRequestDto> = {};

  try {
    payload = (await request.json()) as Partial<CloseReservationDayRequestDto>;
  } catch {
    payload = {};
  }

  try {
    const response = await closeReservationDay({
      date,
      reason: payload.reason,
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cerrar la fecha.";
    const status = error instanceof ReservationServiceError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { date } = await context.params;

  try {
    const response = await reopenReservationDay(date);

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo reabrir la fecha.";
    const status = error instanceof ReservationServiceError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
