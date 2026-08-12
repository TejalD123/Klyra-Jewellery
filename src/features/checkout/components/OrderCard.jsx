import { useNavigate } from "react-router-dom";
import "../styles/Order.css";

const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num || 0);

const STATUS_CLASS = {
  placed: "order-status-chip--pending",
  confirmed: "order-status-chip--pending",
  processing: "order-status-chip--pending",
  shipped: "order-status-chip--pending",
  delivered: "order-status-chip--success",
  cancelled: "order-status-chip--danger",
};

const OrderCard = ({ order }) => {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(`/orders/${order._id}`)} className="order-card">
      <div className="order-card__top">
        <div>
          <p className="order-card__number">{order.orderNumber}</p>
          <p className="order-card__date">
            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <span className={`order-status-chip ${STATUS_CLASS[order.orderStatus] || ""}`}>{order.orderStatus}</span>
      </div>

      <div className="order-card__thumbs">
        {order.items.slice(0, 4).map((item, idx) => (
          <div key={idx} className="order-card__thumb">
            {item.image && <img src={item.image} alt={item.name} />}
          </div>
        ))}
        {order.items.length > 4 && (
          <div className="order-card__thumb order-card__thumb--more">+{order.items.length - 4}</div>
        )}
      </div>

      <div className="order-card__bottom">
        <span className="order-card__count">{order.items.length} item(s)</span>
        <span className="order-card__total">{formatINR(order.pricing.totalAmount)}</span>
      </div>
    </button>
  );
};

export default OrderCard;
