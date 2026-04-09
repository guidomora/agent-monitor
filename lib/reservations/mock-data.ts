export type ReservationStatus =
  | "Confirmada"
  | "Pendiente"
  | "Check-in"
  | "Cancelada";

export type ReservationRecord = {
  id: string;
  guest: string;
  time: string;
  phone: string;
  partySize: number;
  source: string;
  area: string;
  notes: string;
  status: ReservationStatus;
};

export const reservationDailyStats = [
  {
    label: "Reservas activas",
    value: "28",
    detail: "4 ingresos en la proxima hora",
  },
  {
    label: "Cubiertos confirmados",
    value: "116",
    detail: "Promedio de 4.1 personas por mesa",
  },
  {
    label: "Pendientes de confirmacion",
    value: "6",
    detail: "3 llegaron por WhatsApp hoy",
  },
  {
    label: "No shows estimados",
    value: "2",
    detail: "Segmento a revisar con automatizaciones",
  },
];

export const reservationList: ReservationRecord[] = [
  {
    id: "r-101",
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
    id: "r-102",
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
    id: "r-103",
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
    id: "r-104",
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
    id: "r-105",
    guest: "Santiago Barreto",
    time: "22:00",
    phone: "+54 11 4021-1212",
    partySize: 4,
    source: "WhatsApp",
    area: "Ventanal",
    notes: "Consultar alergia a frutos secos.",
    status: "Cancelada",
  },
];

export const reservationHourBlocks = [
  {
    hour: "19:00",
    summary: "Apertura del primer flujo de mesas",
    items: [
      {
        id: "block-1",
        guest: "Tomas Rinaldi",
        partySize: 2,
        source: "Web",
        status: "Confirmada",
      },
      {
        id: "block-2",
        guest: "Micaela Diaz",
        partySize: 4,
        source: "Instagram / DM",
        status: "Pendiente",
      },
    ],
  },
  {
    hour: "20:00",
    summary: "Pico temprano con mesas grandes",
    items: [
      {
        id: "block-3",
        guest: "Carla Mendez",
        partySize: 5,
        source: "WhatsApp",
        status: "Pendiente",
      },
      {
        id: "block-4",
        guest: "Agustin Fava",
        partySize: 3,
        source: "Telefono",
        status: "Confirmada",
      },
    ],
  },
  {
    hour: "21:00",
    summary: "Turno fuerte con check-ins en curso",
    items: [
      {
        id: "block-5",
        guest: "Julieta Castro",
        partySize: 6,
        source: "Manual",
        status: "Check-in",
      },
      {
        id: "block-6",
        guest: "Pablo Acosta",
        partySize: 2,
        source: "Web",
        status: "Confirmada",
      },
    ],
  },
];

export const reservationOperationalNotes = [
  {
    tag: "Capacidad",
    title: "El privado llega al 100% a las 21:00",
    description:
      "Conviene frenar nuevas confirmaciones para ese sector o redirigir desde el formulario.",
  },
  {
    tag: "WhatsApp",
    title: "Hay 3 consultas sin transformar en reserva",
    description:
      "La idea es cruzar luego esta tarjeta con el viewer para convertir conversaciones en acciones.",
  },
  {
    tag: "Seguimiento",
    title: "2 reservas necesitan reconfirmacion humana",
    description:
      "Mock pensado para futuras acciones de llamar, escribir o reasignar mesa desde la misma UI.",
  },
];
