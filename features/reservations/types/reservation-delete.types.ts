import type { ReservationTimelineItem } from "@/features/reservations/types/reservation.types";

export type ReservationDeleteTarget = {
  currentDate: string;
  reservation: ReservationTimelineItem;
};
