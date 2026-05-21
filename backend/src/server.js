import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import { readDb, withCounts, writeDb } from "./data.js";

const app = express();
const port = process.env.PORT || 4001;
const roles = ["Admin", "Organizer", "User"];
const eventStatuses = ["draft", "published", "cancelled", "completed"];
const eventTypes = ["Online", "In-person", "Hybrid"];

app.use(cors());
app.use(express.json());

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return { passwordHash: hash, passwordSalt: salt };
}

function verifyPassword(user, password) {
  if (user.passwordHash && user.passwordSalt) {
    return hashPassword(password, user.passwordSalt).passwordHash === user.passwordHash;
  }
  return user.password === password;
}

function publicUser(user) {
  if (!user) return null;
  const { password, passwordHash, passwordSalt, ...safeUser } = user;
  return safeUser;
}

function buildTicketCode() {
  return `TKT-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

function sortByDate(events) {
  return [...events].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
}

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateEventPayload(payload, partial = false) {
  const errors = [];
  const title = String(payload.title || "").trim();
  const date = String(payload.date || "").trim();
  const location = String(payload.location || "").trim();
  const ticketLimit = Number(payload.ticketLimit);

  if (!partial || payload.title !== undefined) {
    if (title.length < 3) errors.push("Title must be at least 3 characters");
  }
  if (!partial || payload.date !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00`))) {
      errors.push("A valid event date is required");
    }
  }
  if (!partial || payload.location !== undefined) {
    if (location.length < 2) errors.push("Location is required");
  }
  if (!partial || payload.ticketLimit !== undefined) {
    if (!Number.isInteger(ticketLimit) || ticketLimit < 1) errors.push("Capacity must be a positive whole number");
  }
  if (payload.type !== undefined && !eventTypes.includes(payload.type)) {
    errors.push("Event type must be Online, In-person, or Hybrid");
  }
  if (payload.status !== undefined && !eventStatuses.includes(payload.status)) {
    errors.push("Event status is invalid");
  }
  if (payload.image && !/^https?:\/\/.+/i.test(payload.image)) {
    errors.push("Image URL must start with http or https");
  }

  return errors;
}

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Authentication required" });

  const db = await readDb();
  const session = db.sessions?.find((item) => item.token === token);
  const user = session ? db.users.find((item) => item.id === session.userId) : null;
  if (!session || !user || user.disabled) return res.status(401).json({ message: "Invalid or expired session" });

  req.db = db;
  req.user = user;
  next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission for this action" });
    }
    next();
  };
}

function canManageEvent(user, event) {
  return user.role === "Admin" || (user.role === "Organizer" && event.organizerId === user.id);
}

async function createSession(db, user) {
  const token = crypto.randomBytes(32).toString("hex");
  db.sessions = db.sessions || [];
  db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  await writeDb(db);
  return token;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "virtual-event-registration-backend" });
});

app.post("/api/auth/register", async (req, res) => {
  const db = await readDb();
  const fullName = String(req.body.fullName || "").trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");
  const role = req.body.role;

  if (fullName.length < 2 || !isValidEmail(email) || password.length < 6 || !roles.includes(role)) {
    return res.status(400).json({ message: "Use a valid name, email, role, and password with at least 6 characters" });
  }

  const exists = db.users.some((user) => normalizeEmail(user.email) === email);
  if (exists) return res.status(409).json({ message: "Email is already registered" });

  const user = {
    id: crypto.randomUUID(),
    fullName,
    email,
    ...hashPassword(password),
    role,
    disabled: false,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  const token = await createSession(db, user);
  res.status(201).json({ user: publicUser(user), token });
});

app.post("/api/auth/login", async (req, res) => {
  const db = await readDb();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");
  const user = db.users.find((item) => normalizeEmail(item.email) === email);

  if (!user || user.disabled || !verifyPassword(user, password)) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!user.passwordHash) {
    Object.assign(user, hashPassword(password));
    delete user.password;
  }

  const token = await createSession(db, user);
  res.json({ user: publicUser(user), token });
});

app.get("/api/events", async (req, res) => {
  const db = await readDb();
  const includeAll = req.query.includeAll === "true";
  if (includeAll) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const session = db.sessions?.find((item) => item.token === token);
    const user = session ? db.users.find((item) => item.id === session.userId) : null;
    if (!user || !["Admin", "Organizer"].includes(user.role)) {
      return res.status(403).json({ message: "Only admins and organizers can view unpublished events" });
    }
  }
  const events = includeAll ? db.events : db.events.filter((event) => event.status === "published");
  res.json(sortByDate(withCounts(events, db.registrations)));
});

app.get("/api/events/:id", async (req, res) => {
  const db = await readDb();
  const event = withCounts(db.events, db.registrations).find((item) => item.id === req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
});

app.post("/api/events", requireAuth, requireRole("Admin", "Organizer"), async (req, res) => {
  const db = req.db;
  const errors = validateEventPayload(req.body);
  if (errors.length) return res.status(400).json({ message: errors.join(". ") });

  const organizer = req.user.role === "Admin" && req.body.organizerId
    ? db.users.find((user) => user.id === req.body.organizerId && user.role === "Organizer")
    : req.user;

  if (!organizer) return res.status(400).json({ message: "A valid organizer is required" });

  const event = {
    id: crypto.randomUUID(),
    title: req.body.title.trim(),
    description: req.body.description || "",
    type: req.body.type || "Online",
    date: req.body.date,
    time: req.body.time || "18:00",
    location: req.body.location.trim(),
    ticketLimit: Number(req.body.ticketLimit),
    organizerId: organizer.id,
    organizerName: organizer.fullName,
    image: req.body.image || "",
    status: req.body.status || "draft",
    createdAt: new Date().toISOString()
  };

  db.events.push(event);
  await writeDb(db);
  res.status(201).json(event);
});

app.put("/api/events/:id", requireAuth, requireRole("Admin", "Organizer"), async (req, res) => {
  const db = req.db;
  const index = db.events.findIndex((event) => event.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Event not found" });
  if (!canManageEvent(req.user, db.events[index])) return res.status(403).json({ message: "You can only manage your own events" });

  const errors = validateEventPayload(req.body, true);
  if (errors.length) return res.status(400).json({ message: errors.join(". ") });

  const currentRegistrations = db.registrations.filter((reg) => reg.eventId === req.params.id).length;
  const nextLimit = Number(req.body.ticketLimit ?? db.events[index].ticketLimit);
  if (nextLimit < currentRegistrations) {
    return res.status(409).json({ message: "Capacity cannot be lower than current registrations" });
  }

  const organizer = req.user.role === "Admin" && req.body.organizerId
    ? db.users.find((user) => user.id === req.body.organizerId && user.role === "Organizer")
    : null;

  db.events[index] = {
    ...db.events[index],
    ...req.body,
    ticketLimit: nextLimit,
    organizerId: organizer?.id || db.events[index].organizerId,
    organizerName: organizer?.fullName || db.events[index].organizerName
  };

  await writeDb(db);
  res.json(db.events[index]);
});

app.delete("/api/events/:id", requireAuth, requireRole("Admin", "Organizer"), async (req, res) => {
  const db = req.db;
  const event = db.events.find((item) => item.id === req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  if (!canManageEvent(req.user, event)) return res.status(403).json({ message: "You can only delete your own events" });

  db.events = db.events.filter((item) => item.id !== req.params.id);
  db.registrations = db.registrations.filter((registration) => registration.eventId !== req.params.id);
  await writeDb(db);
  res.status(204).send();
});

app.get("/api/events/:id/attendees", requireAuth, requireRole("Admin", "Organizer"), async (req, res) => {
  const db = req.db;
  const event = db.events.find((item) => item.id === req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  if (!canManageEvent(req.user, event)) return res.status(403).json({ message: "You can only view attendees for your events" });

  res.json(db.registrations.filter((registration) => registration.eventId === req.params.id));
});

app.post("/api/events/:id/register", requireAuth, requireRole("User"), async (req, res) => {
  const db = req.db;
  const event = db.events.find((item) => item.id === req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  if (event.status !== "published") return res.status(409).json({ message: "Registration is not open for this event" });

  const registered = db.registrations.filter((reg) => reg.eventId === event.id).length;
  if (registered >= event.ticketLimit) return res.status(409).json({ message: "Event is sold out" });

  const existing = db.registrations.find(
    (registration) => registration.eventId === event.id && normalizeEmail(registration.email) === normalizeEmail(req.user.email)
  );
  if (existing) return res.status(409).json({ message: "You are already registered for this event" });

  const registration = {
    id: crypto.randomUUID(),
    eventId: event.id,
    userId: req.user.id,
    fullName: req.user.fullName,
    email: req.user.email,
    ticketCode: buildTicketCode(),
    createdAt: new Date().toISOString(),
    checkedIn: false
  };

  db.registrations.push(registration);
  await writeDb(db);
  res.status(201).json({ registration, event });
});

app.get("/api/tickets/:code", requireAuth, async (req, res) => {
  const db = req.db;
  const registration = db.registrations.find(
    (item) => item.ticketCode.toLowerCase() === req.params.code.toLowerCase()
  );
  if (!registration) return res.status(404).json({ message: "Ticket not found" });

  const event = db.events.find((item) => item.id === registration.eventId);
  const isOwner = req.user.role === "User" && normalizeEmail(registration.email) === normalizeEmail(req.user.email);
  const isManager = event && canManageEvent(req.user, event);
  if (!isOwner && !isManager) return res.status(403).json({ message: "You cannot view this ticket" });

  res.json({ registration, event });
});

app.get("/api/users/:email/tickets", requireAuth, async (req, res) => {
  const db = req.db;
  const email = decodeURIComponent(req.params.email).toLowerCase();
  if (req.user.role !== "Admin" && normalizeEmail(req.user.email) !== email) {
    return res.status(403).json({ message: "You can only view your own tickets" });
  }

  const tickets = db.registrations
    .filter((registration) => normalizeEmail(registration.email) === email)
    .map((registration) => ({
      registration,
      event: db.events.find((event) => event.id === registration.eventId)
    }))
    .filter((ticket) => ticket.event)
    .sort((a, b) => `${a.event.date}T${a.event.time}`.localeCompare(`${b.event.date}T${b.event.time}`));

  res.json(tickets);
});

app.delete("/api/registrations/:id", requireAuth, async (req, res) => {
  const db = req.db;
  const registration = db.registrations.find((item) => item.id === req.params.id);
  if (!registration) return res.status(404).json({ message: "Registration not found" });

  const event = db.events.find((item) => item.id === registration.eventId);
  const canCancel = req.user.role === "Admin" || normalizeEmail(registration.email) === normalizeEmail(req.user.email) || (event && canManageEvent(req.user, event));
  if (!canCancel) return res.status(403).json({ message: "You cannot delete this registration" });
  if (registration.checkedIn && req.user.role !== "Admin") return res.status(409).json({ message: "Checked-in tickets can only be removed by an admin" });

  db.registrations = db.registrations.filter((item) => item.id !== req.params.id);
  await writeDb(db);
  res.status(204).send();
});

app.post("/api/check-in", requireAuth, requireRole("Admin", "Organizer"), async (req, res) => {
  const db = req.db;
  const code = String(req.body.ticketCode || "").trim().toLowerCase();
  const registration = db.registrations.find((item) => item.ticketCode.toLowerCase() === code);
  if (!registration) return res.status(404).json({ message: "Ticket not found" });

  const event = db.events.find((item) => item.id === registration.eventId);
  if (!event) return res.status(404).json({ message: "Event not found" });
  if (!canManageEvent(req.user, event)) return res.status(403).json({ message: "You cannot check in attendees for this event" });

  registration.checkedIn = true;
  registration.checkedInAt = new Date().toISOString();
  await writeDb(db);
  res.json({ registration, event });
});

app.get("/api/admin/overview", requireAuth, requireRole("Admin"), async (req, res) => {
  const db = req.db;
  const events = withCounts(db.events, db.registrations);
  res.json({
    events,
    users: db.users.map(publicUser),
    registrations: db.registrations,
    stats: {
      totalEvents: db.events.length,
      totalUsers: db.users.length,
      totalRegistrations: db.registrations.length,
      totalCapacity: db.events.reduce((sum, event) => sum + Number(event.ticketLimit), 0),
      soldOutEvents: events.filter((event) => event.remaining === 0).length
    }
  });
});

app.patch("/api/admin/users/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  const db = req.db;
  const user = db.users.find((item) => item.id === req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (req.body.role !== undefined) {
    if (!roles.includes(req.body.role)) return res.status(400).json({ message: "Invalid role" });
    user.role = req.body.role;
  }
  if (req.body.disabled !== undefined) {
    user.disabled = Boolean(req.body.disabled);
  }

  await writeDb(db);
  res.json(publicUser(user));
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
