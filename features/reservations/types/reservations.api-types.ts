export type ReservationsByDateQuery = {
  date: string;
};

export type ReservationSlotsByDateQuery = {
  date: string;
};

export type ReservationsClientErrorResponse = {
  message?: string | string[];
};

export type CreateReservationClientErrorResponse = {
  message?: string | string[];
};

export type UpdateReservationClientErrorResponse = {
  message?: string | string[];
};

export type DeleteReservationClientErrorResponse = {
  message?: string | string[];
};

export type CloseReservationDayClientErrorResponse = {
  message?: string | string[];
};

export type ReopenReservationDayClientErrorResponse = {
  message?: string | string[];
};

export type CloseReservationSlotClientErrorResponse = {
  message?: string | string[];
};

export type ReopenReservationSlotClientErrorResponse = {
  message?: string | string[];
};

export type ClosureOperationFailuresClientErrorResponse = {
  message?: string | string[];
};
