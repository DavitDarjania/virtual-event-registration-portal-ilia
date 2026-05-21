import React from "react";
import { useState } from "react";
import { ClipboardList, Edit3, Ticket, Trash2 } from "lucide-react";
import { request } from "../api/request";
import { emptyEvent } from "../constants";
import { EventForm } from "../components/EventForm";
import { CheckInPanel } from "../components/CheckInPanel";

export function OrganizerDashboard({ currentUser, events, refreshWithNotice, openEvent }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyEvent);
  const [attendees, setAttendees] = useState({});
  const ownEvents = events.filter((event) => event.organizerId === currentUser.id);

  async function save(eventSubmit) {
    eventSubmit.preventDefault();
    await request(editing ? `/events/${editing}` : "/events", {
      method: editing ? "PUT" : "POST",
      body: JSON.stringify({ ...form, organizerId: currentUser.id, organizerName: currentUser.fullName })
    });
    setEditing(null);
    setForm(emptyEvent);
    await refreshWithNotice(editing ? "Event updated" : "Event created");
  }

  async function remove(id) {
    if (!window.confirm("Delete this event and all registrations?")) return;
    await request(`/events/${id}`, { method: "DELETE" });
    await refreshWithNotice("Event deleted");
  }

  async function showAttendees(id) {
    setAttendees({ ...attendees, [id]: await request(`/events/${id}/attendees`) });
  }

  function edit(event) {
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

  return (
    <section className="dashboard-layout">
      <EventForm form={form} setForm={setForm} save={save} editing={editing} cancel={() => { setEditing(null); setForm(emptyEvent); }} />
      <div className="dashboard-list">
        <CheckInPanel />
        <div className="section-header"><div><p className="eyebrow">Organizer</p><h2>Manage events</h2></div></div>
        {ownEvents.map((event) => (
          <article className="manage-card" key={event.id}>
            <div><h3>{event.title}</h3><p>{event.registered}/{event.ticketLimit} registrations · {event.status}</p></div>
            <div className="action-row">
              <button className="icon-button" onClick={() => openEvent(event.id)} title="View event" type="button"><Ticket size={18} /></button>
              <button className="icon-button" onClick={() => edit(event)} title="Edit" type="button"><Edit3 size={18} /></button>
              <button className="icon-button" onClick={() => showAttendees(event.id)} title="Attendees" type="button"><ClipboardList size={18} /></button>
              <button className="icon-button danger" onClick={() => remove(event.id)} title="Delete" type="button"><Trash2 size={18} /></button>
            </div>
            {attendees[event.id] && <div className="attendee-list">{attendees[event.id].length === 0 ? <p>No attendees yet.</p> : attendees[event.id].map((person) => <span key={person.id}>{person.fullName} · {person.ticketCode} · {person.checkedIn ? "Checked in" : "Not checked in"}</span>)}</div>}
          </article>
        ))}
      </div>
    </section>
  );
}
