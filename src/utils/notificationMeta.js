// Single source of truth for how each notification type is labeled across
// the admin UI. Keep the keys in sync with NOTIFICATION_TYPES in
// backend/models/notification.model.js. Colors live in notifications.css /
// notificationBell.css as `.notif-badge--<type>` modifier classes.
export const NOTIFICATION_LABELS = {
  new_order: "New Order",
  order_cancelled: "Order Cancelled",
  low_stock: "Low Stock",
  return_requested: "Return Requested",
  payment_failed: "Payment Failed",
  new_query: "New Query",
  general: "General",
};

export const NOTIFICATION_TYPE_OPTIONS = [
  { value: "", label: "All types" },
  ...Object.entries(NOTIFICATION_LABELS).map(([value, label]) => ({ value, label })),
];

export const getNotificationMeta = (type) => ({
  label: NOTIFICATION_LABELS[type] || type,
  type, // used to build the `.notif-badge--<type>` class
});

// Relative time like "5m ago", "3h ago", "2d ago" — falls back to a date
// once it's more than a week old so old notifications don't say "52w ago".
export const formatRelativeTime = (isoDate) => {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};