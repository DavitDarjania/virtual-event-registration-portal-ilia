import React from "react";
import { useEffect, useState } from "react";
import { CalendarDays, MapPin, ShieldCheck, Ticket, Users } from "lucide-react";
import { request } from "../api/request";
import { formatDate } from "../utils/date";

export function EventDetail({ currentUser, event, openTicket, refresh }) {
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [error, setError] = useState("");
  const isSoldOut = event.remaining === 0;

  useEffect(() => {
    if (currentUser.role === "User") setForm({ fullName: currentUser.fullName, email: currentUser.email });
  }, [currentUser]);

  async function submit(eventSubmit) {
    eventSubmit.preventDefault();
    setError("");
    try {
      const result = await request(`/events/${event.id}/register`, {
        method: "POST",
        body: JSON.stringify(form)
      });
      await refresh();
      openTicket(result.registration.ticketCode);
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <section className="detail-layout">
      <div className="detail-media">{event.image ? <img src={event.image} alt="" /> : <div className="image-fallback" />}</div>
      <div className="detail-panel">
        <span className="badge">{event.type}</span>
        <h1>{event.title}</h1>
        <p>{event.description}</p>
        <div className="detail-list">
          <span><CalendarDays size={18} /> {formatDate(event.date)} at {event.time}</span>
          <span><MapPin size={18} /> {event.location}</span>
          <span><Users size={18} /> {event.registered} of {event.ticketLimit} registered</span>
        </div>
        {currentUser.role === "User" ? (
          <form className="register-form" onSubmit={submit}>
            <label>Full name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></label>
            <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
            {error && <p className="form-error">{error}</p>}
            <button className="primary-button wide" disabled={isSoldOut} type="submit">
              <Ticket size={18} /> {isSoldOut ? "Sold out" : "Register and get ticket"}
            </button>
          </form>
        ) : (
          <div className="role-note"><ShieldCheck size={18} /><span>Organizer preview mode. Attendee registration is available only for User accounts.</span></div>
        )}
      </div>
    </section>
  );
}
