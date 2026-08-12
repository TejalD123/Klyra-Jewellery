import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { fetchCart } from "../services/cart.slice";
import CartItem from "../components/CartItem";
import "../styles/Cart.css";

const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num || 0);

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalItems, totalAmount, status } = useSelector((s) => s.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const hasBlockingIssues = items.some((i) => i.outOfStock || !i.product);

  if (status === "loading") {
    return (
      <div className="cart-page">
        <div className="cart-page__skeleton-list">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="cart-page__skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "succeeded" && items.length === 0) {
    return (
      <div className="cart-page__empty">
        <ShoppingBag size={48} />
        <p className="cart-page__empty-text">Your cart is empty</p>
        <button onClick={() => navigate("/categories")} className="cart-page__empty-btn">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-page__title">Shopping Bag ({totalItems})</h1>

      <div className="cart-page__layout">
        <div className="cart-page__items">
          {items.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}
        </div>

        <div className="cart-page__summary">
          <div className="cart-page__summary-card">
            <h2 className="cart-page__summary-title">Order Summary</h2>
            <div className="cart-page__summary-row">
              <span>Subtotal</span>
              <span>{formatINR(totalAmount)}</span>
            </div>
            <p className="cart-page__summary-note">Shipping &amp; taxes calculated at checkout</p>
            <div className="cart-page__summary-total">
              <span>Total</span>
              <span>{formatINR(totalAmount)}</span>
            </div>
            <button
              disabled={hasBlockingIssues}
              onClick={() => navigate("/checkout")}
              className="cart-page__checkout-btn"
            >
              Proceed to Checkout
            </button>
            {hasBlockingIssues && (
              <p className="cart-page__checkout-warning">Resolve out-of-stock or unavailable items before checkout.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
