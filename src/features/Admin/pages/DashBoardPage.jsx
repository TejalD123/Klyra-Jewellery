import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/TopBar";
import StatusBadge from "../components/StatusBadge";
import { fetchDashboardStats } from "../services/admin.api";
import "../styles/admincard.css";
import "../styles/admintable.css";
import "../styles/adminDashboard.css";

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const STATUS_ORDER = ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const LOW_STOCK_CEILING = 10; // reference max for the mini severity bar — purely visual, not a business rule

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "—";

/* ---- Icons: same thin-stroke line style used across the admin app ---- */
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 19c.6-3.2 3.1-5 6.5-5s5.9 1.8 6.5 5" strokeLinecap="round" />
    <path d="M15.5 4.2c1.6.4 2.7 1.8 2.7 3.4s-1.1 3-2.7 3.4" strokeLinecap="round" />
    <path d="M18 14.3c1.9.5 3.2 1.9 3.5 4.7" strokeLinecap="round" />
  </svg>
);
const IconGem = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6 3h12l3 5-9 13L3 8l3-5z" strokeLinejoin="round" />
    <path d="M3 8h18M8.5 3 12 8l3.5-5" strokeLinejoin="round" />
  </svg>
);
const IconReceipt = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6 2.5h12v19l-2.2-1.5-2.2 1.5-2.2-1.5L9.2 21 7 19.5V2.5z" strokeLinejoin="round" />
    <path d="M9 7.5h6M9 11h6M9 14.5h4" strokeLinecap="round" />
  </svg>
);
const IconTrendUp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 16.5 9.5 10l4 4L21 6.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.5 6.5H21v5.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 11a8 8 0 10-2.1 5.7" strokeLinecap="round" />
    <path d="M20 5v6h-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconBars = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 19V10M12 19V5M19 19v-6" strokeLinecap="round" />
  </svg>
);
const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3.5 22 20.5H2L12 3.5z" strokeLinejoin="round" />
    <path d="M12 10v4.5M12 17.5h.01" strokeLinecap="round" />
  </svg>
);

export default function DashBoardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadStats = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    return fetchDashboardStats()
      .then((res) => {
        // FIXED: was res.data (the raw ApiResponse wrapper —
        // {statusCode, success, message, data}), so stats.totalUsers etc
        // were always undefined and every card silently fell back to 0.
        // admin.api.js uses the same plain axiosInstance as every other
        // admin service (Categoryservice, Productservice...), all of
        // which unwrap with res.data.data — this page just wasn't doing
        // the same thing.
        setStats(res.data.data);
        setLastUpdated(new Date());
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <Topbar title="Dashboard" subtitle="Loading today's numbers…" />
        <div className="admin-kpi-grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="admin-stat-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <Topbar title="Dashboard" />
        <div className="admin-dashboard-error">
          <p className="admin-dashboard-error__message">
            Dashboard load nahi jhala: {error}
          </p>
          <button className="admin-btn admin-btn-ghost" style={{ marginTop: "1rem" }} onClick={() => loadStats()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  const maxStatusCount = Math.max(1, ...STATUS_ORDER.map((s) => stats.ordersByStatus?.[s] || 0));
  const avgOrderValue = stats.totalOrders ? stats.totalRevenue / stats.totalOrders : 0;
  const deliveredCount = stats.ordersByStatus?.delivered || 0;

  return (
    <div className="admin-dashboard">
      <Topbar title="Dashboard" subtitle="Store performance at a glance" />

      <div className="admin-dashboard-toolbar">
        <span className="admin-dashboard-updated">
          {refreshing
            ? "Refreshing…"
            : lastUpdated
            ? `Updated ${lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
            : ""}
        </span>
        <button
          type="button"
          className={`admin-refresh-btn ${refreshing ? "is-spinning" : ""}`}
          onClick={() => loadStats(true)}
          disabled={refreshing}
          title="Refresh dashboard"
        >
          <IconRefresh />
          Refresh
        </button>
      </div>

      <div className="admin-kpi-grid">
        <div className="admin-card admin-kpi-card">
          <span className="admin-kpi-icon admin-kpi-icon--users"><IconUsers /></span>
          <span className="admin-kpi-label">Total Users</span>
          <span className="admin-kpi-value">{stats.totalUsers ?? 0}</span>
          <span className="admin-kpi-hint">registered customers</span>
        </div>

        <div className="admin-card admin-kpi-card">
          <span className="admin-kpi-icon admin-kpi-icon--products"><IconGem /></span>
          <span className="admin-kpi-label">Total Products</span>
          <span className="admin-kpi-value">{stats.totalProducts ?? 0}</span>
          <span className="admin-kpi-hint">
            {stats.totalCategories != null ? `across ${stats.totalCategories} categories` : "—"}
          </span>
        </div>

        <div className="admin-card admin-kpi-card">
          <span className="admin-kpi-icon admin-kpi-icon--orders"><IconReceipt /></span>
          <span className="admin-kpi-label">Total Orders</span>
          <span className="admin-kpi-value">{stats.totalOrders ?? 0}</span>
          <span className="admin-kpi-hint">{deliveredCount} delivered</span>
        </div>

        <div className="admin-card admin-kpi-card admin-kpi-card--accent">
          <span className="admin-kpi-icon admin-kpi-icon--revenue"><IconTrendUp /></span>
          <span className="admin-kpi-label">Total Revenue</span>
          <span className="admin-kpi-value">{currency(stats.totalRevenue)}</span>
          <span className="admin-kpi-hint">avg order {currency(avgOrderValue)}</span>
        </div>
      </div>

      <div className="admin-dashboard-panels">
        {/* Orders by status — plain CSS bars, no chart dependency */}
        <div className="admin-card admin-panel">
          <h3 className="admin-panel-title">
            <IconBars /> Orders by Status
          </h3>
          <div className="admin-status-list">
            {STATUS_ORDER.map((status) => {
              const count = stats.ordersByStatus?.[status] || 0;
              const pct = Math.round((count / maxStatusCount) * 100);
              return (
                <div key={status} className="admin-status-row">
                  <div className="admin-status-row__label">
                    <StatusBadge status={status} />
                  </div>
                  <div className="admin-status-row__track">
                    <div className="admin-status-row__fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="admin-status-row__count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low stock */}
        <div className="admin-card admin-panel">
          <h3 className="admin-panel-title">
            <IconAlert /> Low Stock Alert
          </h3>
          {stats.lowStockProducts?.length ? (
            <ul className="admin-lowstock-list">
              {stats.lowStockProducts.map((p) => {
                const severity = Math.min(100, Math.round((p.stock / LOW_STOCK_CEILING) * 100));
                return (
                  <li key={p._id} className="admin-lowstock-row">
                    <button
                      type="button"
                      className="admin-lowstock-row__clickable"
                      onClick={() => navigate(`/admin/products?edit=${p._id}`)}
                      title="Edit this product"
                    >
                      <div className="admin-lowstock-row__top">
                        <span className="admin-lowstock-row__name">{p.name}</span>
                        <span className="admin-badge admin-badge-danger">{p.stock} left</span>
                      </div>
                      <div className="admin-lowstock-row__track">
                        <div className="admin-lowstock-row__fill" style={{ width: `${severity}%` }} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="admin-dashboard-empty">
              Sarva products sufficiently stocked ahet.
            </p>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="admin-card admin-orders-panel">
        <div className="admin-orders-panel__header">
          <h3 className="admin-panel-title admin-panel-title--flat">Recent Orders</h3>
          {stats.recentOrders?.length > 0 && (
            <span className="admin-orders-panel__count">Last {stats.recentOrders.length}</span>
          )}
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders?.length ? (
              stats.recentOrders.map((order) => (
                <tr key={order._id}>
                  <td className="font-medium">{order.orderNumber}</td>
                  <td>
                    <div className="admin-order-customer">
                      <span className="admin-avatar">{initials(order.user?.username)}</span>
                      <div>
                        <div>{order.user?.username || "—"}</div>
                        <div className="admin-order-customer__email">
                          {order.user?.email || order.user?.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-order-amount">{currency(order.pricing?.totalAmount)}</td>
                  <td>
                    <StatusBadge status={order.orderStatus} />
                  </td>
                  <td className="admin-order-date">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="admin-table-empty">
                  Ajun koni order kela nahi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}