"use client";

import { useMemo, useState } from "react";
import {
  getReservationAgendaBlocks,
  getReservationAgendaDay,
  reservationAgendaDays,
  reservationAgendaRange,
} from "@/features/reservations/data/mock-reservations";

const shortDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
});

const todayDate = "2026-04-14";

export function ReservationsManager() {
  const initialDate = getInitialDate(todayDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const selectedDay = getReservationAgendaDay(selectedDate);
  const agendaBlocks = useMemo(
    () => getReservationAgendaBlocks(selectedDate),
    [selectedDate],
  );
  const selectedDateIndex = reservationAgendaDays.findIndex(
    (agendaDay) => agendaDay.date === selectedDate,
  );
  const previousDate = reservationAgendaDays[selectedDateIndex - 1]?.date ?? null;
  const nextDate = reservationAgendaDays[selectedDateIndex + 1]?.date ?? null;

  return (
    <section className="surface-stack">
      <header className="hero-card hero-card--management">
        <div>
          <p className="dashboard-eyebrow">Gestion de reservas</p>
          <h2>Agenda diaria navegable con acciones sobre cada reserva</h2>
          <p className="hero-copy">
            La vista ya responde al dia seleccionado y limita la navegacion al
            rango disponible. La integracion real con backend queda aislada para
            el siguiente paso.
          </p>
        </div>
        <div className="hero-summary">
          <span>Rango mockeado</span>
          <strong>
            {formatCompactDate(reservationAgendaRange.minDate)} al{" "}
            {formatCompactDate(reservationAgendaRange.maxDate)}
          </strong>
          <p className="hero-copy">
            Hoy se usa data local para validar UX. Luego este rango vendra del
            backend.
          </p>
        </div>
      </header>

      <section>
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <p className="dashboard-eyebrow">Agenda</p>
              <h3>{selectedDay?.label ?? "Fecha sin agenda"}</h3>
            </div>
          </div>

          <div className="schedule-toolbar">
            <button
              type="button"
              className="action-button"
              onClick={() => {
                if (previousDate) {
                  handleDateChange(previousDate, setSelectedDate);
                  setPendingAction(null);
                }
              }}
              disabled={!previousDate}
            >
              Dia anterior
            </button>

            <label className="schedule-date-field">
              <span>Fecha seleccionada</span>
              <input
                type="date"
                min={reservationAgendaRange.minDate}
                max={reservationAgendaRange.maxDate}
                value={selectedDate}
                onChange={(event) => {
                  const nextSelectedDate = event.target.value;

                  handleDateChange(nextSelectedDate, setSelectedDate);
                  setPendingAction(null);
                }}
              />
            </label>

            <button
              type="button"
              className="action-button"
              onClick={() => {
                if (nextDate) {
                  handleDateChange(nextDate, setSelectedDate);
                  setPendingAction(null);
                }
              }}
              disabled={!nextDate}
            >
              Dia siguiente
            </button>
          </div>

          <div className="timeline-list">
            {agendaBlocks.length === 0 ? (
              <div className="note-card">
                <span>Agenda vacia</span>
                <strong>No hay reservas para la fecha seleccionada</strong>
                <p>
                  La fecha se mantiene dentro del rango permitido, pero sin
                  bloques cargados en este mock.
                </p>
              </div>
            ) : (
              agendaBlocks.map((block) => (
                <div key={block.hour} className="timeline-item timeline-item--management">
                  <div className="timeline-item__hour">
                    <div className="timeline-item__hour-header">
                      <strong>{block.hour}</strong>
                    </div>
                    <span>
                      {block.reservations.reduce(
                        (total, reservation) => total + reservation.partySize,
                        0,
                      )}{" "}
                      cubiertos asignados
                    </span>
                  </div>

                  <div className="timeline-item__entries">
                    {block.reservations.map((reservation) => {
                      return (
                        <article
                          key={`${reservation.date}-${reservation.phone}-${reservation.time}`}
                          className="reservation-card"
                        >
                          <button
                            type="button"
                            className="reservation-card__body"
                            onClick={() => setPendingAction(null)}
                          >
                            <p className="reservation-card__time">{reservation.time}</p>
                            <strong>{reservation.guest}</strong>
                            <p>{reservation.partySize} personas</p>
                            <p>{reservation.phone}</p>
                            <p>{reservation.area}</p>
                            <p>{reservation.source}</p>
                            <p className="reservation-card__notes">{reservation.notes}</p>
                          </button>

                          <div className="reservation-card__actions">
                            <button
                              type="button"
                              className="action-button"
                              onClick={() => {
                                setSelectedReservationPhone(reservation.phone);
                                setPendingAction(
                                  `Editar reservado para ${reservation.guest} (${reservation.phone}).`,
                                );
                              }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="action-button action-button--subtle-danger"
                              onClick={() => {
                                setSelectedReservationPhone(reservation.phone);
                                setPendingAction(
                                  `Borrar reservado para ${reservation.guest} (${reservation.phone}).`,
                                );
                              }}
                            >
                              Borrar
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      {pendingAction ? (
        <div className="management-feedback" role="status">
          {pendingAction}
        </div>
      ) : null}
    </section>
  );
}

function getInitialDate(today: string) {
  if (today < reservationAgendaRange.minDate) {
    return reservationAgendaRange.minDate;
  }

  if (today > reservationAgendaRange.maxDate) {
    return reservationAgendaRange.maxDate;
  }

  return getReservationAgendaDay(today)?.date ?? reservationAgendaDays[0]?.date ?? today;
}

function handleDateChange(
  nextDate: string,
  setSelectedDate: (value: string) => void,
) {
  const agendaDay = getReservationAgendaDay(nextDate);

  if (!agendaDay) {
    return;
  }

  setSelectedDate(agendaDay.date);
}

function formatCompactDate(value: string) {
  return shortDateFormatter.format(new Date(`${value}T12:00:00`));
}
