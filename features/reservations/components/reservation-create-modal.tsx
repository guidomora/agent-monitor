"use client";

import { useEffect, useState } from "react";
import { getReservationSlotsByDateClient } from "@/features/reservations/api/reservations.client";
import { ReservationEditLoader } from "@/features/reservations/components/reservation-edit-loader";
import { ReservationEditSelect } from "@/features/reservations/components/reservation-edit-select";
import type { ReservationCreateFormValues } from "@/features/reservations/types/reservation-create.types";
import type {
  AvailableReservationDateDto,
  CreateReservationRequestDto,
  ReservationSlotApiDto,
} from "@/features/reservations/types/reservations.dto";

type ReservationCreateModalProps = {
  availableDates: AvailableReservationDateDto[];
  initialDate: string;
  isSubmitting: boolean;
  submitErrorMessage: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateReservationRequestDto) => Promise<void>;
};

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const phonePattern = /^\d{6,15}$/;
const namePattern = /[A-Za-zÁÉÍÓÚáéíóúÑñÜü]/;

export function ReservationCreateModal({
  availableDates,
  initialDate,
  isSubmitting,
  submitErrorMessage,
  onClose,
  onSubmit,
}: ReservationCreateModalProps) {
  const [formValues, setFormValues] = useState<ReservationCreateFormValues>(() =>
    createInitialFormValues(initialDate),
  );
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [slotOptions, setSlotOptions] = useState<ReservationSlotApiDto[]>([]);
  const [slotsErrorMessage, setSlotsErrorMessage] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);

  useEffect(() => {
    setFormValues(createInitialFormValues(initialDate));
    setValidationMessage(null);
  }, [initialDate]);

  useEffect(() => {
    let isMounted = true;

    async function loadSlots() {
      const selectedDateStatus = availableDates.find((date) => date.date === formValues.date);

      if (selectedDateStatus?.isClosed) {
        setSlotOptions([]);
        setSlotsErrorMessage("La fecha seleccionada esta cerrada y no admite nuevas reservas.");
        setIsLoadingSlots(false);
        return;
      }

      setIsLoadingSlots(true);
      setSlotsErrorMessage(null);

      try {
        const response = await getReservationSlotsByDateClient({ date: formValues.date });

        if (!isMounted) {
          return;
        }

        const nextSlotOptions = getSelectableSlots(response.slots);

        setSlotOptions(nextSlotOptions);
        setFormValues((currentValues) => ({
          ...currentValues,
          time:
            nextSlotOptions.find((slot) => slot.time === currentValues.time)?.time ??
            nextSlotOptions[0]?.time ??
            currentValues.time,
        }));
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
  }, [availableDates, formValues.date]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = createReservationPayload(formValues, slotOptions, isLoadingSlots);

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
  const selectedSlot = slotOptions.find((slot) => slot.time === formValues.time);
  const maximumPartySize = selectedSlot?.available ?? 0;
  const timeSelectOptions = slotOptions.map((slot) => ({
    value: slot.time,
    description: getSlotDescription(slot),
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
        className={`dates-modal reservation-edit-modal${
          isSubmitting ? " reservation-edit-modal--busy" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-create-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dates-modal__header">
          <div>
            <p className="dashboard-eyebrow">Creacion</p>
            <h3 id="reservation-create-modal-title">Crear reserva</h3>
          </div>
          <button
            type="button"
            className="dates-modal__close"
            aria-label="Cerrar creador de reserva"
            disabled={!canClose}
            onClick={onClose}
          >
            X
          </button>
        </div>

        <div className="reservation-edit-modal__summary">
          <div>
            <span>Fecha seleccionada</span>
            <strong>{formValues.date}</strong>
            <p>La reserva se crea sobre la agenda y disponibilidad del horario elegido.</p>
          </div>
          <div>
            <span>Horario</span>
            <strong>{formValues.time || "Sin horario"}</strong>
            <p>Solo se muestran horarios con disponibilidad para crear nuevas reservas.</p>
          </div>
        </div>

        <form className="crud-form" onSubmit={handleSubmit}>
          <div className="crud-form__row">
            <label>
              <span>Fecha</span>
              {availableDateCount > 0 ? (
                <ReservationEditSelect
                  emptyLabel="Sin fechas disponibles"
                  value={formValues.date}
                  onChange={(nextDate) =>
                    setFormValues((currentValues) => ({
                      ...currentValues,
                      date: nextDate,
                    }))}
                  options={availableDates.map((date) => ({
                    value: date.date,
                    label: formatDateOptionLabel(date.date),
                    description: date.isClosed ? "Cerrado" : undefined,
                    disabled: date.isClosed,
                  }))}
                />
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
              <span>Telefono</span>
              <input
                type="tel"
                inputMode="numeric"
                value={formValues.phone}
                onChange={(event) =>
                  setFormValues((currentValues) => ({
                    ...currentValues,
                    phone: event.target.value,
                  }))}
                placeholder="1122334455"
              />
            </label>
          </div>

          <div className="crud-form__row">
            <label>
              <span>Cantidad</span>
              <input
                type="number"
                min="1"
                max={maximumPartySize > 0 ? String(maximumPartySize) : undefined}
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

          <div className="crud-form__footer reservation-edit-modal__footer">
            <div className="crud-form__actions">
              <button
                type="button"
                className="action-button"
                onClick={onClose}
                disabled={!canClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="action-button action-button--primary reservation-edit-modal__submit"
                disabled={isSubmitDisabled}
              >
                {isSubmitting
                  ? "Creando reserva"
                  : isLoadingSlots
                    ? "Cargando horarios"
                    : "Crear reserva"}
              </button>
            </div>
          </div>
        </form>

        {isSubmitting ? (
          <div className="reservation-edit-modal__loading" role="status" aria-live="polite">
            <ReservationEditLoader />
            <span>Creando reserva...</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function createInitialFormValues(initialDate: string): ReservationCreateFormValues {
  return {
    date: initialDate,
    time: "",
    name: "",
    phone: "",
    quantity: "1",
  };
}

function createReservationPayload(
  formValues: ReservationCreateFormValues,
  slotOptions: ReservationSlotApiDto[],
  isLoadingSlots: boolean,
):
  | CreateReservationRequestDto
  | {
      error: string;
    } {
  const trimmedDate = formValues.date.trim();
  const trimmedTime = formValues.time.trim();
  const trimmedName = formValues.name.trim();
  const trimmedPhone = formValues.phone.trim();
  const trimmedQuantity = formValues.quantity.trim();

  if (trimmedDate.length === 0) {
    return { error: "La fecha es obligatoria." };
  }

  if (isLoadingSlots) {
    return { error: "Espera a que se carguen los horarios de la fecha seleccionada." };
  }

  if (slotOptions.length === 0) {
    return { error: "La fecha seleccionada no tiene horarios disponibles para crear reservas." };
  }

  if (!timePattern.test(trimmedTime)) {
    return { error: "La hora debe tener formato HH:mm." };
  }

  const selectedSlot = slotOptions.find((slot) => slot.time === trimmedTime);

  if (!selectedSlot) {
    return { error: "Selecciona uno de los horarios disponibles para la fecha elegida." };
  }

  if (trimmedName.length === 0) {
    return { error: "El nombre no puede estar vacio." };
  }

  if (!namePattern.test(trimmedName)) {
    return { error: "El nombre debe contener letras validas." };
  }

  if (trimmedPhone.length === 0) {
    return { error: "El telefono no puede estar vacio." };
  }

  if (!phonePattern.test(trimmedPhone)) {
    return { error: "El telefono debe contener solo numeros (entre 6 y 15 digitos)." };
  }

  const parsedQuantity = Number.parseInt(trimmedQuantity, 10);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
    return { error: "La cantidad debe ser un numero entero mayor o igual a 1." };
  }

  if (parsedQuantity > selectedSlot.available) {
    return {
      error:
        selectedSlot.available === 1
          ? "Para ese horario solo se admite 1 persona."
          : `Para ese horario solo se admiten hasta ${selectedSlot.available} personas.`,
    };
  }

  return {
    date: trimmedDate,
    time: trimmedTime,
    name: trimmedName,
    phone: trimmedPhone,
    quantity: parsedQuantity,
  };
}

function getSelectableSlots(slots: ReservationSlotApiDto[]) {
  return slots
    .filter((slot) => slot.available > 0)
    .sort((left, right) => left.time.localeCompare(right.time));
}

function getSlotDescription(slot: ReservationSlotApiDto) {
  return slot.available === 1
    ? "1 lugar disponible"
    : `${slot.available} lugares disponibles`;
}

function formatDateOptionLabel(value: string) {
  const formatted = new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${value}T12:00:00`));

  return `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`;
}
