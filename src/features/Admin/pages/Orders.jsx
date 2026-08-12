import { useEffect, useState } from "react";
import { Package, ChevronRight, Truck } from "lucide-react";
import Topbar from "../components/TopBar";
import StatusBadge from "../components/StatusBadge";
import OrderDetailModal from "../components/OrderDetailModal";
import {
  fetchAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  assignDelivery,
} from "../services/Orderservice";
import { fetchActiveDeliveryAgencies } from "../services/Deliveryagenciesservice"; // ⚠️ adjust path/filename if different
import "../styles/adminOrder.css";

// Tabs shown above the table. Each tab = one exact orderStatus, so moving an
// order forward (or back) automatically pulls it out of one tab and into
// another on the next reload — no extra logic needed beyond filtering.
const TABS = [
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
  { key: "", label: "All" },
];

const NEXT_ACTION = {
  placed: { label: "Confirm", next: "confirmed" },
  confirmed: { label: "Start Processing", next: "processing" },
  processing: { label: "Mark Packed", next: "packed" },
};

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState("placed"); // default tab = Placed, not "all mixed"
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tabCounts, setTabCounts] = useState({}); // { [statusKey]: total }

  const [agencies, setAgencies] = useState([]);
  const [agencyChoice, setAgencyChoice] = useState({}); // { [orderId]: selectedAgencyId }

  const load = (page = 1) => {
    setLoading(true);
    fetchAllOrders({ page, orderStatus: statusFilter || undefined, search: search || undefined })
      .then((res) => {
        setOrders(res.data.data.orders || []);
        setPagination(res.data.data.pagination || { page: 1, totalPages: 1, total: 0 });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  // Fetch a lightweight total-count per tab so the tab strip shows e.g.
  // "Placed (3)". Uses the same pagination.total the table already relies on.
  const loadCounts = () => {
    Promise.all(
      TABS.filter((t) => t.key).map((t) =>
        fetchAllOrders({ page: 1, orderStatus: t.key })
          .then((res) => [t.key, res.data.data.pagination?.total ?? 0])
          .catch(() => [t.key, 0])
      )
    ).then((entries) => setTabCounts(Object.fromEntries(entries)));
  };

  useEffect(() => { load(1); }, [statusFilter]);
  useEffect(() => { loadCounts(); }, []);

  useEffect(() => {
    fetchActiveDeliveryAgencies()
      .then((res) => setAgencies(res.data.data || []))
      .catch(() => setAgencies([]));
  }, []);

  useEffect(() => {
    if (!selectedOrder) return;
    const fresh = orders.find((o) => o._id === selectedOrder._id);
    if (fresh) setSelectedOrder(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  useEffect(() => {
    const interval = setInterval(() => { load(pagination.page); loadCounts(); }, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, newStatus);
      load(1);       // order likely left this tab — reset to page 1
      loadCounts();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updatePaymentStatus(id, newStatus);
      load(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Mirrors DeliveryAgency.getRateForState on the backend — lets the admin
  // see the charge for this order's shipping state before confirming.
  const getRateForState = (agency, state) => {
    if (!agency) return null;
    const match = agency.stateRates?.find(
      (r) => r.state.trim().toLowerCase() === (state || "").trim().toLowerCase()
    );
    return match ? match.charge : agency.defaultCharge;
  };

  const handleAssignDelivery = async (id) => {
    const agencyId = agencyChoice[id];
    if (!agencyId) return;
    setUpdatingId(id);
    try {
      await assignDelivery(id, agencyId);
      load(1);
      loadCounts();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="ord-page">
      <Topbar
        title="Orders"
        subtitle={`${pagination.total} in ${statusFilter ? TABS.find(t => t.key === statusFilter)?.label : "all"} tab`}
      />

      {/* ===== Status tabs ===== */}
      <div className="ord-tabs">
        {TABS.map((t) => (
          <button
            key={t.key || "all"}
            type="button"
            className={`ord-tab ${statusFilter === t.key ? "ord-tab--active" : ""}`}
            onClick={() => setStatusFilter(t.key)}
          >
            {t.label}
            {t.key && (
              <span className="ord-tab-count">{tabCounts[t.key] ?? "–"}</span>
            )}
          </button>
        ))}
      </div>

      <div className="ord-filters">
        <input
          className="ord-search"
          placeholder="Search order number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(1)}
        />
      </div>

      <div className="ord-card">
        <table className="ord-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
              <th aria-hidden="true"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="ord-empty">Loading…</td></tr>
            ) : error ? (
              <tr><td colSpan={8} className="ord-empty ord-error">{error}</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} className="ord-empty">Ya tab madhe order nahi.</td></tr>
            ) : (
              orders.map((order) => {
                const isIncoming = order.orderStatus === "placed";
                const action = NEXT_ACTION[order.orderStatus];
                const isPacked = order.orderStatus === "packed";
                const isInTransit = ["shipped", "out_for_delivery"].includes(order.orderStatus);
                const firstItem = order.items?.[0];
                const extraCount = (order.items?.length || 0) - 1;

                return (
                  <tr
                    key={order._id}
                    className={`ord-row ${isIncoming ? "ord-row--new" : ""}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td>
                      <div className="ord-order-cell">
                        <span className="ord-order-number">{order.orderNumber}</span>
                        {isIncoming && <span className="ord-new-tag">New</span>}
                      </div>
                    </td>

                    <td>
                      <div className="ord-customer-name">{order.user?.username || "—"}</div>
                      <div className="ord-customer-sub">{order.user?.email || order.user?.phone}</div>
                    </td>

                    <td>
                      {firstItem ? (
                        <div className="ord-product-cell">
                          <div className="ord-product-thumb">
                            {firstItem.image ? (
                              <img src={firstItem.image} alt={firstItem.name} />
                            ) : (
                              <Package size={16} strokeWidth={1.5} />
                            )}
                          </div>
                          <div className="ord-product-info">
                            <div className="ord-product-name">{firstItem.name}</div>
                            {extraCount > 0 && (
                              <div className="ord-product-extra">+{extraCount} more item{extraCount > 1 ? "s" : ""}</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="ord-customer-sub">—</span>
                      )}
                    </td>

                    <td className="ord-amount">{currency(order.pricing?.totalAmount)}</td>

                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="ord-status-cell">
                        <StatusBadge status={order.orderStatus} />

                        {action && (
                          <button
                            type="button"
                            className="ord-action-btn"
                            disabled={updatingId === order._id}
                            onClick={() => handleStatusChange(order._id, action.next)}
                          >
                            {updatingId === order._id ? "…" : action.label}
                          </button>
                        )}

                        {isPacked && (
                          <div className="ord-delivery-assign">
                            <span className="ord-delivery-label">
                              <Truck size={12} strokeWidth={2} /> Assign agency
                            </span>
                            <div className="ord-agency-chips">
                              {agencies.length === 0 && (
                                <span className="ord-agency-empty">No agencies configured</span>
                              )}
                              {agencies.map((a) => {
                                const active = agencyChoice[order._id] === a._id;
                                return (
                                  <button
                                    key={a._id}
                                    type="button"
                                    className={`ord-agency-chip ${active ? "ord-agency-chip--active" : ""}`}
                                    onClick={() =>
                                      setAgencyChoice((s) => ({ ...s, [order._id]: a._id }))
                                    }
                                  >
                                    {a.name} · ₹{getRateForState(a, order.shippingAddress?.state)}
                                  </button>
                                );
                              })}
                            </div>
                            <button
                              type="button"
                              className="ord-action-btn ord-ship-btn"
                              disabled={updatingId === order._id || !agencyChoice[order._id]}
                              onClick={() => handleAssignDelivery(order._id)}
                            >
                              {updatingId === order._id ? "…" : "Ship"}
                            </button>
                          </div>
                        )}

                        {isInTransit && (
                          <span className="ord-auto-tag">
                            {order.deliveryAgency ? `${order.deliveryAgency}` : ""}
                            {order.deliveryCharge != null ? ` · ₹${order.deliveryCharge}` : ""}
                            {" · auto-updating"}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="ord-payment-cell">
                        <StatusBadge status={order.paymentStatus} kind="payment" />
                        <span className={`ord-payment-method ord-payment-method--${order.paymentMethod}`}>
                          {order.paymentMethod === "cod" ? "COD" : order.paymentMethod === "upi" ? "UPI" : "Card"}
                        </span>
                      </div>
                    </td>

                    <td className="ord-date">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>

                    <td className="ord-chevron">
                      <ChevronRight size={16} strokeWidth={1.5} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {pagination.totalPages > 1 && (
          <div className="ord-pagination">
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <div className="ord-pagination-btns">
              <button className="ord-page-btn" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>Previous</button>
              <button className="ord-page-btn" disabled={pagination.page >= pagination.totalPages} onClick={() => load(pagination.page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onPaymentChange={handlePaymentChange}
          updating={updatingId === selectedOrder._id}
        />
      )}
    </div>
  );
}