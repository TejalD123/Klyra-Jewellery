import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { getUnreadCount } from "../../notification/services/notification.slice"; // ⚠️ adjust path if different
import "../styles/sidebar.css";

// Icons kept as tiny inline SVGs so this file has zero extra dependency.
const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  categories: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h16M4 12h10M4 18h7" strokeLinecap="round" />
    </svg>
  ),
  products: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  banners: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="6" width="20" height="12" rx="1.5" />
      <path d="M2 10h20" strokeLinecap="round" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" /><path d="M5 20c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5" strokeLinecap="round" />
    </svg>
  ),
  orders: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 3h12l1 5H5l1-5z" strokeLinejoin="round" /><path d="M5 8h14l-1.2 11a2 2 0 01-2 1.8H8.2A2 2 0 016.2 19L5 8z" strokeLinejoin="round" />
    </svg>
  ),
  delivery: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="8" width="13" height="8" rx="1.2" /><path d="M15 11h3.5L21 14v2h-6v-5z" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" />
    </svg>
  ),
  notifications: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 9a6 6 0 1112 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 18.5a2.5 2.5 0 005 0" strokeLinecap="round" />
    </svg>
  ),
  queries: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 12a8 8 0 10-3.6 6.7L21 20l-1.1-3.6c.7-1.2 1.1-2.6 1.1-4.4z" strokeLinejoin="round" />
      <path d="M12 9v3M12 15h.01" strokeLinecap="round" />
    </svg>
  ),
};

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" }],
  },
  {
    label: "Catalog",
    items: [
      { to: "/admin/categories", label: "Categories", icon: "categories" },
      { to: "/admin/products", label: "Products", icon: "products" },
      { to: "/admin/banners", label: "Banners", icon: "banners" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { to: "/admin/orders", label: "Orders", icon: "orders" },
      { to: "/admin/delivery", label: "Delivery", icon: "delivery" },
      { to: "/admin/users", label: "Users", icon: "users" },
    ],
  },
  {
    label: "Support",
    items: [
      { to: "/admin/notifications", label: "Notifications", icon: "notifications", showBadge: true },
      { to: "/admin/queries", label: "Queries", icon: "queries" },
    ],
  },
];

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const displayName = user?.fullName || user?.username || "Admin";
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUnreadCount());
    // Poll every 30s so the badge updates without a full page reload.
    const interval = setInterval(() => dispatch(getUnreadCount()), 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <aside className="admin-sidebar">
      {/* ---- Brand ---- */}
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__brand-mark">K</div>
        <div>
          <span className="admin-sidebar__brand-text">KLYRA</span>
          <p className="admin-sidebar__brand-sub">Admin Console</p>
        </div>
      </div>

      {/* ---- Profile card ----
      <div className="admin-sidebar__profile">
        <div className="admin-sidebar__profile-avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="admin-sidebar__profile-info">
          <p className="admin-sidebar__profile-name">{displayName}</p>
          <span className="admin-sidebar__profile-tag">Administrator</span>
        </div>
      </div> */}

      {/* ---- Nav ---- */}
      <nav className="admin-sidebar__nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="admin-sidebar__section">
            <p className="admin-sidebar__section-label">{section.label}</p>
            <div className="admin-sidebar__section-items">
              {section.items.map((item) =>
                item.disabled ? (
                  <div key={item.to} className="admin-nav-link is-disabled" title="Coming soon">
                    {icons[item.icon]}
                    {item.label}
                    <span className="admin-nav-link__soon">Soon</span>
                  </div>
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `admin-nav-link ${isActive ? "is-active" : ""}`}
                  >
                    {icons[item.icon]}
                    {item.label}
                    {item.showBadge && unreadCount > 0 && (
                      <span className="admin-nav-link__badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                    )}
                  </NavLink>
                )
              )}
            </div>
          </div>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        © {new Date().getFullYear()} Klyra Jewellery
      </div>
    </aside>
  );
}