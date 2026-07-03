import React from "react";
import { useState } from "react";
import { request } from "../api/request";

export function AuthPage({ handleAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    fullName: "",
    email: "user@portal.test",
    password: "user123",
    role: "User"
  });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const payload = mode === "login" ? { email: form.email, password: form.password } : form;
      handleAuth(await request(mode === "login" ? "/auth/login" : "/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
      }));
    } catch (error) {
      setError(error.message);
    }
  }

  function fillDemo(role) {
    const demo = {
      User: ["user@portal.test", "user123"],
      Organizer: ["organizer@portal.test", "organizer123"],
      Admin: ["admin@portal.test", "admin123"]
    }[role];
    setForm({ ...form, role, email: demo[0], password: demo[1] });
  }

  return (
    <section className="auth-layout">
      <div className="auth-copy">
        <div className="auth-copy-content">
          <p className="eyebrow">Role based portal</p>
          <h1>Choose your role before entering the event platform.</h1>
          <p>Users register for events, organizers manage attendees, and admins oversee the platform.</p>
          <div className="demo-row">
            <button type="button" onClick={() => fillDemo("User")}>User demo</button>
            <button type="button" onClick={() => fillDemo("Organizer")}>Organizer demo</button>
            <button type="button" onClick={() => fillDemo("Admin")}>Admin demo</button>
          </div>
        </div>
      </div>
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-tabs">
          <button className={mode === "login" ? "active" : ""} type="button" onClick={() => setMode("login")}>Login</button>
          <button className={mode === "register" ? "active" : ""} type="button" onClick={() => setMode("register")}>Register</button>
        </div>
        {mode === "register" && (
          <>
            <label>Full name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></label>
            <label>Role<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option>User</option><option>Organizer</option><option>Admin</option></select></label>
          </>
        )}
        <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
        <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button wide" type="submit">{mode === "login" ? "Enter portal" : "Create account"}</button>
      </form>
    </section>
  );
}
