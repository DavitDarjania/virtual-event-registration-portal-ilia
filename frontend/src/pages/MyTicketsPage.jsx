import React from "react";
import { useEffect, useState } from "react";
import { CalendarDays, ChevronRight, MapPin, Ticket } from "lucide-react";
import { request } from "../api/request";
import { formatDate } from "../utils/date";

export function MyTicketsPage({ currentUser, openTicket, openEvent }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTickets() {
    try {
      setLoading(true);
      setTickets(await request(`/users/${encodeURIComponent(currentUser.email)}/tickets`));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [currentUser.email]);

  async function cancelTicket(id) {
    if (!window.confirm("Cancel this registration?")) return;
    await request(`/registrations/${id}`, { method: "DELETE" });
    await loadTickets();
  }

  return (
    <section className="tickets-vault">
      <div className="vault-hero">
        <div><p className="eyebrow">My tickets</p><h1>Your event passes, ready when you are.</h1><p>Every registration creates a digital ticket with a unique TKT code for check-in.</p></div>
        <div className="vault-orbit" aria-hidden="true"><Ticket size={48} /></div>
      </div>
      {loading && <p className="muted">Loading your tickets...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && tickets.length === 0 && <div className="empty-state"><Ticket size={42} /><h2>No tickets yet</h2><p>Register for an event and your digital ticket will appear here automatically.</p></div>}
      <div className="ticket-grid">
        {tickets.map(({ registration, event }, index) => (
          <article className="vault-ticket" key={registration.id} style={{ "--delay": `${index * 70}ms` }}>
            <div className="vault-ticket-image">{event.image ? <img src={event.image} alt="" /> : <div className="image-fallback" />}<span className="badge">{event.type}</span></div>
            <div className="vault-ticket-body">
              <span className="ticket-mini-code">{registration.ticketCode}</span>
              <h2>{event.title}</h2>
              <div className="detail-list">
                <span><CalendarDays size={18} /> {formatDate(event.date)} at {event.time}</span>
                <span><MapPin size={18} /> {event.location}</span>
              </div>
              <div className="ticket-actions">
                <button className="primary-button" onClick={() => openTicket(registration.ticketCode)} type="button">Open ticket <ChevronRight size={18} /></button>
                <button className="secondary-button" onClick={() => openEvent(event.id)} type="button">Event page</button>
                {!registration.checkedIn && <button className="secondary-button danger-text" onClick={() => cancelTicket(registration.id)} type="button">Cancel</button>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
