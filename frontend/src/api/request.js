import { API_URL } from "../constants";
import { clearSession, getSession } from "../state/session";

export async function request(path, options = {}) {
  const session = getSession();
  const headers = {
    "Content-Type": "application/json",
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    if (response.status === 401) {
      clearSession();
    }
    throw new Error(error.message || "Request failed");
  }

  if (response.status === 204) return null;
  return response.json();
}
