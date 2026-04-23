export type ReservationApiDto = {
  date: string;
  time: string;
  name: string;
  phone: string;
  service: string;
  quantity: number;
};

export type ReservationSlotApiDto = {
  time: string;
  reserved: number;
  available: number;
  isClosed: boolean;
  reason: string | null;
};

export type AvailableReservationDateDto = {
  date: string;
  isClosed: boolean;
};

export type ReservationsByDateResponseDto = {
  date: string;
  sheetDate: string;
  reservationsCount: number;
  totalCapacity: number;
  totalPeopleReserved: number;
  reservations: ReservationApiDto[];
  slots: ReservationSlotApiDto[];
};

export type AvailableReservationDatesResponseDto = {
  dates: AvailableReservationDateDto[];
};

export type ReservationSlotsByDateResponseDto = {
  date: string;
  sheetDate: string;
  slots: ReservationSlotApiDto[];
};

export type CreateReservationRequestDto = {
  date: string;
  time: string;
  name: string;
  phone: string;
  quantity: number;
};

export type UpdateReservationRequestDto = {
  phone: string;
  currentDate: string;
  currentTime: string;
  date?: string;
  time?: string;
  name?: string;
  quantity?: number;
};

export type DeleteReservationRequestDto = {
  phone: string;
  currentDate: string;
  currentTime: string;
};

export type UpdateReservationResponseDto = {
  message: string;
  reservation: ReservationApiDto;
};

export type CreateReservationResponseDto = {
  message: string;
  reservation: ReservationApiDto;
};

export type DeleteReservationResponseDto = {
  message: string;
  reservation: ReservationApiDto;
};

export type CloseReservationDayRequestDto = {
  date: string;
  reason?: string;
};

export type CloseReservationDayResponseDto = {
  date: string;
  isClosed: true;
  reason?: string;
  existingReservationsCount: number;
  warning?: string;
};

export type ReopenReservationDayResponseDto = {
  date: string;
  isClosed: false;
};

export type CloseReservationSlotRequestDto = {
  date: string;
  fromTime: string;
  toTime: string;
  reason: string;
};

export type CloseReservationSlotResponseDto = {
  date: string;
  fromTime: string;
  toTime: string;
  isClosed: true;
  reason: string;
  existingReservationsCount: number;
  warning: string | null;
};
