import React from "react";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { formatDate } from "../utils/date";

export function EventCard({ event, openEvent, t }) {
  return (
    <article className="event-card">
      <div className="event-image">
        {event.image ? <img src={event.image} alt="" /> : <div className="image-fallback" />}
        <span className="badge">{event.type}</span>
      </div>
      <div className="event-body">
        <div className="event-meta">
          <span><CalendarDays size={16} /> {formatDate(event.date)} at {event.time}</span>
          <span><MapPin size={16} /> {event.location}</span>
        </div>
        <h3>{event.title}</h3>
        <p>{event.description}</p>
        <div className="capacity">
          <span>{event.registered} {t.registered}</span>
          <span>{event.remaining} {t.left}</span>
        </div>
        <div className="meter"><span style={{ width: `${Math.min((event.registered / event.ticketLimit) * 100, 100)}%` }} /></div>
        <button className="primary-button" onClick={() => openEvent(event.id)} type="button">
          {t.viewDetails} <ChevronRight size={18} />
        </button>
      </div>
    </article>
  );
}
