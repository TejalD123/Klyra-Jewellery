import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { getUnreadCount, getNotifications, markRead } from "../services/notification.slice";
import { getNotificationMeta, formatRelativeTime } from "../../../utils/notificationMeta";
import "../styles/notificationBell.css";

const POLL_INTERVAL_MS = 30000;

/**
 * Mount this ONCE near the root of your admin layout (e.g. alongside
 * <Sidebar /> in the shell that wraps every /admin/* route) — NOT inside
 * individual pages. It's fixed-positioned to the top-right of the
 * viewport, so it stays visible above whichever page is active.
 *
 *   <div className="admin-shell">
 *     <Sidebar />
 *     <NotificationBell />
 *     <main>{children}</main>
 *   </div>
 */
export default function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const items = useSelector((state) => state.notifications.items);

  useEffect(() => {
    dispatch(getUnreadCount());
    const interval = setInterval(() => dispatch(getUnreadCount()), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      dispatch(getNotifications({ page: 1, limit: 5 }));
    }
  };

  const recent = items.slice(0, 5);

  return (
    <div className="nbell" ref={containerRef}>
      <button onClick={toggleOpen} className="nbell-btn" aria-label="Notifications">
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="nbell-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="nbell-dropdown">
          <div className="nbell-dropdown-header">Notifications</div>

          <div className="nbell-dropdown-list">
            {recent.length === 0 && <div className="nbell-empty">You're all caught up</div>}
            {recent.map((n) => {
              const meta = getNotificationMeta(n.type);
              return (
                <button
                  key={n._id}
                  onClick={() => {
                    if (!n.isRead) dispatch(markRead(n._id));
                    setOpen(false);
                    navigate("/admin/notifications");
                  }}
                  className={`nbell-item ${!n.isRead ? "nbell-item--unread" : ""}`}
                >
                  <div className="nbell-item-meta">
                    <span className={`nbell-badge-pill nbell-badge-pill--${meta.type}`}>{meta.label}</span>
                    <span className="nbell-item-time">{formatRelativeTime(n.createdAt)}</span>
                  </div>
                  <p className="nbell-item-title">{n.title}</p>
                </button>
              );
            })}
          </div>

          <button
            className="nbell-viewall"
            onClick={() => {
              setOpen(false);
              navigate("/admin/notifications");
            }}
          >
            View all
          </button>
        </div>
      )}
    </div>
  );
}