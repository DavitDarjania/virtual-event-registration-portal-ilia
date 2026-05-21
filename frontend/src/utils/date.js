export function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

export function buildDateChips() {
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      day: index === 0 ? "Today" : new Intl.DateTimeFormat("en", { weekday: "short" }).format(date),
      date: date.getDate(),
      month: new Intl.DateTimeFormat("en", { month: "short" }).format(date)
    };
  });
}
