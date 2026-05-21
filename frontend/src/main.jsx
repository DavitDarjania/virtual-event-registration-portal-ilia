import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { request } from "./api/request";
import { Header } from "./layout/Header";
import { SiteFooter } from "./layout/SiteFooter";
import { AuthPage } from "./pages/AuthPage";
import { EventsPage } from "./pages/EventsPage";
import { EventDetail } from "./pages/EventDetail";
import { TicketPage } from "./pages/TicketPage";
import { MyTicketsPage } from "./pages/MyTicketsPage";
import { OrganizerDashboard } from "./pages/OrganizerDashboard";
import { AdminPanel } from "./pages/AdminPanel";
import { clearSession, getSessionUser, saveSession } from "./state/session";
import "./styles.css";

function App() {
  const [currentUser, setCurrentUser] = useState(getSessionUser);
  const [view, setView] = useState("events");
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [ticketCode, setTicketCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId),
    [events, selectedEventId]
  );

  async function loadEvents() {
    setLoading(true);
    const path = currentUser?.role === "Admin" || currentUser?.role === "Organizer"
      ? "/events?includeAll=true"
      : "/events";
    const data = await request(path);
    setEvents(data);
    setLoading(false);
  }

  useEffect(() => {
    loadEvents().catch((error) => {
      setNotice(error.message);
      setLoading(false);
    });
  }, [currentUser?.role]);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "Organizer") setView("organizer");
    if (currentUser.role === "Admin") setView("admin");
    if (currentUser.role === "User") setView("events");
  }, [currentUser]);

  function handleAuth(session) {
    saveSession(session);
    setCurrentUser(session.user);
  }

  function logout() {
    clearSession();
    setCurrentUser(null);
    setView("events");
  }

  function openEvent(eventId) {
    setSelectedEventId(eventId);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openTicket(code) {
    setTicketCode(code);
    setView("ticket");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function refreshWithNotice(message) {
    await loadEvents();
    setNotice(message);
    setTimeout(() => setNotice(""), 2600);
  }

  return (
    <div className="app-shell">
      <Header view={view} setView={setView} currentUser={currentUser} logout={logout} />
      {notice && <div className="toast">{notice}</div>}
      <main>
        {!currentUser && <AuthPage handleAuth={handleAuth} />}
        {currentUser && (
          <>
            {view === "events" && currentUser.role === "User" && (
              <EventsPage events={events} loading={loading} openEvent={openEvent} />
            )}
            {view === "detail" && selectedEvent && (
              <EventDetail
                currentUser={currentUser}
                event={selectedEvent}
                openTicket={openTicket}
                refresh={loadEvents}
              />
            )}
            {view === "ticket" && currentUser.role === "User" && (
              <TicketPage ticketCode={ticketCode} setView={setView} />
            )}
            {view === "myTickets" && currentUser.role === "User" && (
              <MyTicketsPage currentUser={currentUser} openTicket={openTicket} openEvent={openEvent} />
            )}
            {view === "organizer" && currentUser.role === "Organizer" && (
              <OrganizerDashboard
                currentUser={currentUser}
                events={events}
                refreshWithNotice={refreshWithNotice}
                openEvent={openEvent}
              />
            )}
            {view === "admin" && currentUser.role === "Admin" && (
              <AdminPanel refreshEvents={loadEvents} openEvent={openEvent} />
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
