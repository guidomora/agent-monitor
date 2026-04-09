import {
  reservationDailyStats,
  reservationHourBlocks,
  reservationList,
  reservationOperationalNotes,
} from "@/lib/reservations/mock-data";

function getStatusTone(status: string) {
  if (status === "Confirmada") {
    return "is-confirmed";
  }

  if (status === "Pendiente") {
    return "is-pending";
  }

  if (status === "Check-in") {
    return "is-active";
  }

  return "is-cancelled";
}

export function ReservationsOverview() {
  return (
    <section className="surface-stack">
      <header className="hero-card">
        <div>
          <p className="dashboard-eyebrow">Dashboard de reservas</p>
          <h2>Lectura operativa del sistema para el dia actual</h2>
          <p className="hero-copy">
            Esta pantalla queda pensada como home del producto. Resume estado
            general, ritmo de ingresos y puntos de atencion sin depender de
            graficos.
          </p>
        </div>
        <div className="hero-summary">
          <span>Origen futuro: backend externo</span>
          <strong>UI ya preparada para conectar endpoints</strong>
        </div>
      </header>

      <section className="stats-grid" aria-label="Indicadores del dia">
        {reservationDailyStats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <p className="dashboard-eyebrow">Agenda viva</p>
              <h3>Reservas distribuidas por tramo horario</h3>
            </div>
            <span className="pill-tag">Sin analytics</span>
          </div>
          <div className="timeline-list">
            {reservationHourBlocks.map((block) => (
              <div key={block.hour} className="timeline-item">
                <div className="timeline-item__hour">
                  <strong>{block.hour}</strong>
                  <span>{block.summary}</span>
                </div>
                <div className="timeline-item__entries">
                  {block.items.map((item) => (
                    <article key={item.id} className="reservation-row">
                      <div>
                        <strong>{item.guest}</strong>
                        <p>
                          {item.partySize} personas - {item.source}
                        </p>
                      </div>
                      <span className={`status-chip ${getStatusTone(item.status)}`}>
                        {item.status}
                      </span>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <p className="dashboard-eyebrow">Alertas operativas</p>
              <h3>Aspectos que deberia resolver el equipo</h3>
            </div>
          </div>
          <div className="note-list">
            {reservationOperationalNotes.map((note) => (
              <div key={note.title} className="note-card">
                <span>{note.tag}</span>
                <strong>{note.title}</strong>
                <p>{note.description}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel-card">
        <div className="panel-card__header">
          <div>
            <p className="dashboard-eyebrow">Lista rapida</p>
            <h3>Reservas del dia con enfoque de supervision</h3>
          </div>
          <span className="pill-tag">Mock navegable</span>
        </div>
        <div className="table-list">
          {reservationList.map((reservation) => (
            <article key={reservation.id} className="table-row">
              <div>
                <strong>{reservation.guest}</strong>
                <p>
                  {reservation.time} - {reservation.phone}
                </p>
              </div>
              <div>
                <strong>{reservation.partySize} pax</strong>
                <p>{reservation.area}</p>
              </div>
              <div>
                <strong>{reservation.source}</strong>
                <p>{reservation.notes}</p>
              </div>
              <span className={`status-chip ${getStatusTone(reservation.status)}`}>
                {reservation.status}
              </span>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
