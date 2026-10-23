/**
 * server.js — Entry point for the Jarvis IoT backend
 *
 * Starts an Express server with JSON parsing, CORS, and the device
 * API routes.  Port defaults to 3001 (so it doesn't clash with Vite
 * on 5173).
 */

const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────
app.use(cors());                   // Allow cross-origin requests from the frontend
app.use(express.json());           // Parse JSON request bodies

// ── Routes ───────────────────────────────────────────────────────────
app.use("/api", routes);

// ── Health-check (useful for later Docker / CI) ──────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Start ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🤖 Jarvis IoT backend running → http://localhost:${PORT}`);
});
