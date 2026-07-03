import crypto from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFile = path.join(__dirname, "..", ".env");

function loadEnv() {
  if (!existsSync(envFile)) return;
  const lines = readFileSync(envFile, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (process.env[key]) continue;
    process.env[key] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
  }
}

loadEnv();

const mongoUri = process.env.MONGODB_KEY;
const collectionOptions = { strict: false, versionKey: false, id: false };
const userSchema = new mongoose.Schema({ id: String }, collectionOptions);
const eventSchema = new mongoose.Schema({ id: String }, collectionOptions);
const registrationSchema = new mongoose.Schema({ id: String }, collectionOptions);
const sessionSchema = new mongoose.Schema({}, collectionOptions);

const User = mongoose.models.User || mongoose.model("User", userSchema, "users");
const Event = mongoose.models.Event || mongoose.model("Event", eventSchema, "events");
const Registration = mongoose.models.Registration || mongoose.model("Registration", registrationSchema, "registrations");
const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema, "sessions");

const seed = {
  users: [
    {
      id: "admin-1",
      fullName: "Platform Admin",
      email: "admin@portal.test",
      password: "admin123",
      role: "Admin",
      createdAt: "2026-05-01T09:00:00.000Z"
    },
    {
      id: "org-1",
      fullName: "TKT Labs",
      email: "organizer@portal.test",
      password: "organizer123",
      role: "Organizer",
      createdAt: "2026-05-01T09:10:00.000Z"
    },
    {
      id: "user-1",
      fullName: "Demo User",
      email: "user@portal.test",
      password: "user123",
      role: "User",
      createdAt: "2026-05-01T09:20:00.000Z"
    }
  ],
  events: [
    {
      id: "evt-summit-2026",
      title: "Tbilisi Digital Growth Summit",
      description:
        "A practical conference for founders, marketers, and product teams building digital businesses in Georgia.",
      type: "In-person",
      date: "2026-06-12",
      time: "10:00",
      location: "ExpoGeorgia, Tbilisi",
      ticketLimit: 180,
      organizerId: "org-1",
      organizerName: "TKT Labs",
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80",
      status: "published"
    },
    {
      id: "evt-react-bootcamp",
      title: "React Live Bootcamp",
      description:
        "An online hands-on session covering component architecture, API state, and production deployment.",
      type: "Online",
      date: "2026-06-18",
      time: "19:00",
      location: "Zoom Webinar",
      ticketLimit: 120,
      organizerId: "org-2",
      organizerName: "Frontend Guild",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
      status: "published"
    },
    {
      id: "evt-product-night",
      title: "Product Leaders Night",
      description:
        "A compact evening meetup with product case studies, networking, and live Q&A.",
      type: "In-person",
      date: "2026-07-03",
      time: "20:00",
      location: "Terminal Abashidze",
      ticketLimit: 75,
      organizerId: "org-1",
      organizerName: "TKT Labs",
      image:
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80",
      status: "published"
    }
  ],
  registrations: [
    {
      id: "reg-demo-1",
      eventId: "evt-summit-2026",
      fullName: "Demo User",
      userId: "user-1",
      email: "user@portal.test",
      ticketCode: "TKT-8F2KQ9",
      createdAt: "2026-05-10T11:20:00.000Z",
      checkedIn: false
    }
  ],
  sessions: []
};

function clean(doc) {
  const value = doc?.toObject ? doc.toObject() : doc;
  if (!value || typeof value !== "object") return value;
  const { _id, __v, ...rest } = value;
  return rest;
}

function fallbackUserId(user) {
  const byEmail = {
    "admin@portal.test": "admin-1",
    "organizer@portal.test": "org-1",
    "user@portal.test": "user-1"
  };
  return byEmail[String(user.email || "").toLowerCase()] || crypto.randomUUID();
}

function fallbackEventId(event) {
  const byTitle = {
    "Tbilisi Digital Growth Summit": "evt-summit-2026",
    "React Live Bootcamp": "evt-react-bootcamp",
    "Product Leaders Night": "evt-product-night"
  };
  return byTitle[event.title] || crypto.randomUUID();
}

function fallbackRegistrationId(registration) {
  const byTicket = {
    "TKT-8F2KQ9": "reg-demo-1"
  };
  return byTicket[registration.ticketCode] || crypto.randomUUID();
}

async function connectMongo() {
  if (!mongoUri) {
    throw new Error("MONGODB_KEY is missing. Add your Atlas connection string to backend/.env");
  }
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(mongoUri, { dbName: process.env.MONGODB_DB || "virtual_event_registration" });
}

async function seedIfEmpty() {
  const usersCount = await User.countDocuments();
  if (usersCount > 0) return;
  await Promise.all([
    User.insertMany(seed.users),
    Event.insertMany(seed.events),
    Registration.insertMany(seed.registrations)
  ]);
}

function normalizeDb(db) {
  const next = {
    users: db.users || [],
    events: db.events || [],
    registrations: db.registrations || [],
    sessions: db.sessions || []
  };

  next.events = next.events.map((event) => ({
    ...event,
    id: event.id || fallbackEventId(event),
    status: event.status || "published",
    type: event.type || "Online"
  }));
  next.users = next.users.map((user) => ({
    ...user,
    id: user.id || fallbackUserId(user)
  }));
  next.registrations = next.registrations.map((registration) => ({
    ...registration,
    id: registration.id || fallbackRegistrationId(registration),
    userId: registration.id === "reg-demo-1" ? "user-1" : registration.userId,
    email: registration.id === "reg-demo-1" ? "user@portal.test" : registration.email,
    fullName: registration.id === "reg-demo-1" ? "Demo User" : registration.fullName,
    checkedIn: Boolean(registration.checkedIn)
  }));
  next.sessions = next.sessions.filter((session) => session.token && session.userId);

  return next;
}

async function replaceDb(next) {
  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Registration.deleteMany({}),
    Session.deleteMany({})
  ]);

  await Promise.all([
    next.users.length ? User.insertMany(next.users) : Promise.resolve(),
    next.events.length ? Event.insertMany(next.events) : Promise.resolve(),
    next.registrations.length ? Registration.insertMany(next.registrations) : Promise.resolve(),
    next.sessions.length ? Session.insertMany(next.sessions) : Promise.resolve()
  ]);
}

export async function readDb() {
  await connectMongo();
  await seedIfEmpty();

  const [users, events, registrations, sessions] = await Promise.all([
    User.find().lean(),
    Event.find().lean(),
    Registration.find().lean(),
    Session.find().lean()
  ]);

  const raw = {
    users: users.map(clean),
    events: events.map(clean),
    registrations: registrations.map(clean),
    sessions: sessions.map(clean)
  };
  const normalized = normalizeDb(raw);
  if (JSON.stringify(normalized) !== JSON.stringify(raw)) {
    await replaceDb(normalized);
  }

  return normalized;
}

export async function writeDb(db) {
  await connectMongo();
  const next = normalizeDb(db);
  await replaceDb(next);
}

export function withCounts(events, registrations) {
  return events.map((event) => {
    const registered = registrations.filter((reg) => reg.eventId === event.id).length;
    return {
      ...event,
      registered,
      remaining: Math.max(event.ticketLimit - registered, 0)
    };
  });
}
