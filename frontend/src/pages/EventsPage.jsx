import React from "react";
import { Search } from "lucide-react";
import { EventCard } from "../components/EventCard";
import { AppPromo } from "../components/AppPromo";
import { FaqSection } from "../components/FaqSection";

export function EventsPage({ events, loading, openEvent, t }) {
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
          <p className="eyebrow">{t.heroEyebrow}</p>
          <h1>{t.heroTitle}</h1>
          <p className="hero-copy">{t.heroCopy}</p>
        </div>
        <div className="hero-panel">
          <div><span className="stat-value">{events.length}</span><span className="stat-label">{t.publishedEvents}</span></div>
          <div><span className="stat-value">{events.reduce((sum, event) => sum + event.remaining, 0)}</span><span className="stat-label">{t.ticketsLeft}</span></div>
        </div>
      </section>
      <section className="page-section events-band">
        <div className="section-inner">
          <div className="section-header">
            <div><p className="eyebrow">{t.upcoming}</p><h2>{t.featuredEvents}</h2></div>
            <label className="event-search">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.searchEvents}
                type="search"
              />
            </label>
          </div>
          {loading ? (
            <p className="muted">{t.loadingEvents}</p>
          ) : filteredEvents.length ? (
            <div className="event-grid">
              {filteredEvents.map((event) => <EventCard event={event} key={event.id} openEvent={openEvent} t={t} />)}
            </div>
          ) : (
            <p className="empty-search">{t.noEvents}</p>
          )}
        </div>
      </section>
      <AppPromo t={t} />
      <FaqSection t={t} />
    </>
  );
}
