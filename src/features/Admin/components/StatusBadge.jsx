// Shared across Dashboard's recentOrders table, Orders page, etc.
// Keeps status -> color mapping in ONE place so it never drifts.
import "../styles/adminbadge.css";

const ORDER_STATUS_TONE = {
  placed: "info",
  confirmed: "info",
  processing: "warning",
  shipped: "warning",
  delivered: "success",
  cancelled: "danger",
};

const PAYMENT_STATUS_TONE = {
  pending: "warning",
  paid: "success",
  failed: "danger",
  refunded: "neutral",
  partially_refunded: "warning",
};

const ITEM_STATUS_TONE = {
  active: "info",
  cancelled: "danger",
  return_requested: "warning",
  return_approved: "warning",
  returned: "neutral",
  refunded: "success",
};

function StatusBadge({ status, kind = "order" }) {
  const map =
    kind === "payment" ? PAYMENT_STATUS_TONE : kind === "item" ? ITEM_STATUS_TONE : ORDER_STATUS_TONE;
  const tone = map[status] || "neutral";
  const label = String(status || "").replace(/_/g, " ");
  return <span className={`admin-badge admin-badge-${tone}`}>{label}</span>;
}

export default StatusBadge;