import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Loader2, ChevronRight } from "lucide-react";
import { orderAPI } from "../../checkout/services/order.api";
import ConfirmDialog from "../component/ConfirmDialog";
import "../styles/profile.css";
import "../styles/myOrder.css";

const CANCELLABLE = ["placed", "confirmed", "processing"];

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

// Delivery estimate = order date + 2 days. If the backend ever starts
// sending a real estimatedDeliveryDate, swap this for that field.
const estimatedDelivery = (createdAt) => {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + 2);
  return d;
};

const paymentLabel = (method) =>
  method === "cod" ? "COD" : method === "upi" ? "UPI" : "Card";

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("current"); // "current" | "history"
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [orderPendingCancel, setOrderPendingCancel] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");

    const params = tab === "history" ? { orderStatus: "delivered", limit: 50 } : { limit: 50 };

    orderAPI
      .getMyOrders(params)
      .then((data) => {
        const all = data.orders || [];
        setOrders(tab === "current" ? all.filter((o) => o.orderStatus !== "delivered") : all);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load your orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleCancel = async () => {
    const id = orderPendingCancel;
    if (!id) return;
    setCancellingId(id);
    try {
      await orderAPI.cancelOrder(id, "Cancelled by customer");
      setOrderPendingCancel(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="my-orders">
      <div className="my-orders-header">
        <h2>My Orders</h2>
        <div className="my-orders-tabs">
          <button className={tab === "current" ? "active" : ""} onClick={() => setTab("current")}>
            Current
          </button>
          <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>
            History
          </button>
        </div>
      </div>

      {loading && (
        <div className="account-stub">
          <Loader2 size={32} className="orders-spin" />
        </div>
      )}

      {!loading && error && <p className="my-orders-error">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="account-stub">
          <Package size={40} strokeWidth={1} />
          <h2>{tab === "current" ? "No current orders" : "No past orders yet"}</h2>
          <p>
            {tab === "current"
              ? "Orders you place will show up here until they're delivered."
              : "Delivered orders will appear here once they arrive."}
          </p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="my-orders-list">
          {orders.map((order) => {
            const cancelled = order.orderStatus === "cancelled";
            const delivered = order.orderStatus === "delivered";
            const est = estimatedDelivery(order.createdAt);

            return (
              <div key={order._id} className="order-card">
                {/* ===== Top: order number, date, total ===== */}
                <div className="order-card-top">
                  <div>
                    <div className="order-number">{order.orderNumber}</div>
                    <div className="order-date">{formatDate(order.createdAt)}</div>
                  </div>
                  <div className="order-total">{currency(order.pricing?.totalAmount)}</div>
                </div>

                {/* Order-level delivery estimate — only when it's still in progress.
                    Cancelled/delivered state is shown per-item below via the
                    status badge, so it isn't repeated here. */}
                {!cancelled && !delivered && (
                  <div className="order-delivery-est">Arriving by {formatDate(est)}</div>
                )}
                {cancelled && order.cancellation?.reason && (
                  <div className="order-delivery-est order-delivery-est--cancel">
                    Cancelled — {order.cancellation.reason}
                  </div>
                )}

                {/* ===== Items: product on top, payment + status + view product below ===== */}
                <div className="order-items">
                  {order.items?.map((item) => {
                    const slug = item.slug || item.productId;
                    return (
                      <div key={item._id || item.name} className="order-item">
                        <div className="order-item-top">
                          {item.image ? (
                            <img src={item.image} alt={item.name} />
                          ) : (
                            <div className="order-item-thumb-fallback"><Package size={18} strokeWidth={1.5} /></div>
                          )}
                          <div className="order-item-info">
                            <div className="order-item-name">{item.name}</div>
                            <div className="order-item-meta">
                              {item.metalType && `${item.metalType} · `}
                              {item.size && `Size ${item.size} · `}
                              Qty {item.quantity}
                            </div>
                          </div>
                          <div className="order-item-price">{currency(item.priceAtOrderTime * item.quantity)}</div>
                        </div>

                        <div className="order-item-bottom">
                          <div className="order-item-badges">
                            <span className={`order-payment-badge order-payment-badge--${order.paymentMethod}`}>
                              {paymentLabel(order.paymentMethod)}
                            </span>
                            <span className={`order-status-name order-status-name--${order.orderStatus}`}>
                              {order.orderStatus.replace("_", " ")}
                            </span>
                          </div>

                          {slug && (
                            <button
                              type="button"
                              className="order-view-product-btn"
                              onClick={() => navigate(`/products/${slug}`)}
                            >
                              View Product
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {CANCELLABLE.includes(order.orderStatus) && (
                  <button
                    className="order-cancel-btn"
                    disabled={cancellingId === order._id}
                    onClick={() => setOrderPendingCancel(order._id)}
                  >
                    {cancellingId === order._id ? "Cancelling…" : "Cancel Order"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {orderPendingCancel && (
        <ConfirmDialog
          title="Cancel this order?"
          message={`This will cancel order ${
            orders.find((o) => o._id === orderPendingCancel)?.orderNumber || ""
          }. This can't be undone.`}
          confirmLabel="Yes, cancel order"
          cancelLabel="Keep order"
          danger
          loading={cancellingId === orderPendingCancel}
          onConfirm={handleCancel}
          onCancel={() => setOrderPendingCancel(null)}
        />
      )}
    </div>
  );
};

export default MyOrdersPage;