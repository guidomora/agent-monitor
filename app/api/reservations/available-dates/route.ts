import { NextResponse } from "next/server";
import { getAvailableReservationDates } from "@/features/reservations/api/reservations.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await getAvailableReservationDates();

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudieron obtener las fechas disponibles.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
