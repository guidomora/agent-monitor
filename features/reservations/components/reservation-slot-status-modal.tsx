"use client";

import { useMemo, useState } from "react";
import { ReservationEditLoader } from "@/features/reservations/components/reservation-edit-loader";
import { ReservationEditSelect } from "@/features/reservations/components/reservation-edit-select";
import type {
  ReservationClosedSlotTarget,
  ReservationSlotStatusMode,
} from "@/features/reservations/types/closed-slot.types";
import type {
  CloseReservationSlotRequestDto,
  ReopenReservationSlotRequestDto,
} from "@/features/reservations/types/reservations.dto";

type ReservationSlotStatusModalProps = {
  closeErrorMessage: string | null;
  isSubmitting: boolean;
  mode: ReservationSlotStatusMode;
  target: ReservationClosedSlotTarget;
  onClose: () => void;
  onSubmit: (
    payload: CloseReservationSlotRequestDto | ReopenReservationSlotRequestDto,
  ) => Promise<void>;
};

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export function ReservationSlotStatusModal({
  closeErrorMessage,
  isSubmitting,
  mode,
  target,
  onClose,
  onSubmit,
}: ReservationSlotStatusModalProps) {
  const [fromTime, setFromTime] = useState(
    target.initialFromTime ?? target.availableTimes[0] ?? "",
  );
  const [toTime, setToTime] = useState(
    target.initialToTime ?? target.availableTimes[1] ?? "",
  );
  const [reason, setReason] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const canClose = !isSubmitting;
  const isReopening = mode === "reopen";
  const actionLabel = isReopening ? "Reabrir franja" : "Cerrar franja";
  const submittingLabel = isReopening ? "Reabriendo franja" : "Cerrando franja";
  const toTimeOptions = useMemo(
    () => target.availableTimes.filter((time) => time > fromTime),
    [fromTime, target.availableTimes],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = createCloseSlotPayload({
      date: target.date,
      fromTime,
      toTime,
      reason,
    }, mode);

    if ("error" in payload) {
      setValidationMessage(payload.error);
      return;
    }

    setValidationMessage(null);
    await onSubmit(payload);
  }

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
        aria-labelledby="reservation-slot-status-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dates-modal__header">
          <div>
            <p className="dashboard-eyebrow">Operacion de agenda</p>
            <h3 id="reservation-slot-status-modal-title">{actionLabel}</h3>
          </div>
          <button
            type="button"
            className="dates-modal__close"
            aria-label={`Cerrar modal de ${actionLabel.toLowerCase()}`}
            disabled={!canClose}
            onClick={onClose}
          >
            X
          </button>
        </div>

        <div className="reservation-delete-modal__summary reservation-day-status-modal__summary">
          <p>
            {isReopening ? "Vas a reabrir" : "Vas a cerrar"} una franja puntual dentro de{" "}
            <strong>{target.formattedDate}</strong>. El horario final es exclusivo
            {isReopening
              ? " y solo se quitara el cierre parcial dentro del rango elegido."
              : " y el sistema puede consolidar el rango si toca otro ya cerrado."}
          </p>
          <div className="reservation-day-status-modal__stats">
            <div>
              <span>Inicio</span>
              <strong>{fromTime || "Sin hora"}</strong>
            </div>
            <div>
              <span>Fin exclusivo</span>
              <strong>{toTime || "Sin hora"}</strong>
            </div>
          </div>
        </div>

        <form className="crud-form" onSubmit={handleSubmit}>
          <div className="crud-form__row">
            <label>
              <span>Desde</span>
              <ReservationEditSelect
                emptyLabel="Sin horarios"
                value={fromTime}
                onChange={(nextFromTime) => {
                  setFromTime(nextFromTime);

                  if (toTime <= nextFromTime) {
                    const nextToTime =
                      target.availableTimes.find((time) => time > nextFromTime) ?? "";
                    setToTime(nextToTime);
                  }
                }}
                options={target.availableTimes.map((time) => ({
                  value: time,
                }))}
                disabled={target.availableTimes.length === 0 || isSubmitting}
              />
            </label>

            <label>
              <span>Hasta</span>
              <ReservationEditSelect
                emptyLabel="Sin horario final"
                value={toTime}
                onChange={setToTime}
                options={toTimeOptions.map((time) => ({
                  value: time,
                }))}
                disabled={toTimeOptions.length === 0 || isSubmitting}
              />
            </label>
          </div>

          {!isReopening ? (
            <div className="crud-form__row crud-form__row--stacked">
              <label>
                <span>Motivo</span>
                <p className="crud-form__field-note">
                  Se va a enviar un mensaje a los usuarios que ya tenian reserva en esta franja con
                  el motivo del cierre.
                </p>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Ej. Evento privado"
                />
              </label>
            </div>
          ) : null}

          {validationMessage || closeErrorMessage ? (
            <div className="management-feedback management-feedback--danger" role="alert">
              {validationMessage ?? closeErrorMessage}
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
                className={`action-button reservation-edit-modal__submit${
                  isReopening ? "" : " action-button--subtle-danger"
                }`}
                disabled={isSubmitting || target.availableTimes.length < 2}
              >
                {isSubmitting ? submittingLabel : actionLabel}
              </button>
            </div>
          </div>
        </form>

        {isSubmitting ? (
          <div className="reservation-edit-modal__loading" role="status" aria-live="polite">
            <ReservationEditLoader />
            <span>Actualizando disponibilidad horaria...</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function createCloseSlotPayload(
  payload: CloseReservationSlotRequestDto,
  mode: ReservationSlotStatusMode,
): CloseReservationSlotRequestDto | ReopenReservationSlotRequestDto | { error: string } {
  const trimmedDate = payload.date.trim();
  const trimmedFromTime = payload.fromTime.trim();
  const trimmedToTime = payload.toTime.trim();
  const trimmedReason = payload.reason.trim();

  if (trimmedDate.length === 0) {
    return { error: "La fecha es obligatoria." };
  }

  if (!timePattern.test(trimmedFromTime) || !timePattern.test(trimmedToTime)) {
    return { error: "Las horas deben tener formato HH:mm." };
  }

  if (trimmedFromTime >= trimmedToTime) {
    return { error: "La hora de inicio debe ser menor que la de fin." };
  }

  if (mode === "reopen") {
    return {
      date: trimmedDate,
      fromTime: trimmedFromTime,
      toTime: trimmedToTime,
    };
  }

  if (trimmedReason.length === 0) {
    return { error: "El motivo es obligatorio." };
  }

  return {
    date: trimmedDate,
    fromTime: trimmedFromTime,
    toTime: trimmedToTime,
    reason: trimmedReason,
  };
}
