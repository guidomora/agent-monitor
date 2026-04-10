import {
  reservationDailyStats,
  reservationHourBlocks,
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
  const currentDate = new Date();
  const [weekday, date] = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(currentDate)
    .split(", ");

  const formattedHeading = `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}\u00A0\u00A0\u00A0${date}`;

  return (
    <section className="surface-stack">
      <header className="hero-card">
        <div>
          <p className="dashboard-eyebrow">Dashboard de reservas</p>
          <h2>{formattedHeading}</h2>
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

      <section>
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
      </section>

    </section>
  );
}
