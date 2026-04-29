export type ReservationSlotStatusMode = "close" | "reopen";

export type ReservationClosedSlotTarget = {
  date: string;
  formattedDate: string;
  availableTimes: string[];
  initialFromTime?: string;
  initialToTime?: string;
};
