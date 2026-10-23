/**
 * routes.js — Express Router for device endpoints
 *
 * Endpoints:
 *   GET  /api/devices          → list all devices
 *   GET  /api/devices/:id      → single device
 *   POST /api/devices/:id/command  → send a command (on / off / toggle)
 *   GET  /api/history          → recent command history
 */

const { Router } = require("express");
const {
  getAllDevices,
  getDevice,
  executeCommand,
  getHistory,
} = require("./deviceManager");

const router = Router();

// ── GET /api/devices ─────────────────────────────────────────────────
router.get("/devices", (_req, res) => {
  res.json({ devices: getAllDevices() });
});

// ── GET /api/devices/:id ─────────────────────────────────────────────
router.get("/devices/:id", (req, res) => {
  const device = getDevice(req.params.id);
  if (!device) {
    return res.status(404).json({ error: `Device "${req.params.id}" not found` });
  }
  res.json({ device });
});

// ── POST /api/devices/:id/command ────────────────────────────────────
router.post("/devices/:id/command", (req, res) => {
  const { command } = req.body;

  // Body-level validation: command field is required
  if (!command || typeof command !== "string") {
    return res
      .status(400)
      .json({ error: 'Request body must include a "command" string (on | off | toggle)' });
  }

  try {
    const { device, entry } = executeCommand(req.params.id, command.toLowerCase());
    res.json({ device, entry });
  } catch (err) {
    // deviceManager throws with a statusCode property
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// ── GET /api/history ─────────────────────────────────────────────────
router.get("/history", (_req, res) => {
  res.json({ history: getHistory() });
});

module.exports = router;
