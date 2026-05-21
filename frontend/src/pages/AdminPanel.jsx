import React from "react";
import { useEffect, useState } from "react";
import { Edit3, Ticket, Trash2 } from "lucide-react";
import { request } from "../api/request";
import { emptyEvent } from "../constants";
import { Stat } from "../components/Stat";
import { EventForm } from "../components/EventForm";
import { CheckInPanel } from "../components/CheckInPanel";

export function AdminPanel({ refreshEvents, openEvent }) {
  const [overview, setOverview] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyEvent);

  async function load() {
    setOverview(await request("/admin/overview"));
    await refreshEvents();
  }

  useEffect(() => {
    load();
  }, []);

  async function saveEvent(eventSubmit) {
    eventSubmit.preventDefault();
    if (!editing && !form.organizerId) {
      window.alert("Choose an organizer before creating the event.");
      return;
    }
    await request(editing ? `/events/${editing}` : "/events", {
      method: editing ? "PUT" : "POST",
      body: JSON.stringify(form)
    });
    setEditing(null);
    setForm(emptyEvent);
    await load();
  }

  async function removeEvent(id) {
    if (!window.confirm("Delete this event and all registrations?")) return;
    await request(`/events/${id}`, { method: "DELETE" });
    await load();
  }

  async function removeRegistration(id) {
    if (!window.confirm("Delete this registration?")) return;
    await request(`/registrations/${id}`, { method: "DELETE" });
    await load();
  }

  async function updateUser(id, patch) {
    await request(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    await load();
  }

  function editEvent(event) {
    setEditing(event.id);
    setForm({
      title: event.title,
      description: event.description,
      type: event.type,
      date: event.date,
      time: event.time,
      location: event.location,
      ticketLimit: event.ticketLimit,
      organizerId: event.organizerId,
      organizerName: event.organizerName,
      image: event.image,
      status: event.status
    });
  }

  if (!overview) return <section className="content-section"><p className="muted">Loading admin panel...</p></section>;

  const organizers = overview.users.filter((user) => user.role === "Organizer" && !user.disabled);

  return (
    <section className="admin-layout">
      <div className="content-section">
        <div className="section-header"><div><p className="eyebrow">Admin</p><h2>Platform overview</h2></div></div>
        <div className="stats-grid">
          <Stat label="Events" value={overview.stats.totalEvents} />
          <Stat label="Users" value={overview.stats.totalUsers} />
          <Stat label="Registrations" value={overview.stats.totalRegistrations} />
          <Stat label="Sold out" value={overview.stats.soldOutEvents} />
        </div>
        <CheckInPanel />
      </div>

      <section className="dashboard-layout admin-manage">
        <EventForm
          form={form}
          setForm={setForm}
          save={saveEvent}
          editing={editing}
          cancel={() => { setEditing(null); setForm(emptyEvent); }}
          organizers={organizers}
          showOrganizerPicker
        />
        <div className="dashboard-list">
          <div className="section-header"><div><p className="eyebrow">Admin</p><h2>Manage all events</h2></div></div>
          {overview.events.map((event) => (
            <article className="manage-card" key={event.id}>
              <div><h3>{event.title}</h3><p>{event.organizerName} · {event.registered}/{event.ticketLimit} · {event.status}</p></div>
              <div className="action-row">
                <button className="icon-button" onClick={() => openEvent(event.id)} title="View event" type="button"><Ticket size={18} /></button>
                <button className="icon-button" onClick={() => editEvent(event)} title="Edit" type="button"><Edit3 size={18} /></button>
                <button className="icon-button danger" onClick={() => removeEvent(event.id)} title="Delete" type="button"><Trash2 size={18} /></button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="content-section">
        <div className="section-header"><div><p className="eyebrow">Admin</p><h2>User management</h2></div></div>
        <div className="admin-table">
          <div className="table-row users head"><span>User</span><span>Role</span><span>Status</span><span></span></div>
          {overview.users.map((user) => (
            <div className="table-row users" key={user.id}>
              <span>{user.fullName}<small>{user.email} · {user.id}</small></span>
              <span><select value={user.role} onChange={(event) => updateUser(user.id, { role: event.target.value })}><option>User</option><option>Organizer</option><option>Admin</option></select></span>
              <span>{user.disabled ? "Disabled" : "Active"}</span>
              <button className="secondary-button" onClick={() => updateUser(user.id, { disabled: !user.disabled })} type="button">{user.disabled ? "Enable" : "Disable"}</button>
            </div>
          ))}
        </div>
      </div>

      <div className="content-section">
        <div className="section-header"><div><p className="eyebrow">Admin</p><h2>Registrations</h2></div></div>
        <div className="admin-table">
          <div className="table-row head"><span>Attendee</span><span>Event</span><span>Ticket</span><span></span></div>
          {overview.registrations.map((registration) => {
            const event = overview.events.find((item) => item.id === registration.eventId);
            return (
              <div className="table-row" key={registration.id}>
                <span>{registration.fullName}<small>{registration.email}</small></span>
                <span>{event?.title || "Deleted event"}</span>
                <span>{registration.ticketCode}<small>{registration.checkedIn ? "Checked in" : "Not checked in"}</small></span>
                <button className="icon-button danger" onClick={() => removeRegistration(registration.id)} title="Delete registration" type="button"><Trash2 size={18} /></button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
