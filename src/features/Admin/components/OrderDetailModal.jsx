import { useEffect, useState } from "react";
import { X, Package } from "lucide-react";
import StatusBadge from "./StatusBadge";
import "../styles/orderDetailModal.css";

const ORDER_STATUSES = ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded", "partially_refunded"];

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const formatDateTime = (d) =>
  new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function OrderDetailModal({ order, onClose, onStatusChange, onPaymentChange, updating }) {
  const [statusDraft, setStatusDraft] = useState(order.orderStatus);
  const [paymentDraft, setPaymentDraft] = useState(order.paymentStatus);

  useEffect(() => {
    setStatusDraft(order.orderStatus);
    setPaymentDraft(order.paymentStatus);
  }, [order]);

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const isDelivered = order.orderStatus === "delivered";
  const isCancelled = order.cancellation?.isCancelled;
  const addr = order.shippingAddress;

  return (
    <div className="odm-overlay" onClick={onClose}>
      <div className="odm-panel" onClick={(e) => e.stopPropagation()}>
        <div className="odm-header">
          <div>
            <h2>{order.orderNumber}</h2>
            <p className="odm-header-sub">Placed {formatDateTime(order.createdAt)}</p>
          </div>
          <button type="button" className="odm-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="odm-body">
          {/* Customer + shipping */}
          <section className="odm-section">
            <h3>Customer</h3>
            <div className="odm-grid-2">
              <div>
                <p className="odm-label">Contact</p>
                <p className="odm-text">{order.user?.username || "—"}</p>
                <p className="odm-text-muted">{order.user?.email || order.user?.phone}</p>
              </div>
              {addr && (
                <div>
                  <p className="odm-label">Shipping to</p>
                  <p className="odm-text">{addr.fullName} · {addr.phoneNumber}</p>
                  <p className="odm-text-muted">
                    {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city}, {addr.state} {addr.pincode}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Items */}
          <section className="odm-section">
            <h3>Items ({order.items?.length || 0})</h3>
            <div className="odm-items">
              {order.items?.map((item) => (
                <div key={item._id || item.name} className="odm-item">
                  <div className="odm-item-thumb">
                    {item.image ? <img src={item.image} alt={item.name} /> : <Package size={18} strokeWidth={1.5} />}
                  </div>
                  <div className="odm-item-info">
                    <div className="odm-item-name">{item.name}</div>
                    <div className="odm-text-muted">
                      {item.metalType && `${item.metalType} · `}
                      {item.size && `Size ${item.size} · `}
                      Qty {item.quantity}
                    </div>
                  </div>
                  <div className="odm-item-right">
                    <div>{currency(item.priceAtOrderTime * item.quantity)}</div>
                    <span className={`odm-item-status odm-item-status--${item.itemStatus}`}>{item.itemStatus.replace("_", " ")}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section className="odm-section">
            <h3>Payment Summary</h3>
            <div className="odm-pricing">
              <div><span>Subtotal</span><span>{currency(order.pricing?.subtotal)}</span></div>
              {order.pricing?.couponDiscount > 0 && (
                <div><span>Discount</span><span>−{currency(order.pricing.couponDiscount)}</span></div>
              )}
              <div><span>Shipping</span><span>{order.pricing?.shippingCharge ? currency(order.pricing.shippingCharge) : "Free"}</span></div>
              <div className="odm-pricing-total"><span>Total</span><span>{currency(order.pricing?.totalAmount)}</span></div>
              <div className="odm-text-muted">Paid via {order.paymentMethod?.toUpperCase()}</div>
            </div>
          </section>

          {/* Status controls */}
          <section className="odm-section">
            <h3>Update Order</h3>
            <div className="odm-grid-2">
              <div className="odm-control">
                <p className="odm-label">Order status</p>
                <div className="odm-control-row">
                  <StatusBadge status={order.orderStatus} />
                  <select
                    value={statusDraft}
                    disabled={isDelivered || isCancelled}
                    onChange={(e) => setStatusDraft(e.target.value)}
                    className="odm-select"
                  >
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    type="button"
                    className="odm-update-btn"
                    disabled={statusDraft === order.orderStatus || updating || isDelivered || isCancelled}
                    onClick={() => onStatusChange(order._id, statusDraft)}
                  >
                    {updating ? "…" : "Update"}
                  </button>
                </div>
              </div>

              <div className="odm-control">
                <p className="odm-label">Payment status</p>
                <div className="odm-control-row">
                  <StatusBadge status={order.paymentStatus} kind="payment" />
                  <select
                    value={paymentDraft}
                    onChange={(e) => setPaymentDraft(e.target.value)}
                    className="odm-select"
                  >
                    {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    type="button"
                    className="odm-update-btn"
                    disabled={paymentDraft === order.paymentStatus || updating}
                    onClick={() => onPaymentChange(order._id, paymentDraft)}
                  >
                    {updating ? "…" : "Update"}
                  </button>
                </div>
              </div>
            </div>
            {isCancelled && (
              <p className="odm-cancel-note">
                Cancelled{order.cancellation.cancelledBy ? ` by ${order.cancellation.cancelledBy}` : ""}
                {order.cancellation.reason ? ` — ${order.cancellation.reason}` : ""}
              </p>
            )}
          </section>

          {/* Timeline */}
          {order.statusHistory?.length > 0 && (
            <section className="odm-section">
              <h3>Timeline</h3>
              <div className="odm-timeline">
                {[...order.statusHistory].reverse().map((h, i) => (
                  <div key={i} className="odm-timeline-row">
                    <span className="odm-timeline-dot" />
                    <div>
                      <div className="odm-text">{h.status.replace("_", " ")}</div>
                      <div className="odm-text-muted">
                        {formatDateTime(h.timestamp)}{h.note ? ` — ${h.note}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}