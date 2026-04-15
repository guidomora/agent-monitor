"use client";

import { useEffect, useState } from "react";
import { getAvailableReservationDatesClient } from "@/features/reservations/api/available-dates.client";
import { getReservationsByDateClient } from "@/features/reservations/api/reservations.client";
import { mapReservationManagement } from "@/features/reservations/mappers/reservations.mapper";
import type { ReservationManagementViewModel } from "@/features/reservations/types/reservation.view-model";

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

export function ReservationsManager() {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [datesErrorMessage, setDatesErrorMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [reservationsViewModel, setReservationsViewModel] =
    useState<ReservationManagementViewModel | null>(null);
  const [isLoadingReservations, setIsLoadingReservations] = useState(true);
  const [reservationsErrorMessage, setReservationsErrorMessage] = useState<string | null>(
    null,
  );
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isDatesModalOpen, setIsDatesModalOpen] = useState(false);

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

  useEffect(() => {
    let isMounted = true;

    async function loadReservations() {
      setIsLoadingReservations(true);
      setReservationsErrorMessage(null);

      try {
        const response = await getReservationsByDateClient({ date: selectedDate });

        if (!isMounted) {
          return;
        }

        setReservationsViewModel(mapReservationManagement(response));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setReservationsViewModel(null);
        setReservationsErrorMessage(
          error instanceof Error ? error.message : "No se pudieron cargar las reservas.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingReservations(false);
        }
      }
    }

    void loadReservations();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  useEffect(() => {
    if (!isDatesModalOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDatesModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDatesModalOpen]);

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
            La navegacion del calendario y la agenda diaria se alimentan desde
            el backend segun la fecha seleccionada.
          </p>
        </div>
        <div className="hero-summary">
          <button
            type="button"
            className="hero-summary__trigger"
            onClick={() => {
              if (!isLoadingDates) {
                setIsDatesModalOpen(true);
              }
            }}
            disabled={isLoadingDates}
          >
            {isLoadingDates ? "Cargando fechas" : "Ver fechas disponibles"}
          </button>
          <strong className="hero-summary__range">
            {minimumAvailableDate && maximumAvailableDate
              ? (
                <>
                  {formatCompactDate(minimumAvailableDate)}
                  <span className="hero-summary__separator" aria-hidden="true">
                    al
                  </span>
                  {formatCompactDate(maximumAvailableDate)}
                </>
              )
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
              <h3>
                {reservationsViewModel?.formattedDateLabel ??
                  formatLongDate(selectedDate)}
              </h3>
            </div>
          </div>

          {datesErrorMessage ? (
            <div className="management-feedback management-feedback--muted" role="status">
              {datesErrorMessage} Se mantiene la fecha actual como referencia hasta
              recuperar la agenda real.
            </div>
          ) : null}

          <div className="schedule-toolbar">
            <button
              type="button"
              className="action-button action-button--compact schedule-toolbar__nav-button"
              onClick={() => {
                if (previousDate) {
                  handleDateChange(previousDate, availableDates, setSelectedDate);
                  setPendingAction(null);
                }
              }}
              disabled={!previousDate || isLoadingDates}
            >
              &lt; Dia anterior
            </button>

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

            <button
              type="button"
              className="action-button action-button--compact schedule-toolbar__nav-button schedule-toolbar__nav-button--next"
              onClick={() => {
                if (nextDate) {
                  handleDateChange(nextDate, availableDates, setSelectedDate);
                  setPendingAction(null);
                }
              }}
              disabled={!nextDate || isLoadingDates}
            >
              Dia siguiente &gt;
            </button>
          </div>

          {reservationsErrorMessage ? (
            <div className="note-card">
              <span>Error</span>
              <strong>No se pudo cargar la agenda de la fecha seleccionada</strong>
              <p>{reservationsErrorMessage}</p>
            </div>
          ) : null}

          {reservationsViewModel ? (
            <div className="stats-grid" aria-label="Resumen de reservas para la fecha">
              <article className="stat-card">
                <span>Reservas tomadas</span>
                <strong>{reservationsViewModel.reservationCount}</strong>
                <p>Reservas cargadas para la fecha elegida.</p>
              </article>
              <article className="stat-card">
                <span>Cubiertos reservados</span>
                <strong>{reservationsViewModel.totalPeopleReserved}</strong>
                <p>Suma de personas entre todas las reservas del dia.</p>
              </article>
              <article className="stat-card">
                <span>Capacidad total</span>
                <strong>{reservationsViewModel.totalCapacity}</strong>
                <p>Cupo total informado por la agenda del backend.</p>
              </article>
            </div>
          ) : null}

          <div className="timeline-list">
            {isLoadingReservations ? (
              <div className="note-card">
                <span>Cargando agenda</span>
                <strong>Consultando reservas para {formatLongDate(selectedDate)}</strong>
                <p>Esperando respuesta del backend para actualizar la grilla.</p>
              </div>
            ) : null}

            {!isLoadingReservations &&
            !reservationsErrorMessage &&
            reservationsViewModel?.hourBlocks.length === 0 ? (
              <div className="note-card">
                <span>Agenda sin bloques</span>
                <strong>No hay reservas para la fecha seleccionada</strong>
                <p>
                  La fecha esta habilitada en agenda, pero no devolvio reservas ni
                  franjas con ocupacion visible.
                </p>
              </div>
            ) : null}

            {!isLoadingReservations &&
            !reservationsErrorMessage &&
            reservationsViewModel ? (
              reservationsViewModel.hourBlocks.map((block) => (
                <div key={block.hour} className="timeline-item timeline-item--management">
                  <div className="timeline-item__hour">
                    <div className="timeline-item__hour-header">
                      <strong>{block.hour}</strong>
                    </div>
                    <span>{block.capacitySummary}</span>
                    <span>{block.reservationSummary}</span>
                  </div>

                  <div className="timeline-item__entries">
                    {block.items.length === 0 ? (
                      <article className="reservation-row reservation-row--empty">
                        <div>
                          <strong>Sin reservas cargadas</strong>
                          <p>La franja existe en agenda, pero todavia no tiene mesas asignadas.</p>
                        </div>
                      </article>
                    ) : null}

                    {block.items.map((reservation) => {
                      return (
                        <article
                          key={reservation.id}
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
                            <p>{reservation.service}</p>
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
            ) : null}
          </div>
        </article>
      </section>

      {pendingAction ? (
        <div className="management-feedback" role="status">
          {pendingAction}
        </div>
      ) : null}

      {isDatesModalOpen ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => setIsDatesModalOpen(false)}
        >
          <div
            className="dates-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="available-dates-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dates-modal__header">
              <div>
                <p className="dashboard-eyebrow">Agenda</p>
                <h3 id="available-dates-modal-title">Fechas disponibles</h3>
              </div>
              <button
                type="button"
                className="dates-modal__close"
                aria-label="Cerrar modal de fechas"
                onClick={() => setIsDatesModalOpen(false)}
              >
                X
              </button>
            </div>

            <div className="available-dates-list available-dates-list--modal">
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
                      setIsDatesModalOpen(false);
                    }}
                  >
                    {formatLongDate(availableDate)}
                  </button>
                ))
              )}
            </div>
          </div>
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
  if (availableDates.length > 0 && !availableDates.includes(nextDate)) {
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
