import { NextRequest, NextResponse } from "next/server";
import {
  closeReservationSlot,
  reopenReservationSlot,
  ReservationServiceError,
} from "@/features/reservations/api/reservations.service";
import type {
  CloseReservationSlotRequestDto,
  ReopenReservationSlotRequestDto,
} from "@/features/reservations/types/reservations.dto";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    date: string;
  }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const { date } = await context.params;
  let payload: Omit<CloseReservationSlotRequestDto, "date">;

  try {
    payload = (await request.json()) as Omit<CloseReservationSlotRequestDto, "date">;
  } catch {
    return NextResponse.json(
      { message: "No se pudo leer el body de cierre por franja." },
      { status: 400 },
    );
  }

  try {
    const response = await closeReservationSlot({
      date,
      fromTime: payload.fromTime,
      toTime: payload.toTime,
      reason: payload.reason,
    });

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo cerrar la franja horaria.";
    const status = error instanceof ReservationServiceError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { date } = await context.params;
  let payload: Omit<ReopenReservationSlotRequestDto, "date">;

  try {
    payload = (await request.json()) as Omit<ReopenReservationSlotRequestDto, "date">;
  } catch {
    return NextResponse.json(
      { message: "No se pudo leer el body de reapertura por franja." },
      { status: 400 },
    );
  }

  try {
    const response = await reopenReservationSlot({
      date,
      fromTime: payload.fromTime,
      toTime: payload.toTime,
    });

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo reabrir la franja horaria.";
    const status = error instanceof ReservationServiceError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
