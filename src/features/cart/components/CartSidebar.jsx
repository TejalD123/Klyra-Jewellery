import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { X, ShoppingBag } from "lucide-react";

import { fetchCart, closeCartSidebar } from "../services/cart.slice";

import CartItem from "./CartItem";
import "../styles/cartSidebar.css";

const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num || 0);

const CartSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // const isOpen = useSelector((s) => s.cartUI.isSidebarOpen);
  const {
    items,
    totalItems,
    totalAmount,
    status,
    isSidebarOpen: isOpen,
  } = useSelector((s) => s.cart);
  const isLoggedIn = !!useSelector((s) => s.auth.token);
  // const isLoggedIn = !!useSelector((s) => s.auth.token);

  useEffect(() => {
    if (isOpen && isLoggedIn) dispatch(fetchCart());
  }, [isOpen, isLoggedIn, dispatch]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => dispatch(closeCartSidebar());

  const handleGoToCart = () => {
    dispatch(closeCartSidebar());
    navigate("/cart");
  };

  const hasOutOfStock = items.some((i) => i.outOfStock);

  return (
    <div
      className={`cart-sidebar-overlay ${isOpen ? "cart-sidebar-overlay--open" : ""}`}
    >
      <div className="cart-sidebar-backdrop" onClick={handleClose} />

      <aside className={`cart-sidebar ${isOpen ? "cart-sidebar--open" : ""}`}>
        <div className="cart-sidebar__header">
          <h2 className="cart-sidebar__title">
            Your Bag {totalItems > 0 && `(${totalItems})`}
          </h2>
          <button
            aria-label="Close cart"
            onClick={handleClose}
            className="cart-sidebar__close"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="cart-sidebar__body">
          {status === "loading" && items.length === 0 ? (
            <div className="cart-sidebar__skeleton-list">
              <div className="cart-sidebar__skeleton-row" />
              <div className="cart-sidebar__skeleton-row" />
            </div>
          ) : items.length === 0 ? (
            <div className="cart-sidebar__empty">
              <ShoppingBag size={40} strokeWidth={1} />
              <p>Your bag is empty</p>
            </div>
          ) : (
            items.map((item) => <CartItem key={item._id} item={item} />)
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-sidebar__footer">
            <div className="cart-sidebar__total-row">
              <span>Total</span>
              <span className="cart-sidebar__total-amount">
                {formatINR(totalAmount)}
              </span>
            </div>
            {hasOutOfStock && (
              <p className="cart-sidebar__warning">
                Some items are out of stock — resolve before checkout
              </p>
            )}
            <button
              onClick={handleGoToCart}
              className="cart-sidebar__checkout-btn"
            >
              Go to Cart
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartSidebar;
