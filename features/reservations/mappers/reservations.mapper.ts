import type {
  ReservationApiDto,
  ReservationSlotApiDto,
  ReservationsByDateResponseDto,
} from "@/features/reservations/api/reservations.dto";
import type {
  ReservationTimelineBlock,
  ReservationTimelineItem,
} from "@/features/reservations/model/reservation.types";
import type { ReservationOverviewViewModel } from "@/features/reservations/model/reservation.view-model";

const MOCK_CONVERSATIONS_IN_PROGRESS = "6";
const MOCK_OCCUPANCY = "27%";

export function mapReservationsOverview(
  response: ReservationsByDateResponseDto,
  currentDate: Date,
): ReservationOverviewViewModel {
  return {
    stats: [
      {
        label: "Reservas tomadas",
        value: String(response.reservationsCount),
        detail: "",
      },
      {
        label: "Capacidad total",
        value: String(response.totalCapacity),
        detail: "",
      },
      {
        label: "Conversaciones en curso",
        value: MOCK_CONVERSATIONS_IN_PROGRESS,
        detail: "",
      },
      {
        label: "Ocupacion",
        value: MOCK_OCCUPANCY.replace("%", ""),
        detail: "",
        highlightSuffix: "%",
      },
    ],
    hourBlocks: getVisibleHourBlocks(response, currentDate),
  };
}

function getVisibleHourBlocks(
  response: ReservationsByDateResponseDto,
  currentDate: Date,
) {
  const groupedReservations = groupReservationsByHour(response.reservations);
  const minimumVisibleHour = currentDate.getHours();

  return Array.from(groupedReservations.entries())
    .sort(([leftHour], [rightHour]) => leftHour.localeCompare(rightHour))
    .filter(([hour]) => {
      const numericHour = Number.parseInt(hour.slice(0, 2), 10);

      return numericHour >= minimumVisibleHour;
    })
    .map(([hour, items]) => {
      const slot = response.slots.find((entry) => entry.time === hour);

      return createTimelineBlock(hour, items, slot);
    });
}

function groupReservationsByHour(reservations: ReservationApiDto[]) {
  const grouped = new Map<string, ReservationTimelineItem[]>();

  for (const reservation of reservations) {
    const hour = normalizeHour(reservation.time);
    const currentItems = grouped.get(hour) ?? [];

    currentItems.push({
      id: `${reservation.phone}-${reservation.time}-${reservation.name}`,
      guest: reservation.name,
      partySize: reservation.quantity,
      phone: reservation.phone,
      service: reservation.service,
      time: reservation.time,
    });

    grouped.set(hour, currentItems);
  }

  return grouped;
}

function createTimelineBlock(
  hour: string,
  items: ReservationTimelineItem[],
  slot?: ReservationSlotApiDto,
): ReservationTimelineBlock {
  const sortedItems = [...items].sort((left, right) =>
    left.time.localeCompare(right.time),
  );
  const totalReserved = sortedItems.reduce(
    (accumulator, item) => accumulator + item.partySize,
    0,
  );
  const reserved = slot?.reserved ?? totalReserved;

  return {
    hour,
    reservationSummary: `${sortedItems.length} ${
      sortedItems.length === 1 ? "reserva" : "reservas"
    }`,
    capacitySummary: `${reserved} cubiertos tomados`,
    items: sortedItems,
  };
}

function normalizeHour(time: string) {
  return `${time.slice(0, 2)}:00`;
}
