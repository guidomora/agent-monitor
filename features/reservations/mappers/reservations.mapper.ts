import type {
  ReservationApiDto,
  ReservationSlotApiDto,
  ReservationsByDateResponseDto,
} from "@/features/reservations/types/reservations.dto";
import type {
  ReservationOccupancyIndicator,
  ReservationTimelineBlock,
  ReservationTimelineItem,
} from "@/features/reservations/types/reservation.types";
import type {
  ReservationManagementViewModel,
  ReservationOverviewStat,
  ReservationOverviewViewModel,
} from "@/features/reservations/types/reservation.view-model";
import type { AgentReservationLimits } from "@/features/billing/model/agent-limits.types";

const MOCK_CONVERSATIONS_IN_PROGRESS = "6";

export function mapReservationsOverview(
  response: ReservationsByDateResponseDto,
  currentDate: Date,
  agentLimits?: AgentReservationLimits | null,
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
      createAgentLimitsStat(agentLimits),
    ],
    hourBlocks: getVisibleHourBlocks(response, currentDate),
  };
}

export function createEmptyReservationsOverview(
  agentLimits?: AgentReservationLimits | null,
): ReservationOverviewViewModel {
  return {
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
        value: MOCK_CONVERSATIONS_IN_PROGRESS,
        detail: "",
      },
      createAgentLimitsStat(agentLimits),
    ],
    hourBlocks: [],
  };
}

export function mapReservationManagement(
  response: ReservationsByDateResponseDto,
): ReservationManagementViewModel {
  const hourBlocks = getAllHourBlocks(response);

  return {
    date: response.date,
    formattedDateLabel: formatFullDateLabel(response.date),
    reservationCount: response.reservationsCount,
    totalPeopleReserved: response.totalPeopleReserved,
    totalCapacity: response.totalCapacity,
    closedSlotCount: hourBlocks.filter((block) => block.isClosed).length,
    slotTimes: response.slots
      .map((slot) => slot.time)
      .sort((leftTime, rightTime) => leftTime.localeCompare(rightTime)),
    hourBlocks,
  };
}

function getAllHourBlocks(response: ReservationsByDateResponseDto) {
  const groupedReservations = groupReservationsByHour(response.reservations);
  const allHours = new Set<string>();

  for (const slot of response.slots) {
    allHours.add(slot.time);
  }

  for (const hour of groupedReservations.keys()) {
    allHours.add(hour);
  }

  return Array.from(allHours)
    .sort((leftHour, rightHour) => leftHour.localeCompare(rightHour))
    .map((hour) => {
      const items = groupedReservations.get(hour) ?? [];
      const slot = response.slots.find((entry) => entry.time === hour);

      return createTimelineBlock(hour, items, slot);
    });
}

function getVisibleHourBlocks(
  response: ReservationsByDateResponseDto,
  currentDate: Date,
) {
  const groupedReservations = groupReservationsByHour(response.reservations);
  const minimumVisibleHour = currentDate.getHours();

  const visibleHours = new Set<string>();

  for (const slot of response.slots) {
    if (isVisibleHour(slot.time, minimumVisibleHour)) {
      visibleHours.add(slot.time);
    }
  }

  for (const hour of groupedReservations.keys()) {
    if (isVisibleHour(hour, minimumVisibleHour)) {
      visibleHours.add(hour);
    }
  }

  return Array.from(visibleHours)
    .sort((leftHour, rightHour) => leftHour.localeCompare(rightHour))
    .map((hour) => {
      const items = groupedReservations.get(hour) ?? [];
      const slot = response.slots.find((entry) => entry.time === hour);

      return createTimelineBlock(hour, items, slot);
    });
}

function isVisibleHour(hour: string, minimumVisibleHour: number) {
  const numericHour = Number.parseInt(hour.slice(0, 2), 10);

  return numericHour >= minimumVisibleHour;
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
  const totalReservedFromItems = sortedItems.reduce(
    (accumulator, item) => accumulator + item.partySize,
    0,
  );
  const reserved = slot?.reserved ?? totalReservedFromItems;
  const totalCapacity = slot ? slot.reserved + slot.available : totalReservedFromItems;
  const occupancy = createOccupancyIndicator(reserved, totalCapacity);

  return {
    hour,
    reservationSummary: `${sortedItems.length} ${
      sortedItems.length === 1 ? "reserva" : "reservas"
    }`,
    capacitySummary:
      totalCapacity > 0
        ? `${reserved}/${totalCapacity} cubiertos tomados`
        : `${reserved} cubiertos tomados`,
    occupancy,
    isClosed: slot?.isClosed ?? false,
    closedReason: slot?.reason ?? null,
    items: sortedItems,
  };
}

function createOccupancyIndicator(
  reserved: number,
  totalCapacity: number,
): ReservationOccupancyIndicator {
  if (totalCapacity <= 0) {
    return {
      percentage: 0,
      label: "Sin cupo",
      tone: "empty",
    };
  }

  const percentage = getOccupancyPercentage(reserved, totalCapacity);

  if (percentage >= 100) {
    return {
      percentage,
      label: `Ocupacion ${percentage}%`,
      tone: "full",
    };
  }

  if (percentage >= 80) {
    return {
      percentage,
      label: `Ocupacion ${percentage}%`,
      tone: "high",
    };
  }

  if (percentage >= 50) {
    return {
      percentage,
      label: `Ocupacion ${percentage}%`,
      tone: "medium",
    };
  }

  return {
    percentage,
    label: `Ocupacion ${percentage}%`,
    tone: "low",
  };
}

function getOccupancyPercentage(reserved: number, totalCapacity: number) {
  if (totalCapacity <= 0) {
    return 0;
  }

  const rawPercentage = (reserved / totalCapacity) * 100;

  return Math.min(100, Math.round(rawPercentage));
}

function createAgentLimitsStat(
  agentLimits?: AgentReservationLimits | null,
): ReservationOverviewStat {
  if (!agentLimits || agentLimits.state === "unavailable") {
    return {
      label: "Limites del agente",
      value: "-",
      detail: getUnavailableAgentLimitsDetail(agentLimits?.unavailableReason),
      rows: [
        {
          label: "Reservas tomadas",
          value: "-",
        },
        {
          label: "Disponibles",
          value: "-",
        },
      ],
    };
  }

  return {
    label: "Limites del agente",
    value: "",
    detail: getAgentLimitsDetail(agentLimits),
    rows: [
      {
        label: "Reservas tomadas",
        value: String(agentLimits.used),
      },
      {
        label: "Disponibles",
        value:
          agentLimits.state === "unlimited" ? "Sin limite" : String(agentLimits.remaining),
      },
    ],
  };
}

function getAgentLimitsDetail(agentLimits: AgentReservationLimits) {
  const planDetail = agentLimits.planName ? `Plan ${agentLimits.planName}` : "Plan";

  return `Plan: ${planDetail} - Periodo: ${agentLimits.period}`;
}

function getUnavailableAgentLimitsDetail(
  unavailableReason?: AgentReservationLimits["unavailableReason"],
) {
  if (unavailableReason === "missing_active_subscription") {
    return "No hay una suscripcion activa para este cliente.";
  }

  if (unavailableReason === "inactive_plan") {
    return "El plan configurado no esta activo.";
  }

  if (unavailableReason === "invalid_plan_limit") {
    return "El limite del plan no esta configurado correctamente.";
  }

  return "No se pudo consultar el limite del plan.";
}

function normalizeHour(time: string) {
  return `${time.slice(0, 2)}:00`;
}

function formatFullDateLabel(value: string) {
  const formatter = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formatted = formatter.format(new Date(`${value}T12:00:00`));

  return `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`;
}
