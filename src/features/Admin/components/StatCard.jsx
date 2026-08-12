import "../styles/admincard.css";

export default function StatCard({ label, value, hint, tone = "neutral" }) {
  const toneColor = {
    neutral: "var(--admin-text)",
    success: "var(--admin-success)",
    warning: "var(--admin-warning)",
    danger: "var(--admin-danger)",
  }[tone];

  return (
    <div className="admin-card admin-stat-card is-loaded p-5">
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>
        {label}
      </p>
      <p className="admin-heading text-3xl mt-2" style={{ color: toneColor }}>
        {value}
      </p>
      {hint && (
        <p className="text-xs mt-1.5" style={{ color: "var(--admin-text-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}