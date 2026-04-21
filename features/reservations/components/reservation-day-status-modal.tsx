"use client";

import { ReservationEditLoader } from "@/features/reservations/components/reservation-edit-loader";
import type { ReservationClosedDayTarget } from "@/features/reservations/types/closed-day.types";

type ReservationDayStatusModalProps = {
  closeErrorMessage: string | null;
  isSubmitting: boolean;
  target: ReservationClosedDayTarget;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function ReservationDayStatusModal({
  closeErrorMessage,
  isSubmitting,
  target,
  onClose,
  onConfirm,
}: ReservationDayStatusModalProps) {
  const canClose = !isSubmitting;
  const hasReservations = target.reservationCount > 0;

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
        className={`dates-modal reservation-edit-modal reservation-delete-modal${
          isSubmitting ? " reservation-edit-modal--busy" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-day-status-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dates-modal__header">
          <div>
            <p className="dashboard-eyebrow">Operacion de agenda</p>
            <h3 id="reservation-day-status-modal-title">Cerrar dia</h3>
          </div>
          <button
            type="button"
            className="dates-modal__close"
            aria-label="Cerrar modal de cierre de dia"
            disabled={!canClose}
            onClick={onClose}
          >
            X
          </button>
        </div>

        <div className="reservation-delete-modal__summary reservation-day-status-modal__summary">
          <p>
            Estas por marcar <strong>{target.formattedDate}</strong> como dia cerrado.
            Antes de confirmar, revisa si hay reservas activas para esa fecha.
          </p>
          <div className="reservation-day-status-modal__stats">
            <div>
              <span>Estado actual</span>
              <strong>{target.dayStatus?.isClosed ? "Cerrado" : "Abierto"}</strong>
            </div>
            <div>
              <span>Reservas activas</span>
              <strong>{target.reservationCount}</strong>
            </div>
          </div>
          <p>
            {hasReservations
              ? "El cierre no elimina las reservas existentes. Van a seguir activas y deberan gestionarse manualmente."
              : "No hay reservas cargadas para la fecha seleccionada, asi que el cierre no deberia requerir seguimiento manual."}
          </p>
        </div>

        {closeErrorMessage ? (
          <div className="management-feedback management-feedback--danger" role="alert">
            {closeErrorMessage}
          </div>
        ) : null}

        <div className="crud-form__footer reservation-delete-modal__footer">
          <div className="crud-form__actions">
            <button
              type="button"
              className="action-button"
              onClick={onClose}
              disabled={!canClose}
            >
              Volver
            </button>
            <button
              type="button"
              className="action-button action-button--subtle-danger reservation-delete-modal__submit"
              onClick={() => {
                void onConfirm();
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cerrando dia" : "Cerrar dia igualmente"}
            </button>
          </div>
        </div>

        {isSubmitting ? (
          <div className="reservation-edit-modal__loading" role="status" aria-live="polite">
            <ReservationEditLoader />
            <span>Actualizando estado operativo de la fecha...</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
