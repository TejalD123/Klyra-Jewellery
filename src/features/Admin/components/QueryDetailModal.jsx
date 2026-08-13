import { useState } from "react";
import { X, Mail, Phone, Send } from "lucide-react";
import { queryAPI } from "../../query/services/query.api";
import "../styles/querydetailmodal.css";

const STATUSES = ["new", "in_progress", "resolved"];

const formatDateTime = (d) =>
  new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function QueryDetailModal({ query, onClose }) {
  const [response, setResponse] = useState(query.response || "");
  const [statusDraft, setStatusDraft] = useState(query.status);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [didUpdate, setDidUpdate] = useState(false);

  const handleClose = () => onClose(didUpdate);

  const handleStatusChange = async (newStatus) => {
    setStatusDraft(newStatus);
    setSaving(true);
    setError("");
    try {
      await queryAPI.updateStatus(query._id, newStatus);
      setDidUpdate(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update status");
    } finally {
      setSaving(false);
    }
  };

  // Saves the response to the backend (marks the query resolved), then
  // opens the admin's own mail client with the reply pre-filled — so the
  // actual email is sent from their real inbox, not a backend SMTP relay.
  const handleSendResponse = async () => {
    if (!response.trim()) return;
    setSending(true);
    setError("");
    try {
      await queryAPI.respond(query._id, response.trim());
      setDidUpdate(true);

      const subject = encodeURIComponent(`Re: ${query.subject || "Your query to Klyra Jewellery"}`);
      const body = encodeURIComponent(response.trim());
      window.location.href = `mailto:${query.email}?subject=${subject}&body=${body}`;
    } catch (err) {
      setError(err.response?.data?.message || "Could not save response");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="qdm-overlay" onClick={handleClose}>
      <div className="qdm-panel" onClick={(e) => e.stopPropagation()}>
        <div className="qdm-header">
          <div>
            <h2>{query.name}</h2>
            <p className="qdm-header-sub">Submitted {formatDateTime(query.createdAt)}</p>
          </div>
          <button type="button" className="qdm-close" onClick={handleClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="qdm-body">
          {/* Contact details */}
          <section className="qdm-section">
            <h3>Contact</h3>
            <div className="qdm-contact-row">
              <a href={`mailto:${query.email}`} className="qdm-contact-chip">
                <Mail size={13} /> {query.email}
              </a>
              {query.phone && (
                <a href={`tel:${query.phone}`} className="qdm-contact-chip">
                  <Phone size={13} /> {query.phone}
                </a>
              )}
            </div>
          </section>

          {/* Original message */}
          <section className="qdm-section">
            <h3>{query.subject || "General enquiry"}</h3>
            <p className="qdm-message">{query.message}</p>
          </section>

          {/* Status */}
          <section className="qdm-section">
            <h3>Status</h3>
            <div className="qdm-status-row">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`qdm-status-btn qdm-status-btn--${s} ${statusDraft === s ? "qdm-status-btn--active" : ""}`}
                  disabled={saving}
                  onClick={() => handleStatusChange(s)}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </section>

          {/* Response */}
          <section className="qdm-section">
            <h3>{query.respondedAt ? "Previous response" : "Write a response"}</h3>
            <textarea
              className="qdm-response-textarea"
              rows={5}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Type your reply here — it'll be saved and opened in your email app…"
            />
            {query.respondedAt && (
              <p className="qdm-text-muted">Last responded {formatDateTime(query.respondedAt)}</p>
            )}

            {error && <p className="qdm-error">{error}</p>}

            <button
              type="button"
              className="qdm-send-btn"
              disabled={sending || !response.trim()}
              onClick={handleSendResponse}
            >
              <Send size={14} />
              {sending ? "Saving…" : "Send Response"}
            </button>
            <p className="qdm-send-note">
              Saves the response here, then opens your email app with {query.email} and this message pre-filled.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}