import type {
  ReservationAgendaBlock,
  ReservationAgendaDay,
  ReservationAgendaRange,
} from "@/features/reservations/model/reservation.types";

export const reservationAgendaRange: ReservationAgendaRange = {
  minDate: "2026-04-09",
  maxDate: "2026-04-20",
};

export const reservationAgendaDays: ReservationAgendaDay[] = [
  {
    date: "2026-04-09",
    label: "Jueves 09/04/2026",
    serviceNotes: "Primer servicio completo tras la reapertura del patio cubierto.",
    reservations: [
      {
        date: "2026-04-09",
        guest: "Martina Ferreyra",
        time: "19:30",
        phone: "+54 11 6421-2214",
        partySize: 4,
        source: "WhatsApp",
        area: "Salon principal",
        notes: "Celebracion. Preferencia por salon principal.",
        status: "Confirmada",
      },
      {
        date: "2026-04-09",
        guest: "Lucas Mirande",
        time: "20:15",
        phone: "+54 11 5791-1188",
        partySize: 2,
        source: "Web",
        area: "Ventanal",
        notes: "Mesa tranquila, sin alergias reportadas.",
        status: "Pendiente",
      },
      {
        date: "2026-04-09",
        guest: "Clara Sosa",
        time: "21:00",
        phone: "+54 11 4030-8291",
        partySize: 6,
        source: "Telefono",
        area: "Privado",
        notes: "Cena familiar con ninos. Pedir silla alta.",
        status: "Confirmada",
      },
    ],
  },
  {
    date: "2026-04-12",
    label: "Domingo 12/04/2026",
    serviceNotes: "Servicio corto con alta rotacion de mesas desde las 13 hs.",
    reservations: [
      {
        date: "2026-04-12",
        guest: "Rocio Marin",
        time: "13:00",
        phone: "+54 11 6860-2284",
        partySize: 3,
        source: "WhatsApp",
        area: "Patio cubierto",
        notes: "Una persona llega mas tarde.",
        status: "Check-in",
      },
      {
        date: "2026-04-12",
        guest: "Bruno Tedesco",
        time: "14:30",
        phone: "+54 11 5176-3400",
        partySize: 5,
        source: "Manual",
        area: "Salon principal",
        notes: "Cumpleanos. Lleva torta.",
        status: "Confirmada",
      },
    ],
  },
  {
    date: "2026-04-14",
    label: "Martes 14/04/2026",
    serviceNotes: "Turno operativo normal. Se esperan mas consultas entrantes por WhatsApp.",
    reservations: [
      {
        date: "2026-04-14",
        guest: "Tomas Rinaldi",
        time: "19:30",
        phone: "+54 11 5123-8810",
        partySize: 2,
        source: "Web",
        area: "Patio cubierto",
        notes: "Aniversario, pedir mesa lateral.",
        status: "Confirmada",
      },
      {
        date: "2026-04-14",
        guest: "Carla Mendez",
        time: "20:00",
        phone: "+54 11 6044-1120",
        partySize: 5,
        source: "WhatsApp",
        area: "Salon principal",
        notes: "Llega con una nina. Requiere silla.",
        status: "Pendiente",
      },
      {
        date: "2026-04-14",
        guest: "Agustin Fava",
        time: "20:30",
        phone: "+54 11 4900-7122",
        partySize: 3,
        source: "Telefono",
        area: "Barra alta",
        notes: "Cliente frecuente.",
        status: "Confirmada",
      },
      {
        date: "2026-04-14",
        guest: "Julieta Castro",
        time: "21:00",
        phone: "+54 11 6880-9914",
        partySize: 6,
        source: "Manual",
        area: "Privado",
        notes: "Pre-cierra menu degustacion.",
        status: "Check-in",
      },
      {
        date: "2026-04-14",
        guest: "Santiago Barreto",
        time: "22:00",
        phone: "+54 11 4021-1212",
        partySize: 4,
        source: "WhatsApp",
        area: "Ventanal",
        notes: "Consultar alergia a frutos secos.",
        status: "Cancelada",
      },
    ],
  },
  {
    date: "2026-04-16",
    label: "Jueves 16/04/2026",
    serviceNotes: "Noche de alta ocupacion en salon principal.",
    reservations: [
      {
        date: "2026-04-16",
        guest: "Micaela Diaz",
        time: "19:00",
        phone: "+54 11 7011-9181",
        partySize: 4,
        source: "Instagram",
        area: "Salon principal",
        notes: "Pide mesa cerca de la entrada.",
        status: "Pendiente",
      },
      {
        date: "2026-04-16",
        guest: "Pablo Acosta",
        time: "21:00",
        phone: "+54 11 6244-7780",
        partySize: 2,
        source: "Web",
        area: "Patio cubierto",
        notes: "Cena rapida antes del teatro.",
        status: "Confirmada",
      },
      {
        date: "2026-04-16",
        guest: "Jimena Lopez",
        time: "21:30",
        phone: "+54 11 3894-6102",
        partySize: 8,
        source: "WhatsApp",
        area: "Privado",
        notes: "Grupo grande. Confirmar menu cerrado.",
        status: "Confirmada",
      },
    ],
  },
  {
    date: "2026-04-20",
    label: "Lunes 20/04/2026",
    serviceNotes: "Ultima fecha habilitada en la agenda mock para pruebas de rango.",
    reservations: [
      {
        date: "2026-04-20",
        guest: "Paula Nardi",
        time: "20:00",
        phone: "+54 11 5900-4401",
        partySize: 2,
        source: "Telefono",
        area: "Barra alta",
        notes: "Sin notas especiales.",
        status: "Confirmada",
      },
    ],
  },
];

export function getReservationAgendaDay(date: string) {
  return reservationAgendaDays.find((day) => day.date === date) ?? null;
}

export function getReservationAgendaBlocks(date: string): ReservationAgendaBlock[] {
  const reservations = getReservationAgendaDay(date)?.reservations ?? [];
  const blocks = new Map<string, typeof reservations>();

  for (const reservation of reservations) {
    const currentReservations = blocks.get(normalizeHour(reservation.time)) ?? [];

    currentReservations.push(reservation);
    blocks.set(normalizeHour(reservation.time), currentReservations);
  }

  return Array.from(blocks.entries())
    .sort(([leftHour], [rightHour]) => leftHour.localeCompare(rightHour))
    .map(([hour, hourReservations]) => ({
      hour,
      reservations: [...hourReservations].sort((left, right) =>
        left.time.localeCompare(right.time),
      ),
    }));
}

function normalizeHour(time: string) {
  return `${time.slice(0, 2)}:00`;
}
