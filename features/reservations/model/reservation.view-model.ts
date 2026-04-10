import type { ReservationTimelineBlock } from "@/features/reservations/model/reservation.types";

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
