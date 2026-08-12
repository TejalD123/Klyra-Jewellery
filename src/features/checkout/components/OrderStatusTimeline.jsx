import { Check } from "lucide-react";
import "../styles/Order.css";

const STEPS = ["placed", "confirmed", "processing", "shipped", "delivered"];

const OrderStatusTimeline = ({ orderStatus }) => {
  if (orderStatus === "cancelled") {
    return <div className="order-status-chip order-status-chip--danger">Order Cancelled</div>;
  }

  const currentIndex = STEPS.indexOf(orderStatus);

  return (
    <div className="order-timeline">
      {STEPS.map((step, idx) => (
        <div key={step} className="order-timeline__step">
          <div className="order-timeline__node">
            <div className={`order-timeline__circle ${idx <= currentIndex ? "order-timeline__circle--done" : ""}`}>
              {idx < currentIndex ? <Check size={14} /> : idx + 1}
            </div>
            <span className="order-timeline__label">{step}</span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`order-timeline__line ${idx < currentIndex ? "order-timeline__line--done" : ""}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderStatusTimeline;
