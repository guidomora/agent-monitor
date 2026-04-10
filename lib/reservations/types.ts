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

export type ReservationsByDateResponse = {
  date: string;
  sheetDate: string;
  reservationsCount: number;
  totalCapacity: number;
  totalPeopleReserved: number;
  reservations: ReservationApiDto[];
  slots: ReservationSlotApiDto[];
};

export type ReservationTimelineItem = {
  id: string;
  guest: string;
  partySize: number;
  phone: string;
  service: string;
  time: string;
};

export type ReservationTimelineBlock = {
  hour: string;
  reservationSummary: string;
  capacitySummary: string;
  items: ReservationTimelineItem[];
};

export type ReservationOverviewStat = {
  label: string;
  value: string;
  detail: string;
  highlightSuffix?: string;
};

export type ReservationOverviewViewModel = {
  stats: ReservationOverviewStat[];
  hourBlocks: ReservationTimelineBlock[];
};
