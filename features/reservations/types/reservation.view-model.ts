import type { ReservationTimelineBlock } from "@/features/reservations/types/reservation.types";

export type ReservationOverviewStat = {
  label: string;
  value: string;
  detail: string;
  highlightSuffix?: string;
  rows?: ReservationOverviewStatRow[];
};

export type ReservationOverviewStatRow = {
  label: string;
  value: string;
};

export type ReservationOverviewViewModel = {
  stats: ReservationOverviewStat[];
  hourBlocks: ReservationTimelineBlock[];
};

export type ReservationManagementViewModel = {
  date: string;
  formattedDateLabel: string;
  reservationCount: number;
  totalPeopleReserved: number;
  totalCapacity: number;
  closedSlotCount: number;
  slotTimes: string[];
  hourBlocks: ReservationTimelineBlock[];
};
