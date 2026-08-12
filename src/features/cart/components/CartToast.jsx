import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2, X } from "lucide-react";
import { hideToast } from "../services/cart.slice";
import "../styles/cartToast.css"; // apne actual styles folder path se adjust karo

const CartToast = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
const toast = useSelector((s) => s.cart.toast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dispatch(hideToast()), 4000);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  const handleGoToCart = () => {
    dispatch(hideToast());
    navigate("/cart");
  };

  return (
    <div className="cart-toast">
      <CheckCircle2 size={18} className="cart-toast__icon" />
      <span className="cart-toast__message">{toast.message}</span>
      <button onClick={handleGoToCart} className="cart-toast__action">
        Go to Cart
      </button>
      <button onClick={() => dispatch(hideToast())} aria-label="Dismiss" className="cart-toast__close">
        <X size={14} />
      </button>
    </div>
  );
};

export default CartToast;