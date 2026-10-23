/**
 * DeviceCard.jsx — Renders a single IoT device with status + toggle button.
 *
 * Props:
 *   device    – { id, name, status }
 *   loading   – boolean, true while a command is in-flight
 *   onToggle  – callback(deviceId) fired when the user clicks the button
 */

// Map device IDs to emoji icons for visual identification
const DEVICE_ICONS = {
  study_light: "💡",
  room_fan: "🌀",
  charging_socket: "🔌",
};

export default function DeviceCard({ device, loading, onToggle }) {
  const isOn = device.status === "on";
  const icon = DEVICE_ICONS[device.id] || "📟";

  return (
    <article
      className={`device-card ${isOn ? "device-card--on" : ""}`}
      aria-label={`${device.name} – ${device.status}`}
    >
      {/* ── Header: icon + name + status badge ── */}
      <div className="device-card__header">
        <div className="device-card__info">
          <span className="device-card__icon">{icon}</span>
          <div>
            <h2 className="device-card__name">{device.name}</h2>
            <span className="device-card__id">{device.id}</span>
          </div>
        </div>

        <span className={`status-badge status-badge--${device.status}`}>
          <span className="status-dot" />
          {device.status}
        </span>
      </div>

      {/* ── Toggle button ── */}
      <button
        id={`toggle-${device.id}`}
        className={`toggle-btn ${isOn ? "toggle-btn--turn-off" : "toggle-btn--turn-on"}`}
        disabled={loading}
        onClick={() => onToggle(device.id)}
      >
        {loading && <span className="spinner" />}
        {loading ? "Sending…" : isOn ? "Turn Off" : "Turn On"}
      </button>
    </article>
  );
}
