"use client";

import { useDeferredValue, useState } from "react";
import { reservationList } from "@/features/reservations/data/mock-reservations";

const initialForm = {
  guest: "Martina Ferreyra",
  date: "2026-04-09",
  time: "21:15",
  partySize: "4",
  phone: "+54 11 6421-2214",
  source: "WhatsApp",
  notes: "Celebracion. Preferencia por salon principal.",
};

export function ReservationsManager() {
  const [query, setQuery] = useState("");
  const [selectedReservationId, setSelectedReservationId] = useState(
    reservationList[0]?.id ?? "",
  );
  const [form, setForm] = useState(initialForm);
  const deferredQuery = useDeferredValue(query);

  const filteredReservations = reservationList.filter((reservation) => {
    const normalized = deferredQuery.trim().toLowerCase();

    if (!normalized) {
      return true;
    }

    return (
      reservation.guest.toLowerCase().includes(normalized) ||
      reservation.phone.toLowerCase().includes(normalized) ||
      reservation.source.toLowerCase().includes(normalized)
    );
  });

  return (
    <section className="surface-stack">
      <header className="hero-card hero-card--management">
        <div>
          <p className="dashboard-eyebrow">Gestion de reservas</p>
          <h2>Esqueleto CRUD listo para conectar con otro backend</h2>
          <p className="hero-copy">
            Esta vista separa claramente listado, detalle editable y acciones.
            Nada persiste todavia: el objetivo es validar flujo y navegacion
            antes de integrar APIs.
          </p>
        </div>
        <div className="hero-actions">
          <button type="button" className="action-button action-button--primary">
            Nueva reserva
          </button>
          <button type="button" className="action-button">
            Duplicar esquema
          </button>
        </div>
      </header>

      <section className="crud-grid">
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <p className="dashboard-eyebrow">Listado</p>
              <h3>Reservas encontradas</h3>
            </div>
          </div>
          <label className="search-field">
            <span className="sr-only">Buscar reservas</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por huesped, telefono o canal..."
            />
          </label>
          <div className="crud-list">
            {filteredReservations.map((reservation) => {
              const isSelected = reservation.id === selectedReservationId;

              return (
                <button
                  key={reservation.id}
                  type="button"
                  className={`crud-list__item ${isSelected ? "is-selected" : ""}`}
                  onClick={() => setSelectedReservationId(reservation.id)}
                >
                  <div>
                    <strong>{reservation.guest}</strong>
                    <p>
                      {reservation.time} - {reservation.partySize} pax
                    </p>
                  </div>
                  <span>{reservation.status}</span>
                </button>
              );
            })}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <p className="dashboard-eyebrow">Edicion</p>
              <h3>Formulario de detalle</h3>
            </div>
            <span className="pill-tag">Modo demo</span>
          </div>

          <form className="crud-form">
            <label>
              <span>Nombre</span>
              <input
                value={form.guest}
                onChange={(event) =>
                  setForm((current) => ({ ...current, guest: event.target.value }))
                }
              />
            </label>
            <div className="crud-form__row">
              <label>
                <span>Fecha</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, date: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>Hora</span>
                <input
                  type="time"
                  value={form.time}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, time: event.target.value }))
                  }
                />
              </label>
            </div>
            <div className="crud-form__row">
              <label>
                <span>Cubiertos</span>
                <input
                  type="number"
                  min="1"
                  value={form.partySize}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      partySize: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Origen</span>
                <select
                  value={form.source}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, source: event.target.value }))
                  }
                >
                  <option>WhatsApp</option>
                  <option>Web</option>
                  <option>Telefono</option>
                  <option>Manual</option>
                </select>
              </label>
            </div>
            <label>
              <span>Telefono</span>
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
              />
            </label>
            <label>
              <span>Notas</span>
              <textarea
                rows={6}
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
              />
            </label>
            <div className="crud-form__footer">
              <button type="button" className="action-button action-button--danger">
                Cancelar reserva
              </button>
              <div className="crud-form__actions">
                <button type="button" className="action-button">
                  Descartar cambios
                </button>
                <button type="button" className="action-button action-button--primary">
                  Guardar
                </button>
              </div>
            </div>
          </form>
        </article>

        <article className="panel-card panel-card--side">
          <div className="panel-card__header">
            <div>
              <p className="dashboard-eyebrow">Acciones y estado</p>
              <h3>Resumen de integracion</h3>
            </div>
          </div>
          <div className="note-list">
            <div className="note-card">
              <span>POST /reservas</span>
              <strong>Alta</strong>
              <p>Boton principal listo para disparar creacion remota.</p>
            </div>
            <div className="note-card">
              <span>PATCH /reservas/:id</span>
              <strong>Actualizacion</strong>
              <p>
                El formulario ya sugiere que campos deberian vivir en el
                payload.
              </p>
            </div>
            <div className="note-card">
              <span>DELETE /reservas/:id</span>
              <strong>Baja</strong>
              <p>
                La accion destructiva esta aislada para sumar confirmacion modal
                mas adelante.
              </p>
            </div>
          </div>
        </article>
      </section>
    </section>
  );
}
