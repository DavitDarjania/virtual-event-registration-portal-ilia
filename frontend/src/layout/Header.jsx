import React from "react";
import { ClipboardList, LayoutDashboard, Search, ShieldCheck, Ticket } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { categoryLabels } from "../constants";

function roleHome(user) {
  if (!user) return "/";
  return { User: "/events", Organizer: "/organizer", Admin: "/admin" }[user.role] || "/";
}

export function Header({ currentUser, logout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const showCategories = currentUser?.role === "User" && location.pathname === "/events";
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
