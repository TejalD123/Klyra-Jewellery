import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderById, cancelOrder, cancelOrderItem, requestItemReturn, clearCurrentOrder } from "../services/order.slice";
import OrderStatusTimeline from "../components/OrderStatusTimeline";
import "../styles/Order.css";

const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num || 0);

const OrderDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { data: order, status, error } = useSelector((s) => s.orders.current);
  const [reasonDraft, setReasonDraft] = useState("");

  useEffect(() => {
    dispatch(fetchOrderById(id));
    return () => dispatch(clearCurrentOrder());
  }, [dispatch, id]);

  if (status === "loading") {
    return (
      <div className="order-page">
        <div className="order-page__skeleton-row" style={{ height: "16rem" }} />
      </div>
    );
  }
  if (status === "failed") {
    return (
      <div className="order-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p className="order-page__error">{error}</p>
      </div>
    );
  }
  if (!order) return null;

  const canCancelOrder = ["placed", "confirmed"].includes(order.orderStatus);

  return (
    <div className="order-page">
      <div className="order-detail__inner">
        <div className="order-detail__header">
          <div>
            <h1 className="order-detail__number">{order.orderNumber}</h1>
            <p className="order-detail__date">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          {canCancelOrder && (
            <button
              onClick={() => dispatch(cancelOrder({ id: order._id, reason: reasonDraft || "Cancelled by user" }))}
              className="order-detail__cancel-btn"
            >
              Cancel Order
            </button>
          )}
        </div>

        <div className="order-detail__card">
          <OrderStatusTimeline orderStatus={order.orderStatus} />
        </div>

        <div className="order-detail__card">
          <h2 className="order-detail__card-title">Items</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {order.items.map((item) => (
              <div key={item._id} className="order-detail__item">
                <div className="order-detail__item-thumb">
                  {item.image && <img src={item.image} alt={item.name} />}
                </div>
                <div className="order-detail__item-body">
                  <p className="order-detail__item-name">{item.name}</p>
                  <p className="order-detail__item-meta">
                    {item.metalType} {item.size && `· Size ${item.size}`} · Qty {item.quantity}
                  </p>
                  <p className="order-detail__item-status">
                    <span
                      className={`order-status-chip ${
                        item.itemStatus === "cancelled" ? "order-status-chip--danger" : "order-status-chip--pending"
                      }`}
                    >
                      {item.itemStatus}
                    </span>
                  </p>
                </div>
                <div className="order-detail__item-right">
                  <p className="order-detail__item-price">{formatINR(item.priceAtOrderTime * item.quantity)}</p>
                  {item.itemStatus === "active" && order.orderStatus !== "cancelled" && (
                    <div className="order-detail__item-actions">
                      {order.orderStatus === "delivered" ? (
                        <button
                          onClick={() => dispatch(requestItemReturn({ id: order._id, itemId: item._id, reason: "Requested by user" }))}
                          className="order-detail__link-btn order-detail__link-btn--primary"
                        >
                          Return
                        </button>
                      ) : ["placed", "confirmed"].includes(order.orderStatus) ? (
                        <button
                          onClick={() => dispatch(cancelOrderItem({ id: order._id, itemId: item._id, reason: "Cancelled by user" }))}
                          className="order-detail__link-btn order-detail__link-btn--danger"
                        >
                          Cancel Item
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-detail__card">
          <h2 className="order-detail__card-title">Shipping Address</h2>
          <p className="order-detail__address-name">{order.shippingAddress.fullName}</p>
          <p className="order-detail__address-line">
            {order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2}
          </p>
          <p className="order-detail__address-line">
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </p>
          <p className="order-detail__address-line">{order.shippingAddress.phoneNumber}</p>
        </div>

        <div className="order-detail__card">
          <h2 className="order-detail__card-title">Price Details</h2>
          <div className="order-detail__price-rows">
            <div className="order-detail__price-row">
              <span>Subtotal</span>
              <span>{formatINR(order.pricing.subtotal)}</span>
            </div>
            {order.pricing.couponDiscount > 0 && (
              <div className="order-detail__price-row order-detail__price-row--discount">
                <span>Coupon Discount</span>
                <span>−{formatINR(order.pricing.couponDiscount)}</span>
              </div>
            )}
            <div className="order-detail__price-row">
              <span>Shipping</span>
              <span>{formatINR(order.pricing.shippingCharge)}</span>
            </div>
            <div className="order-detail__price-row--total">
              <span>Total</span>
              <span>{formatINR(order.pricing.totalAmount)}</span>
            </div>
          </div>
          <p className="order-detail__payment-note">
            Payment: {order.paymentMethod} · {order.paymentStatus}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
