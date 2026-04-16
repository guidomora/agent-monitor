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
  dates: string[];
};

export type ReservationSlotsByDateResponseDto = {
  date: string;
  sheetDate: string;
  slots: ReservationSlotApiDto[];
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

export type UpdateReservationResponseDto = {
  message: string;
  reservation: ReservationApiDto;
};
