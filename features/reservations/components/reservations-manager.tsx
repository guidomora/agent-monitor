"use client";

import { useEffect, useState } from "react";
import { getAvailableReservationDatesClient } from "@/features/reservations/api/available-dates.client";
import {
  closeReservationDayClient,
  closeReservationSlotClient,
  createReservationClient,
  deleteReservationClient,
  getReservationsByDateClient,
  reopenReservationDayClient,
  reopenReservationSlotClient,
  updateReservationClient,
} from "@/features/reservations/api/reservations.client";
import { ChevronLeftIcon } from "@/features/reservations/components/chevron-left-icon";
import { ChevronRightIcon } from "@/features/reservations/components/chevron-right-icon";
import { ReservationCreateModal } from "@/features/reservations/components/reservation-create-modal";
import { ReservationDayStatusModal } from "@/features/reservations/components/reservation-day-status-modal";
import { ReservationDeleteModal } from "@/features/reservations/components/reservation-delete-modal";
import { ReservationEditModal } from "@/features/reservations/components/reservation-edit-modal";
import { ReservationSlotStatusModal } from "@/features/reservations/components/reservation-slot-status-modal";
import { mapReservationManagement } from "@/features/reservations/mappers/reservations.mapper";
import type { ReservationClosedDayTarget } from "@/features/reservations/types/closed-day.types";
import type {
  ReservationClosedSlotTarget,
  ReservationSlotStatusMode,
} from "@/features/reservations/types/closed-slot.types";
import type { ReservationDeleteTarget } from "@/features/reservations/types/reservation-delete.types";
import type { ReservationEditTarget } from "@/features/reservations/types/reservation-edit.types";
import type { ReservationManagementViewModel } from "@/features/reservations/types/reservation.view-model";
import type {
  AvailableReservationDateDto,
  CloseReservationSlotRequestDto,
  CreateReservationRequestDto,
  DeleteReservationRequestDto,
  ReopenReservationSlotRequestDto,
  UpdateReservationRequestDto,
} from "@/features/reservations/types/reservations.dto";

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

export function ReservationsManager() {
  const [todayDate] = useState(() => getTodayDate());
  const [availableDates, setAvailableDates] = useState<AvailableReservationDateDto[]>([]);
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [reservationToEdit, setReservationToEdit] = useState<ReservationEditTarget | null>(null);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);
  const [isSavingReservation, setIsSavingReservation] = useState(false);
  const [reservationToDelete, setReservationToDelete] =
    useState<ReservationDeleteTarget | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [isDeletingReservation, setIsDeletingReservation] = useState(false);
  const [dayToClose, setDayToClose] = useState<ReservationClosedDayTarget | null>(null);
  const [closeDayErrorMessage, setCloseDayErrorMessage] = useState<string | null>(null);
  const [isUpdatingDayStatus, setIsUpdatingDayStatus] = useState(false);
  const [slotToClose, setSlotToClose] = useState<ReservationClosedSlotTarget | null>(null);
  const [slotStatusMode, setSlotStatusMode] = useState<ReservationSlotStatusMode>("close");
  const [closeSlotErrorMessage, setCloseSlotErrorMessage] = useState<string | null>(null);
  const [isClosingSlot, setIsClosingSlot] = useState(false);

  const availableDateValues = availableDates.map((date) => date.date);
  const openAvailableDates = availableDates.filter((date) => !date.isClosed);
  const openAvailableDateValues = openAvailableDates.map((date) => date.date);
  const selectedDayStatus =
    availableDates.find((availableDate) => availableDate.date === selectedDate) ?? null;
  const isSelectedDateClosed = selectedDayStatus?.isClosed ?? false;

  async function refreshAvailableDates() {
    const response = await getAvailableReservationDatesClient();
    const nextDates = response.dates;

    setAvailableDates(nextDates);
    setSelectedDate((currentDate) => getNextSelectedDate(currentDate, nextDates, todayDate));
    setDatesErrorMessage(null);

    return nextDates;
  }

  async function loadReservations(date: string) {
    setIsLoadingReservations(true);
    setReservationsErrorMessage(null);

    try {
      const response = await getReservationsByDateClient({ date });

      setReservationsViewModel(mapReservationManagement(response));
    } catch (error) {
      setReservationsViewModel(null);
      setReservationsErrorMessage(
        error instanceof Error ? error.message : "No se pudieron cargar las reservas.",
      );
    } finally {
      setIsLoadingReservations(false);
    }
  }

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
        setSelectedDate((currentDate) => getNextSelectedDate(currentDate, nextDates, todayDate));
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
  }, [todayDate]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
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
    })();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  useEffect(() => {
    const isAnyModalOpen =
      isDatesModalOpen ||
      isCreateModalOpen ||
      reservationToEdit !== null ||
      reservationToDelete !== null ||
      dayToClose !== null ||
      slotToClose !== null;
    const isAnyMutationBusy =
      isCreatingReservation ||
      isSavingReservation ||
      isDeletingReservation ||
      isUpdatingDayStatus ||
      isClosingSlot;

    if (!isAnyModalOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!isAnyMutationBusy) {
          setIsDatesModalOpen(false);
          closeCreateModal();
          closeEditModal();
          closeDeleteModal();
          closeDayStatusModal();
          closeSlotStatusModal();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    dayToClose,
    isCreateModalOpen,
    isCreatingReservation,
    isClosingSlot,
    isDatesModalOpen,
    isDeletingReservation,
    isSavingReservation,
    isUpdatingDayStatus,
    slotToClose,
    reservationToDelete,
    reservationToEdit,
  ]);

  const selectedDateIndex = availableDateValues.findIndex((date) => date === selectedDate);
  const previousDate = availableDateValues[selectedDateIndex - 1] ?? null;
  const nextDate = availableDateValues[selectedDateIndex + 1] ?? null;
  const minimumAvailableDate = availableDateValues[0] ?? "";
  const maximumAvailableDate = availableDateValues[availableDateValues.length - 1] ?? "";

  function closeEditModal() {
    setReservationToEdit(null);
    setEditErrorMessage(null);
    setIsSavingReservation(false);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
    setCreateErrorMessage(null);
    setIsCreatingReservation(false);
  }

  function closeDeleteModal() {
    setReservationToDelete(null);
    setDeleteErrorMessage(null);
    setIsDeletingReservation(false);
  }

  function closeDayStatusModal() {
    setDayToClose(null);
    setCloseDayErrorMessage(null);
    setIsUpdatingDayStatus(false);
  }

  function closeSlotStatusModal() {
    setSlotToClose(null);
    setCloseSlotErrorMessage(null);
    setIsClosingSlot(false);
  }

  async function handleReservationCreate(payload: CreateReservationRequestDto) {
    setIsCreatingReservation(true);
    setCreateErrorMessage(null);

    try {
      const response = await createReservationClient(payload);

      closeCreateModal();
      setPendingAction(response.message);

      if (payload.date !== selectedDate) {
        setSelectedDate(payload.date);
        return;
      }

      await loadReservations(payload.date);
    } catch (error) {
      setCreateErrorMessage(
        error instanceof Error ? error.message : "No se pudo crear la reserva.",
      );
      setIsCreatingReservation(false);
    }
  }

  async function handleReservationUpdate(payload: UpdateReservationRequestDto) {
    setIsSavingReservation(true);
    setEditErrorMessage(null);

    try {
      const response = await updateReservationClient(payload);
      const targetDate = payload.date ?? payload.currentDate;

      closeEditModal();
      setPendingAction(response.message);

      if (targetDate !== selectedDate) {
        setSelectedDate(targetDate);
        return;
      }

      await loadReservations(targetDate);
    } catch (error) {
      setEditErrorMessage(
        error instanceof Error ? error.message : "No se pudo actualizar la reserva.",
      );
      setIsSavingReservation(false);
    }
  }

  async function handleReservationDelete(payload: DeleteReservationRequestDto) {
    setIsDeletingReservation(true);
    setDeleteErrorMessage(null);

    try {
      const response = await deleteReservationClient(payload);

      closeDeleteModal();
      setPendingAction(response.message);
      await loadReservations(payload.currentDate);
    } catch (error) {
      setDeleteErrorMessage(
        error instanceof Error ? error.message : "No se pudo eliminar la reserva.",
      );
      setIsDeletingReservation(false);
    }
  }

  async function handleDayCloseConfirm() {
    if (!dayToClose) {
      return;
    }

    setIsUpdatingDayStatus(true);
    setCloseDayErrorMessage(null);

    try {
      const response = await closeReservationDayClient({ date: dayToClose.date });

      await refreshAvailableDates();
      await loadReservations(dayToClose.date);

      closeDayStatusModal();
      setPendingAction(
        response.warning ||
          (response.existingReservationsCount > 0
            ? `Dia cerrado. Quedaron ${response.existingReservationsCount} reservas activas para revisar manualmente.`
            : "Dia cerrado correctamente."),
      );
    } catch (error) {
      setCloseDayErrorMessage(
        error instanceof Error ? error.message : "No se pudo cerrar la fecha.",
      );
      setIsUpdatingDayStatus(false);
    }
  }

  async function handleDayReopen() {
    setPendingAction(null);
    setCloseDayErrorMessage(null);
    setIsUpdatingDayStatus(true);

    try {
      await reopenReservationDayClient(selectedDate);
      await refreshAvailableDates();
      await loadReservations(selectedDate);
      setPendingAction(`Dia reabierto: ${formatLongDate(selectedDate)}.`);
    } catch (error) {
      setPendingAction(null);
      setCloseDayErrorMessage(null);
      setDatesErrorMessage(
        error instanceof Error ? error.message : "No se pudo reabrir la fecha.",
      );
    } finally {
      setIsUpdatingDayStatus(false);
    }
  }

  async function handleSlotClose(payload: CloseReservationSlotRequestDto) {
    setIsClosingSlot(true);
    setCloseSlotErrorMessage(null);

    try {
      const response = await closeReservationSlotClient(payload);

      await loadReservations(payload.date);

      closeSlotStatusModal();
      setPendingAction(
        response.warning ||
          `Franja cerrada de ${response.fromTime} a ${response.toTime}${
            response.reason ? ` (${response.reason})` : ""
          }.`,
      );
    } catch (error) {
      setCloseSlotErrorMessage(
        error instanceof Error ? error.message : "No se pudo cerrar la franja horaria.",
      );
      setIsClosingSlot(false);
    }
  }

  async function handleSlotReopen(payload: ReopenReservationSlotRequestDto) {
    setIsClosingSlot(true);
    setCloseSlotErrorMessage(null);

    try {
      const response = await reopenReservationSlotClient(payload);

      await loadReservations(payload.date);

      closeSlotStatusModal();
      setPendingAction(
        `Franja reabierta de ${response.fromTime} a ${response.toTime}. ${response.reopenedSlotsCount} bloque${
          response.reopenedSlotsCount === 1 ? "" : "s"
        } actualizado${response.reopenedSlotsCount === 1 ? "" : "s"}.`,
      );
    } catch (error) {
      setCloseSlotErrorMessage(
        error instanceof Error ? error.message : "No se pudo reabrir la franja horaria.",
      );
      setIsClosingSlot(false);
    }
  }

  const slotTimes = reservationsViewModel?.slotTimes ?? [];
  const reopenSlotTarget = getReopenSlotTarget(reservationsViewModel);
  const canCloseSlots = !isSelectedDateClosed && slotTimes.length > 1;
  const canReopenSlots = !isSelectedDateClosed && reopenSlotTarget !== null;

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
              : `${availableDates.length} fechas configuradas, ${openAvailableDates.length} abiertas para tomar reservas.`}
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
            <button
              type="button"
              className="action-button action-button--primary"
              onClick={() => {
                setPendingAction(null);
                setCreateErrorMessage(null);
                setIsCreateModalOpen(true);
              }}
              disabled={isSelectedDateClosed || openAvailableDates.length === 0}
            >
              {isSelectedDateClosed ? "Dia cerrado" : "Crear reserva"}
            </button>
          </div>

          {datesErrorMessage ? (
            <div className="management-feedback management-feedback--muted" role="status">
              {datesErrorMessage} Se mantiene la fecha actual como referencia hasta
              recuperar la agenda real.
            </div>
          ) : null}

          {closeDayErrorMessage && !dayToClose ? (
            <div className="management-feedback management-feedback--danger" role="alert">
              {closeDayErrorMessage}
            </div>
          ) : null}

          <div className="schedule-toolbar">
            <button
              type="button"
              className="action-button action-button--compact schedule-toolbar__nav-button"
              onClick={() => {
                if (previousDate) {
                  handleDateChange(previousDate, availableDateValues, setSelectedDate);
                  setPendingAction(null);
                }
              }}
              disabled={!previousDate || isLoadingDates}
            >
              <ChevronLeftIcon />
              <span>Dia anterior</span>
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

                  handleDateChange(nextSelectedDate, availableDateValues, setSelectedDate);
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
                  handleDateChange(nextDate, availableDateValues, setSelectedDate);
                  setPendingAction(null);
                }
              }}
              disabled={!nextDate || isLoadingDates}
            >
              <span>Dia siguiente</span>
              <ChevronRightIcon />
            </button>
          </div>

          <div className="schedule-day-status">
            <div className="schedule-day-status__summary">
              <span className="schedule-day-status__label">Estado operativo</span>
              <div className="schedule-day-status__meta">
                <strong>{isSelectedDateClosed ? "Dia cerrado" : "Dia abierto"}</strong>
                <span
                  className={`day-status-badge${
                    isSelectedDateClosed ? " is-closed" : " is-open"
                  }`}
                >
                  {isSelectedDateClosed ? "Cerrado" : "Abierto"}
                </span>
              </div>
              <p>
                {isSelectedDateClosed
                  ? "No se aceptan nuevas reservas para esta fecha hasta que vuelvas a abrirla."
                  : "La fecha admite nuevas reservas y movimientos desde el dashboard."}
              </p>
            </div>

            <div className="schedule-day-status__actions">
              {isSelectedDateClosed ? (
                <button
                  type="button"
                  className="action-button"
                  onClick={() => {
                    void handleDayReopen();
                  }}
                  disabled={isUpdatingDayStatus}
                >
                  {isUpdatingDayStatus ? "Reabriendo dia" : "Reabrir dia"}
                </button>
              ) : (
                <button
                  type="button"
                  className="action-button action-button--subtle-danger"
                  onClick={() => {
                    setPendingAction(null);
                    setCloseDayErrorMessage(null);
                    setDayToClose({
                      date: selectedDate,
                      formattedDate: formatLongDate(selectedDate),
                      reservationCount: reservationsViewModel?.reservationCount ?? 0,
                      dayStatus: selectedDayStatus,
                    });
                  }}
                  disabled={isLoadingReservations || isUpdatingDayStatus}
                >
                  Cerrar dia
                </button>
              )}
            </div>
          </div>

          <div className="schedule-slot-status">
            <div className="schedule-slot-status__summary">
              <span className="schedule-day-status__label">Franjas horarias</span>
              <div className="schedule-day-status__meta">
                <strong>
                  {reservationsViewModel?.closedSlotCount ?? 0} franja
                  {(reservationsViewModel?.closedSlotCount ?? 0) === 1 ? "" : "s"} cerrada
                  {(reservationsViewModel?.closedSlotCount ?? 0) === 1 ? "" : "s"}
                </strong>
                <span
                  className={`day-status-badge${
                    (reservationsViewModel?.closedSlotCount ?? 0) > 0 ? " is-closed" : " is-open"
                  }`}
                >
                  {(reservationsViewModel?.closedSlotCount ?? 0) > 0
                    ? "Con cierres parciales"
                    : "Sin cierres parciales"}
                </span>
              </div>
              <p>
                {isSelectedDateClosed
                  ? "El dia completo esta cerrado, asi que ese estado prevalece sobre cualquier cierre por franja existente."
                  : "Podes cerrar una franja puntual del dia. El sistema consolida rangos contiguos o solapados y devuelve el rango final como referencia."}
              </p>
            </div>

            <div className="schedule-slot-status__actions">
              <button
                type="button"
                className="action-button"
                onClick={() => {
                  if (!reopenSlotTarget) {
                    return;
                  }

                  setPendingAction(null);
                  setCloseSlotErrorMessage(null);
                  setSlotStatusMode("reopen");
                  setSlotToClose(reopenSlotTarget);
                }}
                disabled={!canReopenSlots || isLoadingReservations || isClosingSlot}
              >
                {isSelectedDateClosed ? "Dia cerrado" : "Reabrir franja"}
              </button>
              <button
                type="button"
                className="action-button action-button--subtle-danger"
                onClick={() => {
                  if (!reservationsViewModel) {
                    return;
                  }

                  setPendingAction(null);
                  setCloseSlotErrorMessage(null);
                  setSlotStatusMode("close");
                  setSlotToClose({
                    date: reservationsViewModel.date,
                    formattedDate: reservationsViewModel.formattedDateLabel,
                    availableTimes: reservationsViewModel.slotTimes,
                  });
                }}
                disabled={!canCloseSlots || isLoadingReservations || isClosingSlot}
              >
                {isSelectedDateClosed ? "Dia cerrado" : "Cerrar franja"}
              </button>
            </div>
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
              <article className="stat-card">
                <span>Estado</span>
                <strong>{isSelectedDateClosed ? "Cerrado" : "Abierto"}</strong>
                <p>
                  {isSelectedDateClosed
                    ? "Solo se permiten revisiones manuales sobre reservas existentes."
                    : "Se pueden tomar nuevas reservas desde el dashboard."}
                </p>
              </article>
              <article className="stat-card">
                <span>Franjas cerradas</span>
                <strong>{reservationsViewModel.closedSlotCount}</strong>
                <p>Bloques horarios cerrados parcialmente dentro del dia seleccionado.</p>
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
                  {isSelectedDateClosed
                    ? "La fecha esta cerrada y no hay reservas activas visibles en la agenda."
                    : "La fecha esta habilitada en agenda, pero no devolvio reservas ni franjas con ocupacion visible."}
                </p>
              </div>
            ) : null}

            {!isLoadingReservations &&
            !reservationsErrorMessage &&
            reservationsViewModel ? (
              reservationsViewModel.hourBlocks.map((block) => (
                <div
                  key={block.hour}
                  className={`timeline-item timeline-item--management${
                    block.isClosed ? " timeline-item--closed" : ""
                  }`}
                >
                  <div className="timeline-item__hour">
                    <div className="timeline-item__hour-header">
                      <strong>{block.hour}</strong>
                      <span
                        className={`day-status-badge${block.isClosed ? " is-closed" : " is-open"}`}
                      >
                        {block.isClosed ? "Franja cerrada" : "Franja abierta"}
                      </span>
                    </div>
                    <span>{block.capacitySummary}</span>
                    <span>{block.reservationSummary}</span>
                    {block.closedReason ? (
                      <p className="timeline-item__reason">{block.closedReason}</p>
                    ) : null}
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
                        <article key={reservation.id} className="reservation-card">
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
                                setPendingAction(null);
                                setEditErrorMessage(null);
                                setReservationToEdit({
                                  currentDate: reservationsViewModel.date,
                                  reservation,
                                });
                              }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="action-button action-button--subtle-danger"
                              onClick={() => {
                                setPendingAction(null);
                                setDeleteErrorMessage(null);
                                setReservationToDelete({
                                  currentDate: reservationsViewModel.date,
                                  reservation,
                                });
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
                    key={availableDate.date}
                    type="button"
                    className={`available-date-chip${
                      availableDate.date === selectedDate ? " is-active" : ""
                    }${availableDate.isClosed ? " is-closed" : ""}`}
                    onClick={() => {
                      handleDateChange(
                        availableDate.date,
                        availableDateValues,
                        setSelectedDate,
                      );
                      setPendingAction(null);
                      setIsDatesModalOpen(false);
                    }}
                  >
                    <span>{formatLongDate(availableDate.date)}</span>
                    <span
                      className={`day-status-badge${
                        availableDate.isClosed ? " is-closed" : " is-open"
                      }`}
                    >
                      {availableDate.isClosed ? "Cerrado" : "Abierto"}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {dayToClose ? (
        <ReservationDayStatusModal
          closeErrorMessage={closeDayErrorMessage}
          isSubmitting={isUpdatingDayStatus}
          target={dayToClose}
          onClose={closeDayStatusModal}
          onConfirm={handleDayCloseConfirm}
        />
      ) : null}

      {slotToClose ? (
        <ReservationSlotStatusModal
          closeErrorMessage={closeSlotErrorMessage}
          isSubmitting={isClosingSlot}
          mode={slotStatusMode}
          target={slotToClose}
          onClose={closeSlotStatusModal}
          onSubmit={(payload) => {
            if (slotStatusMode === "reopen") {
              return handleSlotReopen(payload as ReopenReservationSlotRequestDto);
            }

            return handleSlotClose(payload as CloseReservationSlotRequestDto);
          }}
        />
      ) : null}

      {reservationToEdit ? (
        <ReservationEditModal
          availableDates={availableDates}
          isSubmitting={isSavingReservation}
          reservationToEdit={reservationToEdit}
          submitErrorMessage={editErrorMessage}
          onClose={closeEditModal}
          onSubmit={handleReservationUpdate}
        />
      ) : null}

      {isCreateModalOpen ? (
        <ReservationCreateModal
          availableDates={availableDates}
          initialDate={getCreateInitialDate(selectedDate, openAvailableDateValues, todayDate)}
          isSubmitting={isCreatingReservation}
          submitErrorMessage={createErrorMessage}
          onClose={closeCreateModal}
          onSubmit={handleReservationCreate}
        />
      ) : null}

      {reservationToDelete ? (
        <ReservationDeleteModal
          deleteErrorMessage={deleteErrorMessage}
          isSubmitting={isDeletingReservation}
          reservationToDelete={reservationToDelete}
          onClose={closeDeleteModal}
          onSubmit={handleReservationDelete}
        />
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

function getNextSelectedDate(
  currentDate: string,
  availableDates: AvailableReservationDateDto[],
  todayDate: string,
) {
  if (availableDates.some((date) => date.date === currentDate)) {
    return currentDate;
  }

  return getInitialDate(
    todayDate,
    availableDates.map((date) => date.date),
  );
}

function getCreateInitialDate(
  selectedDate: string,
  openAvailableDates: string[],
  todayDate: string,
) {
  if (openAvailableDates.includes(selectedDate)) {
    return selectedDate;
  }

  return getInitialDate(todayDate, openAvailableDates);
}

function getReopenSlotTarget(
  reservationsViewModel: ReservationManagementViewModel | null,
): ReservationClosedSlotTarget | null {
  if (!reservationsViewModel || reservationsViewModel.slotTimes.length < 2) {
    return null;
  }

  const firstClosedBlock = reservationsViewModel.hourBlocks.find((block) => block.isClosed);

  if (!firstClosedBlock) {
    return null;
  }

  const closedTimeIndex = reservationsViewModel.slotTimes.findIndex(
    (time) => time === firstClosedBlock.hour,
  );
  const initialToTime = reservationsViewModel.slotTimes[closedTimeIndex + 1];

  if (closedTimeIndex < 0 || !initialToTime) {
    return null;
  }

  return {
    date: reservationsViewModel.date,
    formattedDate: reservationsViewModel.formattedDateLabel,
    availableTimes: reservationsViewModel.slotTimes,
    initialFromTime: firstClosedBlock.hour,
    initialToTime,
  };
}

function formatCompactDate(value: string) {
  return shortDateFormatter.format(new Date(`${value}T12:00:00`));
}

function formatLongDate(value: string) {
  const formatted = fullDateFormatter.format(new Date(`${value}T12:00:00`));

  return `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`;
}

function getTodayDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());
}
