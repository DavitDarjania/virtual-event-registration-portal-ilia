export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4001/api";

export const emptyEvent = {
  title: "",
  description: "",
  type: "Online",
  date: "",
  time: "18:00",
  location: "",
  ticketLimit: 100,
  organizerId: "",
  organizerName: "TKT Labs",
  image: "",
  status: "draft"
};

export const categoryLabels = [
  "Music/concert",
  "Cinema",
  "Railway",
  "Transport",
  "Theatre",
  "Opera",
  "Sport",
  "Festival",
  "Kids",
  "Conference",
  "Tourism",
  "Museum"
];
