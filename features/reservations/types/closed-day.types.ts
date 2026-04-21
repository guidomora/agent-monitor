import type { AvailableReservationDateDto } from "@/features/reservations/types/reservations.dto";

export type ReservationClosedDayTarget = {
  date: string;
  formattedDate: string;
  reservationCount: number;
  dayStatus: AvailableReservationDateDto | null;
};
