import Topbar from "./Topbar";

import "../styles/admincard.css";

export default function ComingSoon({ title, note }) {
  return (
    <div className="space-y-6">
      <Topbar title={title} subtitle="Backend pending" />
      <div className="admin-card p-10 text-center">
        <p className="admin-heading text-lg mb-2">Coming soon</p>
        <p className="text-sm" style={{ color: "var(--admin-text-muted)", maxWidth: 480, margin: "0 auto" }}>
          {note}
        </p>
      </div>
    </div>
  );
}