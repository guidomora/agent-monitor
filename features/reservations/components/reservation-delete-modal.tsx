"use client";

import { ReservationEditLoader } from "@/features/reservations/components/reservation-edit-loader";
import type { ReservationDeleteTarget } from "@/features/reservations/types/reservation-delete.types";
import type { DeleteReservationRequestDto } from "@/features/reservations/types/reservations.dto";

type ReservationDeleteModalProps = {
  deleteErrorMessage: string | null;
  isSubmitting: boolean;
  reservationToDelete: ReservationDeleteTarget;
  onClose: () => void;
  onSubmit: (payload: DeleteReservationRequestDto) => Promise<void>;
};

export function ReservationDeleteModal({
  deleteErrorMessage,
  isSubmitting,
  reservationToDelete,
  onClose,
  onSubmit,
}: ReservationDeleteModalProps) {
  const canClose = !isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      phone: reservationToDelete.reservation.phone,
      currentDate: reservationToDelete.currentDate,
      currentTime: reservationToDelete.reservation.time,
    });
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
        className={`dates-modal reservation-edit-modal reservation-delete-modal${
          isSubmitting ? " reservation-edit-modal--busy" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-delete-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dates-modal__header">
          <div>
            <p className="dashboard-eyebrow">Eliminacion</p>
            <h3 id="reservation-delete-modal-title">Eliminar reserva</h3>
          </div>
          <button
            type="button"
            className="dates-modal__close"
            aria-label="Cerrar confirmacion de borrado"
            disabled={!canClose}
            onClick={onClose}
          >
            X
          </button>
        </div>

        <div className="reservation-delete-modal__summary">
          <p>
            Vas a eliminar la reserva de <strong>{reservationToDelete.reservation.guest}</strong>.
            Esta accion no se puede deshacer.
          </p>
          <div className="reservation-delete-modal__details">
            <div>
              <span>Fecha:</span>
              <strong>{reservationToDelete.currentDate}</strong>
            </div>
            <div>
              <span>Hora:</span>
              <strong>{reservationToDelete.reservation.time}</strong>
            </div>
            <div>
              <span>Telefono:</span>
              <strong>{reservationToDelete.reservation.phone}</strong>
            </div>
            <div>
              <span>Cubiertos:</span>
              <strong>{reservationToDelete.reservation.partySize}</strong>
            </div>
          </div>
        </div>

        <form className="crud-form" onSubmit={handleSubmit}>
          {deleteErrorMessage ? (
            <div className="management-feedback management-feedback--danger" role="alert">
              {deleteErrorMessage}
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
                Cancelar
              </button>
              <button
                type="submit"
                className="action-button action-button--subtle-danger reservation-delete-modal__submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Eliminando reserva" : "Eliminar reserva"}
              </button>
            </div>
          </div>
        </form>

        {isSubmitting ? (
          <div className="reservation-edit-modal__loading" role="status" aria-live="assertive">
            <ReservationEditLoader />
            <span>Eliminando reserva...</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
