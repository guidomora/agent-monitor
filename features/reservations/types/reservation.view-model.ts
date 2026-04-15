import type { ReservationTimelineBlock } from "@/features/reservations/types/reservation.types";

export type ReservationOverviewStat = {
  label: string;
  value: string;
  detail: string;
  highlightSuffix?: string;
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
  hourBlocks: ReservationTimelineBlock[];
};
