"use client";

import { useEffect, useState } from "react";
import { getReservationSlotsByDateClient } from "@/features/reservations/api/reservations.client";
import { ReservationEditLoader } from "@/features/reservations/components/reservation-edit-loader";
import {
  ReservationEditSelect,
  type ReservationEditSelectOption,
} from "@/features/reservations/components/reservation-edit-select";
import type {
  ReservationEditFormValues,
  ReservationEditTarget,
} from "@/features/reservations/types/reservation-edit.types";
import type {
  ReservationSlotApiDto,
  UpdateReservationRequestDto,
} from "@/features/reservations/types/reservations.dto";

type ReservationEditModalProps = {
  availableDates: string[];
  isSubmitting: boolean;
  reservationToEdit: ReservationEditTarget;
  submitErrorMessage: string | null;
  onClose: () => void;
  onSubmit: (payload: UpdateReservationRequestDto) => Promise<void>;
};

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export function ReservationEditModal({
  availableDates,
  isSubmitting,
  reservationToEdit,
  submitErrorMessage,
  onClose,
  onSubmit,
}: ReservationEditModalProps) {
  const [formValues, setFormValues] = useState<ReservationEditFormValues>(() =>
    createInitialFormValues(reservationToEdit),
  );
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [slotOptions, setSlotOptions] = useState<ReservationSlotApiDto[]>([]);
  const [slotsErrorMessage, setSlotsErrorMessage] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);

  useEffect(() => {
    setFormValues(createInitialFormValues(reservationToEdit));
    setValidationMessage(null);
  }, [reservationToEdit]);

  useEffect(() => {
    let isMounted = true;

    async function loadSlots() {
      setIsLoadingSlots(true);
      setSlotsErrorMessage(null);

      try {
        const response = await getReservationSlotsByDateClient({ date: formValues.date });

        if (!isMounted) {
          return;
        }

        const nextSlotOptions = getSelectableSlots(
          response.slots,
          reservationToEdit,
          formValues.date,
        );

        setSlotOptions(nextSlotOptions);
        setFormValues((currentValues) => {
          const nextTime =
            nextSlotOptions.find((slot) => slot.time === currentValues.time)?.time ??
            nextSlotOptions[0]?.time ??
            currentValues.time;

          return {
            ...currentValues,
            time: nextTime,
          };
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setSlotOptions([]);
        setSlotsErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los horarios disponibles.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingSlots(false);
        }
      }
    }

    void loadSlots();

    return () => {
      isMounted = false;
    };
  }, [formValues.date, reservationToEdit]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = createUpdatePayload(reservationToEdit, formValues, slotOptions, isLoadingSlots);

    if ("error" in payload) {
      setValidationMessage(payload.error);
      return;
    }

    setValidationMessage(null);
    await onSubmit(payload);
  }

  const availableDateCount = availableDates.length;
  const combinedErrorMessage = validationMessage ?? slotsErrorMessage ?? submitErrorMessage;
  const canClose = !isSubmitting;
  const isSubmitDisabled = isSubmitting || isLoadingSlots || slotOptions.length === 0;
  const timeSelectOptions = slotOptions.map((slot) => ({
    value: slot.time,
    description: getSlotDescription(slot, reservationToEdit, formValues.date),
  }));

  return (
    <div
      className={`modal-overlay${isSubmitting ? " modal-overlay--busy" : ""}`}
      role="presentation"
      onClick={() => {
        if (canClose) {
          onClose();
        }
      }}
    >
      <div
        className="dates-modal reservation-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-edit-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dates-modal__header">
          <div>
            <p className="dashboard-eyebrow">Edicion</p>
            <h3 id="reservation-edit-modal-title">Editar reserva</h3>
          </div>
          <button
            type="button"
            className="dates-modal__close"
            aria-label="Cerrar editor de reserva"
            disabled={!canClose}
            onClick={onClose}
          >
            X
          </button>
        </div>

        <div className="reservation-edit-modal__summary">
          <div>
            <span>Reserva actual</span>
            <strong>{reservationToEdit.reservation.guest}</strong>
            <p>
              {reservationToEdit.currentDate} a las {reservationToEdit.reservation.time}
            </p>
          </div>
          <div>
            <span>Telefono</span>
            <strong>{reservationToEdit.reservation.phone}</strong>
            <p>El numero de telefono, no se puede editar.</p>
          </div>
        </div>

        <form className="crud-form" onSubmit={handleSubmit}>
          <div className="crud-form__row">
            <label>
              <span>Fecha</span>
              {availableDateCount > 0 ? (
                <select
                  className="reservation-edit-modal__select"
                  value={formValues.date}
                  onChange={(event) =>
                    setFormValues((currentValues) => ({
                      ...currentValues,
                      date: event.target.value,
                    }))}
                >
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="date"
                  value={formValues.date}
                  onChange={(event) =>
                    setFormValues((currentValues) => ({
                      ...currentValues,
                      date: event.target.value,
                    }))}
                />
              )}
            </label>

            <label>
              <span>Hora</span>
              <ReservationEditSelect
                emptyLabel={
                  isLoadingSlots ? "Cargando horarios..." : "Sin horarios disponibles"
                }
                value={formValues.time}
                onChange={(nextTime) =>
                  setFormValues((currentValues) => ({
                    ...currentValues,
                    time: nextTime,
                  }))}
                options={timeSelectOptions}
                disabled={isLoadingSlots || slotOptions.length === 0}
              />
            </label>
          </div>

          <div className="crud-form__row">
            <label>
              <span>Nombre</span>
              <input
                type="text"
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((currentValues) => ({
                    ...currentValues,
                    name: event.target.value,
                  }))}
                placeholder="Nombre del cliente"
              />
            </label>

            <label>
              <span>Cantidad</span>
              <input
                type="number"
                min="1"
                step="1"
                value={formValues.quantity}
                onChange={(event) =>
                  setFormValues((currentValues) => ({
                    ...currentValues,
                    quantity: event.target.value,
                  }))}
              />
            </label>
          </div>

          {combinedErrorMessage ? (
            <div className="management-feedback management-feedback--danger" role="alert">
              {combinedErrorMessage}
            </div>
          ) : null}

          {isSubmitting ? (
            <div className="reservation-edit-modal__loading" role="status" aria-live="polite">
              <ReservationEditLoader />
              <span>Guardando cambios en la reserva...</span>
            </div>
          ) : null}

          <div className="crud-form__footer reservation-edit-modal__footer">
            <div className="crud-form__actions">
              <button type="button" className="action-button" onClick={onClose}>
                Cancelar
              </button>
              <button
                type="submit"
                className="action-button action-button--primary reservation-edit-modal__submit"
                disabled={isSubmitDisabled}
              >
                {isSubmitting
                  ? "Guardando cambios"
                  : isLoadingSlots
                    ? "Cargando horarios"
                    : "Guardar cambios"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function createInitialFormValues(
  reservationToEdit: ReservationEditTarget,
): ReservationEditFormValues {
  return {
    date: reservationToEdit.currentDate,
    time: reservationToEdit.reservation.time,
    name: reservationToEdit.reservation.guest,
    quantity: String(reservationToEdit.reservation.partySize),
  };
}

function createUpdatePayload(
  reservationToEdit: ReservationEditTarget,
  formValues: ReservationEditFormValues,
  slotOptions: ReservationSlotApiDto[],
  isLoadingSlots: boolean,
):
  | UpdateReservationRequestDto
  | {
      error: string;
    } {
  const trimmedName = formValues.name.trim();
  const trimmedTime = formValues.time.trim();
  const trimmedQuantity = formValues.quantity.trim();

  if (isLoadingSlots) {
    return { error: "Espera a que se carguen los horarios de la fecha seleccionada." };
  }

  if (trimmedName.length === 0) {
    return { error: "El nombre no puede estar vacio." };
  }

  if (slotOptions.length === 0) {
    return { error: "La fecha seleccionada no tiene horarios disponibles para elegir." };
  }

  if (!timePattern.test(trimmedTime)) {
    return { error: "La hora debe tener formato HH:mm." };
  }

  if (!slotOptions.some((slot) => slot.time === trimmedTime)) {
    return { error: "Selecciona uno de los horarios disponibles para la fecha elegida." };
  }

  const parsedQuantity = Number.parseInt(trimmedQuantity, 10);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
    return { error: "La cantidad debe ser un numero entero mayor o igual a 1." };
  }

  if (formValues.date.length === 0) {
    return { error: "La fecha es obligatoria." };
  }

  const payload: UpdateReservationRequestDto = {
    phone: reservationToEdit.reservation.phone,
    currentDate: reservationToEdit.currentDate,
    currentTime: reservationToEdit.reservation.time,
  };

  if (formValues.date !== reservationToEdit.currentDate) {
    payload.date = formValues.date;
  }

  if (trimmedTime !== reservationToEdit.reservation.time) {
    payload.time = trimmedTime;
  }

  if (trimmedName !== reservationToEdit.reservation.guest) {
    payload.name = trimmedName;
  }

  if (parsedQuantity !== reservationToEdit.reservation.partySize) {
    payload.quantity = parsedQuantity;
  }

  if (
    payload.date === undefined &&
    payload.time === undefined &&
    payload.name === undefined &&
    payload.quantity === undefined
  ) {
    return { error: "No hay cambios para guardar." };
  }

  return payload;
}

function getSelectableSlots(
  slots: ReservationSlotApiDto[],
  reservationToEdit: ReservationEditTarget,
  selectedDate: string,
) {
  const selectableSlots = slots.filter((slot) => slot.available > 0);
  const shouldKeepCurrentTime =
    selectedDate === reservationToEdit.currentDate &&
    !selectableSlots.some((slot) => slot.time === reservationToEdit.reservation.time);

  if (shouldKeepCurrentTime) {
    const currentSlot = slots.find((slot) => slot.time === reservationToEdit.reservation.time);

    if (currentSlot) {
      return [currentSlot, ...selectableSlots].sort((left, right) =>
        left.time.localeCompare(right.time),
      );
    }

    return [
      {
        time: reservationToEdit.reservation.time,
        reserved: reservationToEdit.reservation.partySize,
        available: 0,
      },
      ...selectableSlots,
    ].sort((left, right) => left.time.localeCompare(right.time));
  }

  return selectableSlots.sort((left, right) => left.time.localeCompare(right.time));
}

function formatSlotLabel(
  slot: ReservationSlotApiDto,
  reservationToEdit: ReservationEditTarget,
  selectedDate: string,
) {
  return `${slot.time} — ${getSlotDescription(slot, reservationToEdit, selectedDate)}`;
}

function getSlotDescription(
  slot: ReservationSlotApiDto,
  reservationToEdit: ReservationEditTarget,
  selectedDate: string,
) {
  const isCurrentReservationTime =
    selectedDate === reservationToEdit.currentDate &&
    slot.time === reservationToEdit.reservation.time;

  if (isCurrentReservationTime && slot.available <= 0) {
    return "horario actual";
  }

  const availabilityLabel =
    slot.available === 1 ? "1 lugar disponible" : `${slot.available} lugares disponibles`;

  return availabilityLabel;
}
