/**
 * App.jsx — Root component & state owner for the Jarvis IoT Dashboard.
 *
 * STATE FLOW
 * ──────────
 * 1. On mount, useEffect fetches all devices + history from the API.
 * 2. `devices` and `history` are stored in React state here (the
 *    single source of truth in the frontend).
 * 3. When the user clicks "Toggle", handleToggle() sends a POST to the
 *    backend, then updates local state with the response — we never
 *    blindly flip state; we trust the backend's answer.
 * 4. `loadingDevices` tracks which device IDs have an in-flight request
 *    so we can disable their buttons and show spinners.
 */

import { useState, useEffect, useCallback } from "react";
import { fetchDevices, sendCommand, fetchHistory } from "./api";
import DeviceCard from "./components/DeviceCard";
import CommandHistory from "./components/CommandHistory";

export default function App() {
  // ── State ────────────────────────────────────────────────────────
  const [devices, setDevices]         = useState([]);       // array of device objects
  const [history, setHistory]         = useState([]);       // array of command entries
  const [loadingDevices, setLoading]  = useState(new Set()); // device IDs currently loading
  const [pageLoading, setPageLoading] = useState(true);     // initial fetch in progress
  const [error, setError]             = useState(null);     // user-visible error string

  // ── Initial data fetch ───────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        // Fetch devices and history in parallel for speed
        const [devRes, histRes] = await Promise.all([
          fetchDevices(),
          fetchHistory(),
        ]);
        setDevices(devRes.devices);
        setHistory(histRes.history);
      } catch (err) {
        setError(`Failed to load devices: ${err.message}`);
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, []);

  // ── Toggle handler ───────────────────────────────────────────────
  const handleToggle = useCallback(async (deviceId) => {
    // Mark this device as loading (prevents double-clicks)
    setLoading((prev) => new Set(prev).add(deviceId));
    setError(null);

    try {
      // Send "toggle" command — backend resolves it to on/off
      const { device: updated, entry } = await sendCommand(deviceId, "toggle");

      // Replace the device in state with the backend's updated version
      setDevices((prev) =>
        prev.map((d) => (d.id === updated.id ? updated : d))
      );

      // Prepend the new history entry
      setHistory((prev) => [entry, ...prev]);
    } catch (err) {
      setError(`Command failed: ${err.message}`);
    } finally {
      // Clear loading state for this device
      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(deviceId);
        return next;
      });
    }
  }, []);

  // ── Render ───────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="app">
        <div className="page-loader">
          <span className="spinner" />
          <span>Connecting to Jarvis…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header__icon">🤖</div>
        <h1 className="header__title">Jarvis IoT Assistant</h1>
        <p className="header__subtitle">Stage 1 — Simulated Device Control</p>
      </header>

      {/* Error banner */}
      {error && (
        <div className="error-banner" role="alert">
          ⚠️ {error}
        </div>
      )}

      {/* Device cards */}
      <section className="device-grid" aria-label="Devices">
        {devices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            loading={loadingDevices.has(device.id)}
            onToggle={handleToggle}
          />
        ))}
      </section>

      {/* Command history */}
      <CommandHistory history={history} />
    </div>
  );
}
