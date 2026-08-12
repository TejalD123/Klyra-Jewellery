import { Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateCartItemQty, removeCartItem } from "../services/cart.slice";
import "../styles/Cart.css";

const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num || 0);

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const { _id, product, quantity, size, priceAtAddTime, priceChanged, outOfStock, lineTotal } = item;

  if (!product) {
    return (
      <div className="cart-item cart-item--error">
        <p className="cart-item__error-text">This product is no longer available.</p>
        <button onClick={() => dispatch(removeCartItem(_id))} className="cart-item__icon-btn">
          <Trash2 size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="cart-item">
      <div className="cart-item__thumb">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <div className="cart-item__no-image">No Image</div>
        )}
      </div>

      <div className="cart-item__body">
        <div className="cart-item__top">
          <p className="cart-item__name">{product.name}</p>
          <button onClick={() => dispatch(removeCartItem(_id))} className="cart-item__remove">
            <Trash2 size={16} />
          </button>
        </div>

        {size && <p className="cart-item__meta">Size: {size}</p>}
        <p className="cart-item__meta">{product.metalType}</p>

        {priceChanged && (
          <p className="cart-item__warning">
            Price updated: {formatINR(product.finalPrice)} (was {formatINR(priceAtAddTime)})
          </p>
        )}
        {outOfStock && <p className="cart-item__danger">Out of stock — please remove or reduce quantity</p>}

        <div className="cart-item__bottom">
          <div className="cart-item__qty">
            <button
              onClick={() => quantity > 1 && dispatch(updateCartItemQty({ itemId: _id, quantity: quantity - 1 }))}
              className="cart-item__qty-btn"
            >
              −
            </button>
            <span className="cart-item__qty-value">{quantity}</span>
            <button
              onClick={() => dispatch(updateCartItemQty({ itemId: _id, quantity: quantity + 1 }))}
              className="cart-item__qty-btn"
            >
              +
            </button>
          </div>
          <p className="cart-item__total">{formatINR(lineTotal)}</p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
