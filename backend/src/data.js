import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");
const dataFile = path.join(dataDir, "db.json");

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
      fullName: "Nino Maisuradze",
      userId: "user-1",
      email: "user@portal.test",
      ticketCode: "TKT-8F2KQ9",
      createdAt: "2026-05-10T11:20:00.000Z",
      checkedIn: false
    }
  ]
};

export async function readDb() {
  try {
    const content = await fs.readFile(dataFile, "utf8");
    if (!content.trim()) {
      await writeDb(seed);
      return seed;
    }
    const db = JSON.parse(content);
    if (!db.users) {
      db.users = seed.users;
    }
    if (!db.sessions) db.sessions = [];
    db.events = (db.events || []).map((event) => ({
      ...event,
      status: event.status || "published",
      type: event.type || "Online"
    }));
    db.registrations = (db.registrations || []).map((registration) => ({
      ...registration,
      userId: registration.id === "reg-demo-1" ? "user-1" : registration.userId,
      email: registration.id === "reg-demo-1" ? "user@portal.test" : registration.email,
      fullName: registration.id === "reg-demo-1" ? "Demo User" : registration.fullName,
      checkedIn: Boolean(registration.checkedIn)
    }));
    await writeDb(db);
    return db;
  } catch (error) {
    if (error.code !== "ENOENT" && !(error instanceof SyntaxError)) throw error;
    await writeDb(seed);
    return seed;
  }
}

export async function writeDb(db) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(db, null, 2));
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
