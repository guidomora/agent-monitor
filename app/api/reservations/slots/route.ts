import { NextRequest, NextResponse } from "next/server";
import {
  getReservationSlotsByDate,
  ReservationServiceError,
} from "@/features/reservations/api/reservations.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { message: "La fecha es obligatoria para consultar horarios." },
      { status: 400 },
    );
  }

  try {
    const response = await getReservationSlotsByDate(date);

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudieron obtener los horarios disponibles.";
    const status = error instanceof ReservationServiceError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
