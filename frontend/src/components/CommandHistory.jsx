/**
 * CommandHistory.jsx — Displays the most recent commands in a scrollable list.
 *
 * Props:
 *   history – array of { deviceId, command, resultStatus, timestamp }
 */

/**
 * Format an ISO timestamp to a user-friendly relative or short string.
 * e.g. "10:34:12 AM" today, or "Oct 21, 10:34 AM" on a different day.
 */
function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  if (isToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) +
    ", " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function CommandHistory({ history }) {
  return (
    <section className="history-section">
      <h2 className="history-section__title">📋 Command History</h2>

      {history.length === 0 ? (
        <p className="history-empty">No commands yet — toggle a device to get started!</p>
      ) : (
        <ul className="history-list">
          {history.map((entry, i) => (
            <li key={`${entry.timestamp}-${i}`} className="history-item">
              <div className="history-item__left">
                <span className="history-item__device">{entry.deviceId}</span>
                <span className={`history-cmd history-cmd--${entry.command}`}>
                  {entry.command}
                </span>
                <span className="status-badge status-badge--sm" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  → {entry.resultStatus}
                </span>
              </div>
              <time className="history-item__time" dateTime={entry.timestamp}>
                {formatTime(entry.timestamp)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
