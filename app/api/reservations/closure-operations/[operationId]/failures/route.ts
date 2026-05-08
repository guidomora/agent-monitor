import { NextRequest, NextResponse } from "next/server";
import {
  getClosureOperationFailures,
  ReservationServiceError,
} from "@/features/reservations/api/reservations.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    operationId: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { operationId } = await context.params;

  try {
    const response = await getClosureOperationFailures(operationId);

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo consultar el estado de las notificaciones.";
    const status = error instanceof ReservationServiceError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
