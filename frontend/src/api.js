/**
 * api.js — Thin wrapper around fetch() for calling the Express backend.
 *
 * WHY A WRAPPER?
 * 1. Centralises the base URL so it's easy to change later.
 * 2. Adds automatic JSON parsing and error handling in one place.
 * 3. The Vite dev server proxies /api/* to http://localhost:3001,
 *    so we use relative URLs ("/api/…") – no hardcoded origins.
 */

const BASE = "/api";

/**
 * Generic fetch helper.
 * Throws an Error with a user-friendly message on non-2xx responses.
 */
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    // The backend always returns { error: "…" } on failure
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

// ── Exported API methods ─────────────────────────────────────────────

/** GET /api/devices → { devices: [...] } */
export function fetchDevices() {
  return request("/devices");
}

/** POST /api/devices/:id/command → { device, entry } */
export function sendCommand(deviceId, command) {
  return request(`/devices/${deviceId}/command`, {
    method: "POST",
    body: JSON.stringify({ command }),
  });
}

/** GET /api/history → { history: [...] } */
export function fetchHistory() {
  return request("/history");
}
