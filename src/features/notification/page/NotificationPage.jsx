import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, Check, CheckCheck, Trash2, Loader2 } from "lucide-react";
import {
  getNotifications,
  markRead,
  markAllRead,
  removeNotification,
  setTypeFilter,
  setIsReadFilter,
} from "../services/notification.slice";
import {
  NOTIFICATION_TYPE_OPTIONS,
  getNotificationMeta,
  formatRelativeTime,
} from "../../../utils/notificationMeta";
import "../style/notification.css";

export default function NotificationPage() {
  const dispatch = useDispatch();
  const { items, pagination, unreadCount, filters, status } = useSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    dispatch(
      getNotifications({
        type: filters.type || undefined,
        isRead: filters.isRead || undefined,
        page: 1,
        limit: 20,
      })
    );
  }, [dispatch, filters.type, filters.isRead]);

  const goToPage = (page) => {
    dispatch(
      getNotifications({
        type: filters.type || undefined,
        isRead: filters.isRead || undefined,
        page,
        limit: pagination.limit,
      })
    );
  };

  const isLoading = status === "loading";

  return (
    <div className="notif-page">
      <div className="notif-header">
        <div className="notif-header-left">
          <Bell size={22} className="notif-header-icon" />
          <h1 className="notif-title">Notifications</h1>
          {unreadCount > 0 && <span className="notif-unread-pill">{unreadCount} unread</span>}
        </div>

        <button
          onClick={() => dispatch(markAllRead())}
          disabled={unreadCount === 0}
          className="notif-markall-btn"
        >
          <CheckCheck size={15} />
          Mark all as read
        </button>
      </div>

      {/* Filters */}
      <div className="notif-filters">
        <select
          value={filters.type}
          onChange={(e) => dispatch(setTypeFilter(e.target.value))}
          className="notif-filter-select"
        >
          {NOTIFICATION_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.isRead}
          onChange={(e) => dispatch(setIsReadFilter(e.target.value))}
          className="notif-filter-select"
        >
          <option value="">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      {/* List */}
      <div className="notif-list">
        {isLoading && (
          <div className="notif-loading">
            <Loader2 size={20} className="notif-spin" />
          </div>
        )}

        {!isLoading && items.length === 0 && <div className="notif-empty">No notifications to show</div>}

        {!isLoading &&
          items.map((n) => {
            const meta = getNotificationMeta(n.type);
            return (
              <div key={n._id} className={`notif-item ${!n.isRead ? "notif-item--unread" : ""}`}>
                {!n.isRead && <span className="notif-dot" aria-hidden="true" />}
                <div className={`notif-content ${n.isRead ? "notif-content--read" : ""}`}>
                  <div className="notif-meta">
                    <span className={`notif-badge notif-badge--${meta.type}`}>{meta.label}</span>
                    <span className="notif-time">{formatRelativeTime(n.createdAt)}</span>
                  </div>
                  <p className="notif-item-title">{n.title}</p>
                  <p className="notif-item-message">{n.message}</p>
                </div>

                <div className="notif-actions">
                  {!n.isRead && (
                    <button
                      onClick={() => dispatch(markRead(n._id))}
                      title="Mark as read"
                      className="notif-icon-btn"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => dispatch(removeNotification(n._id))}
                    title="Delete"
                    className="notif-icon-btn notif-icon-btn--danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="notif-pagination">
          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="notif-page-btn"
          >
            Previous
          </button>
          <span className="notif-page-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="notif-page-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}  