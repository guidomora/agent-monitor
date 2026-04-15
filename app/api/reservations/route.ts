import { NextRequest, NextResponse } from "next/server";
import { getReservationsByDate } from "@/features/reservations/api/reservations.service";

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

    return NextResponse.json({ message }, { status: 500 });
  }
}
