export type ReservationsByDateQuery = {
  date: string;
};

export type ReservationSlotsByDateQuery = {
  date: string;
};

export type ReservationsClientErrorResponse = {
  message?: string | string[];
};

export type UpdateReservationClientErrorResponse = {
  message?: string | string[];
};
