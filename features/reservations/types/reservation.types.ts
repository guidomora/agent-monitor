import type { ReservationStatus } from "@/features/reservations/types/reservation.enums";

export type ReservationRecord = {
  date: string;
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

export type ReservationAgendaBlock = {
  hour: string;
  reservations: ReservationRecord[];
};

export type ReservationAgendaDay = {
  date: string;
  label: string;
  serviceNotes: string;
  reservations: ReservationRecord[];
};

export type ReservationAgendaRange = {
  minDate: string;
  maxDate: string;
};
