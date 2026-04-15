"use client";

import { useEffect, useMemo, useState } from "react";
import { getAvailableReservationDatesClient } from "@/features/reservations/api/available-dates.client";
import {
  getReservationAgendaBlocks,
  getReservationAgendaDay,
  reservationAgendaDays,
} from "@/features/reservations/data/mock-reservations";

const shortDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
});

const fullDateFormatter = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const todayDate = "2026-04-14";
const fallbackAvailableDates = reservationAgendaDays.map((agendaDay) => agendaDay.date);

export function ReservationsManager() {
  const [availableDates, setAvailableDates] = useState<string[]>(fallbackAvailableDates);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [datesErrorMessage, setDatesErrorMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() =>
    getInitialDate(todayDate, fallbackAvailableDates),
  );
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAvailableDates() {
      try {
        const response = await getAvailableReservationDatesClient();

        if (!isMounted) {
          return;
        }

        const nextDates = response.dates;

        setAvailableDates(nextDates);
        setSelectedDate((currentDate) => getNextSelectedDate(currentDate, nextDates));
        setDatesErrorMessage(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setAvailableDates([]);
        setSelectedDate(todayDate);
        setDatesErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las fechas disponibles.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingDates(false);
        }
      }
    }

    void loadAvailableDates();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasSelectedDateAvailable =
    availableDates.length === 0
      ? selectedDate === todayDate
      : availableDates.includes(selectedDate);
  const selectedDay = hasSelectedDateAvailable
    ? getReservationAgendaDay(selectedDate)
    : null;
  const agendaBlocks = useMemo(
    () => (hasSelectedDateAvailable ? getReservationAgendaBlocks(selectedDate) : []),
    [hasSelectedDateAvailable, selectedDate],
  );
  const selectedDateIndex = availableDates.findIndex((date) => date === selectedDate);
  const previousDate = availableDates[selectedDateIndex - 1] ?? null;
  const nextDate = availableDates[selectedDateIndex + 1] ?? null;
  const minimumAvailableDate = availableDates[0] ?? "";
  const maximumAvailableDate = availableDates[availableDates.length - 1] ?? "";

  return (
    <section className="surface-stack">
      <header className="hero-card hero-card--management">
        <div>
          <p className="dashboard-eyebrow">Gestion de reservas</p>
          <h2>Agenda diaria navegable con acciones sobre cada reserva</h2>
          <p className="hero-copy">
            La navegacion del calendario ahora se alimenta con las fechas
            disponibles del backend. La carga de reservas por fecha sigue
            usando la agenda mock hasta el siguiente paso.
          </p>
        </div>
        <div className="hero-summary">
          <span>Fechas disponibles</span>
          <strong>
            {minimumAvailableDate && maximumAvailableDate
              ? `${formatCompactDate(minimumAvailableDate)} al ${formatCompactDate(maximumAvailableDate)}`
              : "Sin fechas habilitadas"}
          </strong>
          <p className="hero-copy">
            {isLoadingDates
              ? "Consultando agenda general para habilitar la navegacion."
              : `${availableDates.length} fechas disponibles para navegar.`}
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

          {datesErrorMessage ? (
            <div className="management-feedback management-feedback--muted" role="status">
              {datesErrorMessage} Se muestra la fecha actual como referencia, pero la
              navegacion de fechas queda deshabilitada hasta recuperar la agenda real.
            </div>
          ) : null}

          <div className="schedule-toolbar">
            <div className="schedule-toolbar__actions">
              <button
                type="button"
                className="action-button"
                onClick={() => {
                  if (previousDate) {
                    handleDateChange(previousDate, availableDates, setSelectedDate);
                    setPendingAction(null);
                  }
                }}
                disabled={!previousDate || isLoadingDates}
              >
                Dia anterior
              </button>

              <button
                type="button"
                className="action-button"
                onClick={() => {
                  if (nextDate) {
                    handleDateChange(nextDate, availableDates, setSelectedDate);
                    setPendingAction(null);
                  }
                }}
                disabled={!nextDate || isLoadingDates}
              >
                Dia siguiente
              </button>
            </div>

            <label className="schedule-date-field">
              <span>Fecha seleccionada</span>
              <input
                type="date"
                min={minimumAvailableDate}
                max={maximumAvailableDate}
                value={selectedDate}
                onChange={(event) => {
                  const nextSelectedDate = event.target.value;

                  handleDateChange(nextSelectedDate, availableDates, setSelectedDate);
                  setPendingAction(null);
                }}
                disabled={availableDates.length === 0 || isLoadingDates}
              />
            </label>

            <details className="available-dates-popover">
              <summary className="action-button">
                {isLoadingDates ? "Cargando fechas" : "Ver fechas disponibles"}
              </summary>
              <div className="available-dates-list">
                {availableDates.length === 0 ? (
                  <p className="hero-copy">No hay fechas disponibles.</p>
                ) : (
                  availableDates.map((availableDate) => (
                    <button
                      key={availableDate}
                      type="button"
                      className={`available-date-chip${
                        availableDate === selectedDate ? " is-active" : ""
                      }`}
                      onClick={() => {
                        handleDateChange(
                          availableDate,
                          availableDates,
                          setSelectedDate,
                        );
                        setPendingAction(null);
                      }}
                    >
                      {formatLongDate(availableDate)}
                    </button>
                  ))
                )}
              </div>
            </details>
          </div>

          <div className="timeline-list">
            {agendaBlocks.length === 0 ? (
              <div className="note-card">
                <span>Agenda sin bloques</span>
                <strong>No hay reservas mockeadas para la fecha seleccionada</strong>
                <p>
                  La fecha puede venir del backend y estar habilitada para
                  navegar, aunque todavia no tengamos reservas locales cargadas
                  para mostrar en esta pantalla.
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

function getInitialDate(today: string, availableDates: string[]) {
  if (availableDates.length === 0) {
    return today;
  }

  if (availableDates.includes(today)) {
    return today;
  }

  const nextDate = availableDates.find((date) => date >= today);

  return nextDate ?? availableDates[availableDates.length - 1] ?? today;
}

function handleDateChange(
  nextDate: string,
  availableDates: string[],
  setSelectedDate: (value: string) => void,
) {
  if (!availableDates.includes(nextDate)) {
    return;
  }

  setSelectedDate(nextDate);
}

function getNextSelectedDate(currentDate: string, availableDates: string[]) {
  if (availableDates.includes(currentDate)) {
    return currentDate;
  }

  return getInitialDate(todayDate, availableDates);
}

function formatCompactDate(value: string) {
  return shortDateFormatter.format(new Date(`${value}T12:00:00`));
}

function formatLongDate(value: string) {
  const formatted = fullDateFormatter.format(new Date(`${value}T12:00:00`));

  return `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`;
}
