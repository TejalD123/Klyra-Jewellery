import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import { fetchMyOrders } from "../services/order.slice";
import OrderCard from "../components/OrderCard";
import "../styles/Order.css";

const MyOrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: orders, status, error } = useSelector((s) => s.orders.list);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <div className="order-page">
      <h1 className="order-page__title">My Orders</h1>

      {status === "loading" && (
        <div className="order-page__skeleton-list">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="order-page__skeleton-row" />
          ))}
        </div>
      )}

      {status === "failed" && <p className="order-page__error">{error}</p>}

      {status === "succeeded" && orders.length === 0 && (
        <div className="order-page__empty">
          <PackageSearch size={48} />
          <p className="order-page__empty-text">No orders yet</p>
          <button onClick={() => navigate("/categories")} className="order-page__empty-btn">
            Start Shopping
          </button>
        </div>
      )}

      {status === "succeeded" && orders.length > 0 && (
        <div className="order-page__list">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
