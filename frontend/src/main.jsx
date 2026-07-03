import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
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

function roleHome(user) {
  if (!user) return "/";
  return { User: "/events", Organizer: "/organizer", Admin: "/admin" }[user.role] || "/";
}

function RoleRoute({ allowed, currentUser, children }) {
  if (!allowed.includes(currentUser.role)) {
    return <Navigate replace to={roleHome(currentUser)} />;
  }
  return children;
}

function EventDetailRoute({ currentUser, events, openTicket, refresh }) {
  const { eventId } = useParams();
  const event = events.find((item) => item.id === eventId);
  if (!event) return <section className="content-section"><p className="muted">Loading event...</p></section>;
  return <EventDetail currentUser={currentUser} event={event} openTicket={openTicket} refresh={refresh} />;
}

function TicketRoute() {
  const { ticketCode } = useParams();
  const navigate = useNavigate();
  return <TicketPage ticketCode={ticketCode} onBack={() => navigate("/events")} />;
}

function AppContent() {
  const [currentUser, setCurrentUser] = useState(getSessionUser);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("portal-theme") || "dark");
  const navigate = useNavigate();

  const openEvent = useMemo(
    () => (eventId) => {
      navigate(`/events/${eventId}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate]
  );

  const openTicket = useMemo(
    () => (code) => {
      navigate(`/tickets/${code}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate]
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
      if (error.message === "Invalid or expired session") {
        setCurrentUser(null);
        navigate("/");
      }
    });
  }, [currentUser?.role]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("portal-theme", theme);
  }, [theme]);

  function handleAuth(session) {
    saveSession(session);
    setCurrentUser(session.user);
    navigate(roleHome(session.user), { replace: true });
  }

  function logout() {
    clearSession();
    setCurrentUser(null);
    navigate("/", { replace: true });
  }

  async function refreshWithNotice(message) {
    await loadEvents();
    setNotice(message);
    setTimeout(() => setNotice(""), 2600);
  }

  return (
    <div className="app-shell">
      <Header
        currentUser={currentUser}
        logout={logout}
        theme={theme}
        toggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      {notice && <div className="toast">{notice}</div>}
      <main>
        {!currentUser ? (
          <Routes>
            <Route path="*" element={<AuthPage handleAuth={handleAuth} />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate replace to={roleHome(currentUser)} />} />
            <Route
              path="/events"
              element={(
                <RoleRoute allowed={["User"]} currentUser={currentUser}>
                  <EventsPage events={events} loading={loading} openEvent={openEvent} />
                </RoleRoute>
              )}
            />
            <Route
              path="/events/:eventId"
              element={<EventDetailRoute currentUser={currentUser} events={events} openTicket={openTicket} refresh={loadEvents} />}
            />
            <Route
              path="/tickets/:ticketCode"
              element={(
                <RoleRoute allowed={["User"]} currentUser={currentUser}>
                  <TicketRoute />
                </RoleRoute>
              )}
            />
            <Route
              path="/my-tickets"
              element={(
                <RoleRoute allowed={["User"]} currentUser={currentUser}>
                  <MyTicketsPage currentUser={currentUser} openTicket={openTicket} openEvent={openEvent} />
                </RoleRoute>
              )}
            />
            <Route
              path="/organizer"
              element={(
                <RoleRoute allowed={["Organizer"]} currentUser={currentUser}>
                  <OrganizerDashboard
                    currentUser={currentUser}
                    events={events}
                    refreshWithNotice={refreshWithNotice}
                    openEvent={openEvent}
                  />
                </RoleRoute>
              )}
            />
            <Route
              path="/admin"
              element={(
                <RoleRoute allowed={["Admin"]} currentUser={currentUser}>
                  <AdminPanel refreshEvents={loadEvents} openEvent={openEvent} />
                </RoleRoute>
              )}
            />
            <Route path="*" element={<Navigate replace to={roleHome(currentUser)} />} />
          </Routes>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);
