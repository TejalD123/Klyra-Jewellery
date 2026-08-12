import { useEffect } from "react";
import "../styles/confirmDialog.css";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Never mind",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && !loading && onCancel();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onCancel, loading]);

  return (
    <div className="cfd-overlay" onClick={() => !loading && onCancel()}>
      <div className="cfd-panel" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="cfd-actions">
          <button type="button" className="cfd-btn cfd-btn-ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`cfd-btn ${danger ? "cfd-btn-danger" : "cfd-btn-primary"}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}