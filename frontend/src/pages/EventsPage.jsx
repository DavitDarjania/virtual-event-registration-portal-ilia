import React from "react";
import { Search } from "lucide-react";
import { EventCard } from "../components/EventCard";
import { AppPromo } from "../components/AppPromo";
import { FaqSection } from "../components/FaqSection";

export function EventsPage({ events, loading, openEvent }) {
  const [query, setQuery] = React.useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredEvents = React.useMemo(() => {
    if (!normalizedQuery) return events;

    return events.filter((event) =>
      [event.title, event.description, event.location, event.type]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [events, normalizedQuery]);

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
      <section className="page-section events-band">
        <div className="section-inner">
          <div className="section-header">
            <div><p className="eyebrow">Upcoming</p><h2>Featured events</h2></div>
            <label className="event-search">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search events"
                type="search"
              />
            </label>
          </div>
          {loading ? (
            <p className="muted">Loading events...</p>
          ) : filteredEvents.length ? (
            <div className="event-grid">
              {filteredEvents.map((event) => <EventCard event={event} key={event.id} openEvent={openEvent} />)}
            </div>
          ) : (
            <p className="empty-search">No events match your search.</p>
          )}
        </div>
      </section>
      <AppPromo />
      <FaqSection />
    </>
  );
}
