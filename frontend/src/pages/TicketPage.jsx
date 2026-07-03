import React from "react";
import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { request } from "../api/request";
import { formatDate } from "../utils/date";

export function TicketPage({ ticketCode, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [lookup, setLookup] = useState(ticketCode);
  const [error, setError] = useState("");

  async function load(code) {
    if (!code) return;
    try {
      setError("");
      setTicket(await request(`/tickets/${code}`));
    } catch (error) {
      setTicket(null);
      setError(error.message);
    }
  }

  useEffect(() => {
    load(ticketCode);
  }, [ticketCode]);

  return (
    <section className="ticket-section">
      <div className="section-header">
        <div><p className="eyebrow">Digital ticket</p><h2>Ticket details</h2></div>
        <form className="ticket-lookup" onSubmit={(event) => { event.preventDefault(); load(lookup); }}>
          <input value={lookup} onChange={(event) => setLookup(event.target.value)} placeholder="TKT-8F2KQ9" />
          <button className="secondary-button" type="submit">Find</button>
        </form>
      </div>
      {error && <p className="form-error">{error}</p>}
      {ticket && (
        <div className="digital-ticket">
          <div className="ticket-main">
            <span className="badge">Confirmed</span>
            <h2>{ticket.event.title}</h2>
            <p>{ticket.registration.fullName}</p>
            <div className="detail-list">
              <span><CalendarDays size={18} /> {formatDate(ticket.event.date)} at {ticket.event.time}</span>
              <span><MapPin size={18} /> {ticket.event.location}</span>
            </div>
          </div>
          <div className="ticket-code"><Ticket size={36} /><strong>{ticket.registration.ticketCode}</strong><span>Show this code at check-in</span></div>
        </div>
      )}
      <button className="secondary-button" onClick={onBack} type="button">Back to events</button>
    </section>
  );
}
