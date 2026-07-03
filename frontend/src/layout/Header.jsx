import React from "react";
import { ClipboardList, LayoutDashboard, LogOut, ShieldCheck, Ticket } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function roleHome(user) {
  if (!user) return "/";
  return { User: "/events", Organizer: "/organizer", Admin: "/admin" }[user.role] || "/";
}

export function Header({ currentUser, logout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const nav = currentUser
    ? {
        User: [["/events", "Events"], ["/my-tickets", "My tickets"]],
        Organizer: [["/organizer", "Organizer"]],
        Admin: [["/admin", "Admin"]]
      }[currentUser.role]
    : [];

  return (
    <header className="site-header">
      <div className="topbar">
        <button className="brand" onClick={() => navigate(roleHome(currentUser))} type="button">
          <span className="brand-mark">TKT</span>
          <span>Virtual Events</span>
        </button>
        {currentUser ? (
          <button className="language-button" onClick={logout} type="button">
            <LogOut size={17} />
            <span>{currentUser.fullName}</span>
          </button>
        ) : (
          <button className="language-button" type="button">English</button>
        )}
      </div>
      <nav className="nav-row compact" aria-label="Main navigation">
        {currentUser && (
          <div className="role-nav">
            {nav.map(([path, label]) => (
              <button
                className={location.pathname === path ? "nav-pill active" : "nav-pill"}
                key={path}
                onClick={() => navigate(path)}
                type="button"
              >
                {path === "/events" && <Ticket size={18} />}
                {path === "/my-tickets" && <ClipboardList size={18} />}
                {path === "/organizer" && <LayoutDashboard size={18} />}
                {path === "/admin" && <ShieldCheck size={18} />}
                {label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
