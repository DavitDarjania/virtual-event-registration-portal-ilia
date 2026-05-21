import React from "react";
import { useState } from "react";
import { Search } from "lucide-react";
import { categoryLabels } from "../constants";
import { buildDateChips } from "../utils/date";
import { EventCard } from "../components/EventCard";
import { AppPromo } from "../components/AppPromo";
import { FaqSection } from "../components/FaqSection";

export function EventsPage({ events, loading, openEvent }) {
  const [query, setQuery] = useState("");
  const filtered = events.filter((event) =>
    `${event.title} ${event.location} ${event.type}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <section className="hero-band">
        <div className="hero-content">
          <p className="eyebrow">All tickets in one place</p>
          <h1>All Types of Online Tickets on One Platform</h1>
          <p className="hero-copy">Browse upcoming events, reserve your spot, and keep every digital ticket in your account.</p>
        </div>
        <div className="hero-panel">
          <div><span className="stat-value">{events.length}</span><span className="stat-label">Published events</span></div>
          <div><span className="stat-value">{events.reduce((sum, event) => sum + event.remaining, 0)}</span><span className="stat-label">Tickets left</span></div>
        </div>
      </section>
      <section className="rail-section">
        <div className="category-rail">{categoryLabels.map((category) => <button key={category} type="button">{category}</button>)}</div>
        <div className="date-rail" aria-label="Date filter">
          {buildDateChips().map((chip, index) => (
            <button className={index === 0 ? "active" : ""} key={`${chip.month}-${chip.date}`} type="button">
              <span>{chip.day}</span><strong>{chip.date}</strong><small>{chip.month}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="page-section events-band">
        <div className="section-inner">
          <div className="section-header">
            <div><p className="eyebrow">Upcoming</p><h2>Featured events</h2></div>
            <label className="input with-icon"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" /></label>
          </div>
          {loading ? <p className="muted">Loading events...</p> : <div className="event-grid">{filtered.map((event) => <EventCard event={event} key={event.id} openEvent={openEvent} />)}</div>}
        </div>
      </section>
      <AppPromo />
      <FaqSection />
    </>
  );
}
