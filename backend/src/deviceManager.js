/**
 * deviceManager.js — Simulated Device Layer
 *
 * This module owns all device state and the logic to read / mutate it.
 * It is deliberately decoupled from Express so that, in a later stage,
 * you can swap this simulation for real MQTT commands to an ESP32
 * without touching the HTTP routes.
 *
 * DATA STRUCTURES
 * ───────────────
 * devices   – Map<deviceId, { id, name, status }>
 * history   – Array<{ deviceId, command, timestamp }>   (newest first)
 */

// ── Initial simulated devices ────────────────────────────────────────
const devices = new Map([
  ["study_light",      { id: "study_light",      name: "Study Light",      status: "off" }],
  ["room_fan",         { id: "room_fan",         name: "Room Fan",         status: "off" }],
  ["charging_socket",  { id: "charging_socket",  name: "Charging Socket",  status: "off" }],
]);

// Command history – capped at the most recent 50 entries.
const MAX_HISTORY = 50;
const history = [];

// ── Public helpers ───────────────────────────────────────────────────

/** Return an array of all device objects (plain copies). */
function getAllDevices() {
  return Array.from(devices.values());
}

/** Return a single device or undefined. */
function getDevice(deviceId) {
  return devices.get(deviceId);
}

/**
 * Toggle or explicitly set a device's power state.
 *
 * @param {string} deviceId   – must exist in the devices map
 * @param {string} command    – "on" | "off" | "toggle"
 * @returns {{ device: object, entry: object }} updated device + history entry
 * @throws {Error} if deviceId or command is invalid
 */
function executeCommand(deviceId, command) {
  // Validate device ID
  const device = devices.get(deviceId);
  if (!device) {
    const err = new Error(`Unknown device: "${deviceId}"`);
    err.statusCode = 404;
    throw err;
  }

  // Validate command value
  const allowed = ["on", "off", "toggle"];
  if (!allowed.includes(command)) {
    const err = new Error(
      `Invalid command: "${command}". Allowed: ${allowed.join(", ")}`
    );
    err.statusCode = 400;
    throw err;
  }

  // Resolve new status
  if (command === "toggle") {
    device.status = device.status === "on" ? "off" : "on";
  } else {
    device.status = command;          // "on" or "off"
  }

  // Record in history (newest first, capped)
  const entry = {
    deviceId,
    command,
    resultStatus: device.status,
    timestamp: new Date().toISOString(),
  };
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.pop();

  return { device: { ...device }, entry };
}

/** Return the full command history array (newest first). */
function getHistory() {
  return history;
}

module.exports = { getAllDevices, getDevice, executeCommand, getHistory };
