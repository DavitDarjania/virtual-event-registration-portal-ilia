import React from "react";
import { ClipboardList, LayoutDashboard, LogOut, Moon, ShieldCheck, Sun, Ticket } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function roleHome(user) {
  if (!user) return "/";
  return { User: "/events", Organizer: "/organizer", Admin: "/admin" }[user.role] || "/";
}

export function Header({ currentUser, language, logout, setLanguage, t, theme, toggleTheme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const nav = currentUser
    ? {
        User: [["/events", t.navEvents], ["/my-tickets", t.navTickets]],
        Organizer: [["/organizer", t.navOrganizer]],
        Admin: [["/admin", t.navAdmin]]
      }[currentUser.role]
    : [];

  return (
    <header className="site-header">
      <div className="topbar">
        <button className="brand" onClick={() => navigate(roleHome(currentUser))} type="button">
          <span className="brand-mark">TKT</span>
          <span>{t.brand}</span>
        </button>
        <div className="header-actions">
          <div className="language-switch" aria-label="Language switcher">
            {["EN", "KA"].map((item) => (
              <button
                className={language === item ? "active" : ""}
                key={item}
                onClick={() => setLanguage(item)}
                type="button"
              >
                {item === "EN" ? "Eng" : "ქარ"}
              </button>
            ))}
          </div>
          <button
            className={`theme-toggle ${theme === "light" ? "light" : ""}`}
            onClick={toggleTheme}
            type="button"
            aria-label="Toggle color theme"
          >
            <span className="theme-icon sun"><Sun size={17} /></span>
            <span className="theme-icon moon"><Moon size={17} /></span>
          </button>
          {currentUser && (
            <button className="language-button" onClick={logout} type="button">
              <LogOut size={17} />
              <span>{currentUser.fullName}</span>
            </button>
          )}
        </div>
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
