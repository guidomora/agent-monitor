import type { ReservationTimelineItem } from "@/features/reservations/types/reservation.types";

export type ReservationEditTarget = {
  currentDate: string;
  reservation: ReservationTimelineItem;
};

export type ReservationEditFormValues = {
  date: string;
  time: string;
  name: string;
  quantity: string;
};
