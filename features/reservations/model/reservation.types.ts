import type { ReservationStatus } from "@/features/reservations/model/reservation.enums";

export type ReservationRecord = {
  id: string;
  guest: string;
  time: string;
  phone: string;
  partySize: number;
  source: string;
  area: string;
  notes: string;
  status: ReservationStatus;
};

export type ReservationTimelineItem = {
  id: string;
  guest: string;
  partySize: number;
  phone: string;
  service: string;
  time: string;
};

export type ReservationOccupancyTone =
  | "low"
  | "medium"
  | "high"
  | "full"
  | "empty";

export type ReservationOccupancyIndicator = {
  percentage: number;
  label: string;
  tone: ReservationOccupancyTone;
};

export type ReservationTimelineBlock = {
  hour: string;
  reservationSummary: string;
  capacitySummary: string;
  occupancy: ReservationOccupancyIndicator;
  items: ReservationTimelineItem[];
};
