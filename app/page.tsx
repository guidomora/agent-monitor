import { ReservationsOverview } from "@/components/reservations-overview";
import { mapReservationsOverview } from "@/lib/reservations/reservations.mapper";
import { getReservationsByDate } from "@/lib/reservations/reservations.service";
import type { ReservationOverviewViewModel } from "@/lib/reservations/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const currentDate = new Date();
  const formattedHeading = getFormattedHeading(currentDate);
  const date = getIsoDate(currentDate);

  let overview: ReservationOverviewViewModel = {
    stats: [
      {
        label: "Reservas tomadas",
        value: "0",
        detail: "",
      },
      {
        label: "Capacidad total",
        value: "0",
        detail: "",
      },
      {
        label: "Conversaciones en curso",
        value: "6",
        detail: "",
      },
      {
        label: "Ocupacion",
        value: "27%",
        detail: "",
      },
    ],
    hourBlocks: [],
  };
  let errorMessage: string | undefined;

  try {
    const reservations = await getReservationsByDate(date);

    overview = mapReservationsOverview(reservations, currentDate);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "No se pudo cargar el dashboard.";
  }

  return (
    <ReservationsOverview
      formattedHeading={formattedHeading}
      overview={overview}
      errorMessage={errorMessage}
    />
  );
}

function getFormattedHeading(currentDate: Date) {
  const [weekday, date] = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(currentDate)
    .split(", ");

  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}\u00A0\u00A0\u00A0${date}`;
}

function getIsoDate(currentDate: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(currentDate);
}
