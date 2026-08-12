import { useState } from "react";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist } from "../../wishlist/services/wishlist.slice"; // ⚠️ adjust path if different
import "../styles/ProductDetail.css";

const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num || 0);

const ProductInfo = ({ product, onAddToCart }) => {
  const {
    _id,
    name,
    description,
    category,
    metalType,
    purity,
    weight,
    stoneType,
    makingCharges,
    basePrice,
    finalPrice,
    stock,
    sizeOptions = [],
  } = product;

  const [selectedSize, setSelectedSize] = useState(sizeOptions[0] || null);
  const inStock = stock > 0;
  const subtotal = (basePrice || 0) + (makingCharges || 0);

  const dispatch = useDispatch();
  const isLoggedIn = useSelector((s) => !!s.auth?.token);
  const wishlisted = useSelector((s) => s.wishlist.productIds.includes(_id));

  const handleWishlistClick = () => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    dispatch(toggleWishlist(_id));
  };

  return (
    <div className="product-info">
      <span className="product-info__eyebrow">{category?.name || "Fine Jewelry"}</span>

      <h1 className="product-info__name">{name}</h1>

      <div className="product-info__price-row">
        <span className="product-info__price">{formatINR(finalPrice)}</span>
        {finalPrice < subtotal && (
          <span className="product-info__strike">{formatINR(subtotal)}</span>
        )}
        <span
          className={`product-info__stock-pill ${
            inStock ? "product-info__stock-pill--in" : "product-info__stock-pill--out"
          }`}
        >
          {inStock ? `${stock} in stock` : "Out of stock"}
        </span>
      </div>

      {description && <p className="product-info__quote">"{description}"</p>}

      {/* Always-visible spec grid — no click needed to see materials/weight/stone */}
      <div className="product-info__specs">
        <div className="product-info__spec">
          <span className="product-info__spec-label">Metal</span>
          <span className="product-info__spec-value">
            {metalType} {purity && `· ${purity}`}
          </span>
        </div>
        <div className="product-info__spec">
          <span className="product-info__spec-label">Weight</span>
          <span className="product-info__spec-value">{weight} g</span>
        </div>
        {stoneType && stoneType !== "None" && (
          <div className="product-info__spec">
            <span className="product-info__spec-label">Stone</span>
            <span className="product-info__spec-value">{stoneType}</span>
          </div>
        )}
        <div className="product-info__spec">
          <span className="product-info__spec-label">Making Charges</span>
          <span className="product-info__spec-value">{formatINR(makingCharges)}</span>
        </div>
      </div>

      {sizeOptions.length > 0 && (
        <div>
          <p className="product-info__size-title">Select Size</p>
          <div className="product-info__size-options">
            {sizeOptions.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`product-info__size-btn ${selectedSize === size ? "product-info__size-btn--active" : ""}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="product-info__actions">
        <button
          disabled={!inStock}
          onClick={() => onAddToCart({ size: selectedSize })}
          className="product-info__btn product-info__btn--primary"
        >
          {inStock ? "Add to Bag" : "Out of Stock"}
        </button>
        <button
          onClick={handleWishlistClick}
          className={`product-info__btn product-info__btn--secondary ${wishlisted ? "is-active" : ""}`}
        >
          <Heart size={15} strokeWidth={2} fill={wishlisted ? "currentColor" : "none"} />
          {wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;