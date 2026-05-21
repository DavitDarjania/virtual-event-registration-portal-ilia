import React from "react";
import { useState } from "react";
import { request } from "../api/request";

export function CheckInPanel() {
  const [ticketCode, setTicketCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function checkIn(event) {
    event.preventDefault();
    setError("");
    setResult(null);
    try {
      setResult(await request("/check-in", {
        method: "POST",
        body: JSON.stringify({ ticketCode })
      }));
      setTicketCode("");
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <form className="checkin-panel" onSubmit={checkIn}>
      <div>
        <p className="eyebrow">Check-in</p>
        <h2>Validate attendee ticket</h2>
      </div>
      <div className="ticket-lookup">
        <input value={ticketCode} onChange={(event) => setTicketCode(event.target.value)} placeholder="TKT-8F2KQ9" required />
        <button className="primary-button" type="submit">Check in</button>
      </div>
      {error && <p className="form-error">{error}</p>}
      {result && <p className="success-text">{result.registration.fullName} checked in for {result.event.title}.</p>}
    </form>
  );
}
