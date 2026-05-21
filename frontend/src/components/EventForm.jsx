import React from "react";
import { Check, X } from "lucide-react";

export function EventForm({ form, setForm, save, editing, cancel, organizers = [], showOrganizerPicker = false }) {
  return (
    <form className="event-form" onSubmit={save}>
      <div className="form-title"><h2>{editing ? "Edit event" : "Create event"}</h2></div>
      <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
      <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <div className="form-grid">
        <label>Type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Online</option><option>In-person</option><option>Hybrid</option></select></label>
        <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="draft">Draft</option><option value="published">Published</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option></select></label>
      </div>
      <div className="form-grid">
        <label>Capacity<input type="number" min="1" value={form.ticketLimit} onChange={(e) => setForm({ ...form, ticketLimit: e.target.value })} required /></label>
        {showOrganizerPicker && (
          <label>Organizer<select value={form.organizerId || ""} onChange={(e) => setForm({ ...form, organizerId: e.target.value })} required><option value="">Choose organizer</option>{organizers.map((organizer) => <option key={organizer.id} value={organizer.id}>{organizer.fullName}</option>)}</select></label>
        )}
      </div>
      <div className="form-grid">
        <label>Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
        <label>Time<input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label>
      </div>
      <label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></label>
      <label>Image URL<input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></label>
      <button className="primary-button wide" type="submit"><Check size={18} /> {editing ? "Save changes" : "Create event"}</button>
      {editing && <button className="secondary-button wide" type="button" onClick={cancel}><X size={18} /> Cancel</button>}
    </form>
  );
}
