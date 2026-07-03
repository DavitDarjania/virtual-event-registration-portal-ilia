import React from "react";
import { ClipboardList, LayoutDashboard, LogOut, Moon, ShieldCheck, Sun, Ticket } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function roleHome(user) {
  if (!user) return "/";
  return { User: "/events", Organizer: "/organizer", Admin: "/admin" }[user.role] || "/";
}

export function Header({ currentUser, logout, theme, toggleTheme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguage] = React.useState("EN");
  const nav = currentUser
    ? {
        User: [["/events", "Events"], ["/my-tickets", "My tickets"]],
        Organizer: [["/organizer", "Organizer"]],
        Admin: [["/admin", "Admin"]]
      }[currentUser.role]
    : [];
  const languageButtonClass = (item) =>
    [
      "min-h-[34px] rounded-[10px] px-3 font-black transition-all duration-200",
      language === item
        ? "bg-brand-purple text-white shadow-[0_8px_18px_rgba(97,60,133,0.24)]"
        : "bg-transparent text-[var(--muted-text)] hover:text-[var(--text)]"
    ].join(" ");

  return (
    <header className="site-header">
      <div className="topbar">
        <button className="brand" onClick={() => navigate(roleHome(currentUser))} type="button">
          <span className="brand-mark">TKT</span>
          <span>Virtual Events</span>
        </button>
        <div className="header-actions">
          <div
            className="inline-flex gap-1 rounded-[14px] border border-[var(--soft-border)] bg-[var(--surface)] p-1"
            aria-label="Language switcher"
          >
            {["EN", "KA"].map((item) => (
              <button
                className={languageButtonClass(item)}
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
