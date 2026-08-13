import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2 } from "lucide-react";
import { fetchOrderById, clearCurrentOrder } from "../../checkout/services/order.slice";
import "../../checkout/styles/Order.css";
import "../style/Orderconfirmation.css";

const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num || 0);

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { data: order, status } = useSelector((s) => s.orders.current);

  useEffect(() => {
    dispatch(fetchOrderById(id));
    return () => dispatch(clearCurrentOrder());
  }, [dispatch, id]);

  if (status === "loading" || !order) {
    return (
      <div className="order-page">
        <div className="order-page__skeleton-row" style={{ height: "16rem" }} />
      </div>
    );
  }

  return (
    <div className="order-page">
      <div className="order-confirmation">
        <div className="order-confirmation__icon">
          <CheckCircle2 size={56} />
        </div>
        <h1 className="order-confirmation__title">Thank you for your order!</h1>
        <p className="order-confirmation__subtitle">
          Your order <strong>{order.orderNumber}</strong> has been placed successfully.
        </p>

        <div className="order-detail__card order-confirmation__summary">
          <div className="order-detail__price-row">
            <span>Payment Method</span>
            <span style={{ textTransform: "uppercase" }}>{order.paymentMethod}</span>
          </div>
          <div className="order-detail__price-row">
            <span>Payment Status</span>
            <span style={{ textTransform: "capitalize" }}>{order.paymentStatus}</span>
          </div>
          <div className="order-detail__price-row--total">
            <span>Total Paid</span>
            <span>{formatINR(order.pricing.totalAmount)}</span>
          </div>
        </div>

        <div className="order-confirmation__actions">
          <Link to={`/orders/${order._id}`} className="order-confirmation__btn order-confirmation__btn--primary">
            View Order
          </Link>
          <Link to="/categories" className="order-confirmation__btn order-confirmation__btn--ghost">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;