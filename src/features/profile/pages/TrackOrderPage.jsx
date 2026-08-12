import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Truck, Package, CheckCircle2, MapPin, Clock, ChevronDown, Star } from "lucide-react";
import { fetchMyOrders } from "../../checkout/services/order.slice";
import ReviewPromptModal from "../../reviews/components/ReviewPromptModal"; // ⚠️ adjust path if different
import "../styles/trackorder.css";

const STEPS = [
  { key: "placed", label: "Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "processing", label: "Processing", icon: Package },
  { key: "packed", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const stepIndex = (status) => STEPS.findIndex((s) => s.key === status);

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const formatDateTime = (d) =>
  new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const estimatedDelivery = (createdAt) => {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + 2);
  return d;
};

const paymentLabel = (method) =>
  method === "cod" ? "COD" : method === "upi" ? "UPI" : "Card";

// order.items[].product can come back as a plain string ID or as a
// populated object (depends on backend populate()) — this normalizes it
// so downstream code (review button, eligibility check, navigation) always
// gets a plain ID string instead of accidentally stringifying an object.
const productIdOf = (item) =>
  typeof item?.product === "string" ? item.product : item?.product?._id;

const OrderTracker = ({ order, expanded, onToggle, onProductClick, onAddReview }) => {
  const firstItem = order.items?.[0];
  const extraCount = (order.items?.length || 0) - 1;
  const cancelled = order.orderStatus === "cancelled";
  const delivered = order.orderStatus === "delivered";
  const currentIndex = stepIndex(order.orderStatus);
  const historyByStatus = Object.fromEntries(
    (order.statusHistory || []).map((h) => [h.status, h.timestamp])
  );

  return (
    <div className={`track-card ${expanded ? "track-card--expanded" : ""}`}>
      {/* ===== Header: product + payment + date — always clickable to expand ===== */}
      <button type="button" className="track-card__header-btn" onClick={onToggle}>
        <div
          className="track-card__product-thumb"
          onClick={(e) => { e.stopPropagation(); onProductClick(firstItem); }}
        >
          {firstItem?.image ? (
            <img src={firstItem.image} alt={firstItem.name} />
          ) : (
            <Package size={18} strokeWidth={1.5} />
          )}
        </div>

        <div className="track-card__product-info">
          <div
            className="track-card__product-name"
            onClick={(e) => { e.stopPropagation(); onProductClick(firstItem); }}
          >
            {firstItem?.name || order.orderNumber}
            {extraCount > 0 && <span className="track-card__extra"> +{extraCount} more</span>}
          </div>
          <div className="track-card__product-meta">
            <span className={`track-card__payment track-card__payment--${order.paymentMethod}`}>
              {paymentLabel(order.paymentMethod)}
            </span>
            <span>{formatDate(order.createdAt)}</span>
            {!cancelled && order.orderStatus !== "delivered" && (
              <span>Arriving by {formatDate(estimatedDelivery(order.createdAt))}</span>
            )}
          </div>
        </div>

        <div className="track-card__right">
          <span className="track-card__total">{currency(order.pricing?.totalAmount)}</span>
          {cancelled ? (
            <span className="track-card__cancelled-badge">Cancelled</span>
          ) : (
            <ChevronDown size={18} className="track-card__chevron" />
          )}
        </div>
      </button>

      {cancelled && order.cancellation?.reason && (
        <p className="track-card__cancel-reason">{order.cancellation.reason}</p>
      )}

      {order.deliveryAgency && !cancelled && (
        <p className="track-card__agency">via {order.deliveryAgency}</p>
      )}

      {/* ===== Steps: horizontal by default, vertical + live when expanded ===== */}
      {!cancelled && (
        <div className={`track-steps ${expanded ? "track-steps--vertical" : "track-steps--horizontal"}`}>
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = i <= currentIndex;
            const isCurrent = i === currentIndex;
            const ts = historyByStatus[step.key];

            return (
              <div key={step.key} className={`track-step ${done ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}>
                <div className="track-step__line" />
                <div className="track-step__icon">
                  <Icon size={16} />
                </div>
                <div className="track-step__body">
                  <span className="track-step__label">{step.label}</span>
                  {expanded && ts && <span className="track-step__time">{formatDateTime(ts)}</span>}
                  {expanded && isCurrent && !ts && <span className="track-step__live">Live</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Delivered orders: per-item "Add Review" buttons ===== */}
      {delivered && (order.items || []).some((it) => productIdOf(it)) && (
        <div className="track-card__review-list">
          {(order.items || []).map((item, idx) => {
            const pid = productIdOf(item);
            if (!pid) return null; // product deleted / no ref — nothing to review
            return (
              <div key={pid + idx} className="track-card__review-row">
                <span className="track-card__review-item-name">{item.name}</span>
                <button
                  type="button"
                  className="track-card__review-btn"
                  onClick={() => onAddReview(order._id, item)}
                >
                  <Star size={14} />
                  Add Review
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const TrackOrderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: orders, status } = useSelector((s) => s.orders.list);
  const [tab, setTab] = useState("current"); // "current" | "history"
  const [openId, setOpenId] = useState(null);

  // ===== Review modal — opened explicitly by clicking "Add Review" =====
  const [reviewTarget, setReviewTarget] = useState(null); // { orderId, item } | null

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  // Live-tracking demo: statuses auto-advance on a timer server-side —
  // poll periodically so the page updates without a manual refresh.
  useEffect(() => {
    const interval = setInterval(() => dispatch(fetchMyOrders()), 15000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const openReviewModal = (orderId, item) => setReviewTarget({ orderId, item });
  const closeReviewModal = () => setReviewTarget(null);

  const goToProduct = (item) => {
    const slug = item?.slug || productIdOf(item);
    if (!slug) return;
    navigate(`/products/${slug}`);
  };

  const currentOrders = (orders || []).filter((o) => o.orderStatus !== "delivered" && o.orderStatus !== "cancelled");
  const historyOrders = (orders || []).filter((o) => o.orderStatus === "delivered" || o.orderStatus === "cancelled");
  const visibleOrders = tab === "current" ? currentOrders : historyOrders;

  if (status === "loading" && !orders?.length) {
    return (
      <div className="account-stub">
        <Truck size={40} strokeWidth={1} />
        <h2>Track Order</h2>
        <p>Loading your orders…</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="account-stub">
        <Truck size={40} strokeWidth={1} />
        <h2>Track Order</h2>
        <p>You don't have any orders to track yet.</p>
      </div>
    );
  }

  return (
    <div className="track-page">
      <div className="track-page__header">
        <h1 className="track-page__title">Track Order</h1>
        <div className="track-page__tabs">
          <button className={tab === "current" ? "active" : ""} onClick={() => { setTab("current"); setOpenId(null); }}>
            Current
          </button>
          <button className={tab === "history" ? "active" : ""} onClick={() => { setTab("history"); setOpenId(null); }}>
            History
          </button>
        </div>
      </div>

      {visibleOrders.length === 0 ? (
        <p className="track-page__empty">
          {tab === "current" ? "No orders in progress right now." : "No delivered or cancelled orders yet."}
        </p>
      ) : (
        <section className="track-page__section">
          {visibleOrders.map((order) => (
            <OrderTracker
              key={order._id}
              order={order}
              expanded={openId === order._id}
              onToggle={() => setOpenId(openId === order._id ? null : order._id)}
              onProductClick={goToProduct}
              onAddReview={openReviewModal}
            />
          ))}
        </section>
      )}

      {reviewTarget && (
        <ReviewPromptModal
          item={reviewTarget.item}
          onClose={closeReviewModal}
          onSubmitted={closeReviewModal}
          onProductClick={goToProduct}
        />
      )}
    </div>
  );
};

export default TrackOrderPage;