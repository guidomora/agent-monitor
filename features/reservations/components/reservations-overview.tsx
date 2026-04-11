import type { ReservationOverviewViewModel } from "@/features/reservations/model/reservation.view-model";

type ReservationsOverviewProps = {
  formattedHeading: string;
  overview: ReservationOverviewViewModel;
  errorMessage?: string;
};

export function ReservationsOverview({
  formattedHeading,
  overview,
  errorMessage,
}: ReservationsOverviewProps) {
  return (
    <section className="surface-stack">
      <header className="hero-card">
        <div>
          <p className="dashboard-eyebrow">Dashboard de reservas</p>
          <h2>{formattedHeading}</h2>
        </div>
      </header>

      <section className="stats-grid" aria-label="Indicadores del dia">
        {overview.stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <span>{stat.label}</span>
            <strong>
              {stat.value}
              {stat.highlightSuffix ? (
                <span
                  className="stat-card__suffix"
                  style={{ color: "var(--accent-strong)" }}
                >
                  {stat.highlightSuffix}
                </span>
              ) : null}
            </strong>
            <p>{stat.detail}</p>
          </article>
        ))}
      </section>

      <section>
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <p className="dashboard-eyebrow">Agenda</p>
              <h3>Reservas distribuidas por tramo horario</h3>
            </div>
          </div>
          {errorMessage ? (
            <div className="note-card">
              <span>Error de backend</span>
              <strong>No se pudo actualizar la agenda del dia</strong>
              <p>{errorMessage}</p>
            </div>
          ) : null}
          <div className="timeline-list">
            {overview.hourBlocks.length === 0 ? (
              <div className="note-card">
                <span>Sin reservas visibles</span>
                <strong>No hay reservas para esta ventana horaria</strong>
                <p>Se muestran las reservas desde la hora actual en adelante.</p>
              </div>
            ) : null}
            {overview.hourBlocks.map((block) => (
              <div key={block.hour} className="timeline-item">
                <div className="timeline-item__hour">
                  <div className="timeline-item__hour-header">
                    <strong>{block.hour}</strong>
                    <span
                      className={`occupancy-pill occupancy-pill--${block.occupancy.tone}`}
                    >
                      {block.occupancy.label}
                    </span>
                  </div>
                  <span>{block.reservationSummary}</span>
                  <span>{block.capacitySummary}</span>
                </div>
                <div className="timeline-item__entries">
                  {block.items.length === 0 ? (
                    <article className="reservation-row reservation-row--empty">
                      <div>
                        <strong>Sin reservas cargadas</strong>
                        <p>Este tramo horario todavia no tiene mesas asignadas.</p>
                      </div>
                    </article>
                  ) : (
                    block.items.map((item) => (
                      <article key={item.id} className="reservation-row">
                        <div>
                          <strong>{capitalizeWords(item.guest)}</strong>
                          <p>
                            {item.time} - {item.partySize} personas - {item.service}
                          </p>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}

function capitalizeWords(value: string) {
  return value.replace(/\b\p{L}/gu, (character) => character.toUpperCase());
}
