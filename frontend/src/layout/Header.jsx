import React from "react";
import { ClipboardList, LayoutDashboard, Search, ShieldCheck, Ticket } from "lucide-react";
import { categoryLabels } from "../constants";

export function Header({ view, setView, currentUser, logout }) {
  const showCategories = currentUser?.role === "User" && view === "events";
  const nav = currentUser
    ? {
        User: [["events", "Events"], ["myTickets", "My tickets"]],
        Organizer: [["organizer", "Organizer"]],
        Admin: [["admin", "Admin"]]
      }[currentUser.role]
    : [];
  const homeView = currentUser
    ? { User: "events", Organizer: "organizer", Admin: "admin" }[currentUser.role]
    : "events";

  return (
    <header className="site-header">
      <div className="topbar">
        <button className="brand" onClick={() => setView(homeView)} type="button">
          <span className="brand-mark">TKT</span>
          <span>Virtual Events</span>
        </button>
        <div className="search-box">
          <Search size={18} />
          <span>Search events, venues, tickets</span>
        </div>
        {currentUser ? (
          <button className="language-button" onClick={logout} type="button">
            {currentUser.role}: {currentUser.fullName}
          </button>
        ) : (
          <button className="language-button" type="button">English</button>
        )}
      </div>
      <nav className={showCategories ? "nav-row" : "nav-row compact"} aria-label="Main navigation">
        {showCategories && (
          <>
            <button className="category-trigger" type="button">
              <LayoutDashboard size={18} />
              Categories
            </button>
            <div className="nav-categories">
              {categoryLabels.slice(0, 10).map((category) => (
                <button key={category} type="button">{category}</button>
              ))}
            </div>
          </>
        )}
        {currentUser && (
          <div className="role-nav">
            {nav.map(([key, label]) => (
              <button
                className={view === key ? "nav-pill active" : "nav-pill"}
                key={key}
                onClick={() => setView(key)}
                type="button"
              >
                {key === "events" && <Ticket size={18} />}
                {key === "myTickets" && <ClipboardList size={18} />}
                {key === "organizer" && <LayoutDashboard size={18} />}
                {key === "admin" && <ShieldCheck size={18} />}
                {label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
