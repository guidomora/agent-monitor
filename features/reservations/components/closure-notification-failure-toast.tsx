import type { ClosureFailedNotificationDto } from "@/features/reservations/types/reservations.dto";

type ClosureNotificationFailureToastProps = {
  failedNotifications: ClosureFailedNotificationDto[];
  onClose: (failedNotificationIndex: number) => void;
};

export function ClosureNotificationFailureToast({
  failedNotifications,
  onClose,
}: ClosureNotificationFailureToastProps) {
  return (
    <div
      className="closure-failure-toast-stack"
      role="alert"
      aria-live="assertive"
      aria-label="Fallos de notificaciones de cierre"
    >
      {failedNotifications.map((notification, index) => (
        <aside
          key={`${notification.phone}-${notification.date}-${notification.time}-${index}`}
          className="closure-failure-toast"
        >
          <div className="closure-failure-toast__content">
            <strong>Fallo de notificacion de cierre</strong>
            <p>
              No se pudo notificar a <strong>{notification.name}</strong>,{" "}
              <strong>{getNotificationPhone(notification)}</strong>.
            </p>
          </div>

          <button
            type="button"
            className="closure-failure-toast__close"
            aria-label={`Cerrar alerta de fallo para ${notification.name}`}
            onClick={() => onClose(index)}
          >
            X
          </button>
        </aside>
      ))}
    </div>
  );
}

function getNotificationPhone(notification: ClosureFailedNotificationDto) {
  const fallbackNotification = notification as ClosureFailedNotificationDto & {
    phoneNumber?: string;
    customerPhone?: string;
  };
  const phone =
    notification.phone ||
    fallbackNotification.phoneNumber ||
    fallbackNotification.customerPhone;

  return phone?.trim() || "telefono no informado";
}
