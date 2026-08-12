import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import StarRating from "./StarRating";
import { toggleWishlist } from "../../wishlist/services/wishlist.slice"; // adjust path if different
import "../styles/ProductCard.css";

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const formatMetalType = (metalType) => {
  if (!metalType) return "";
  if (metalType.toLowerCase() === "rosegold") return "Rose Gold";
  return metalType.charAt(0).toUpperCase() + metalType.slice(1).toLowerCase();
};

export default function ProductCard({ product }) {
  const {
    name,
    images,
    finalPrice,
    basePrice,
    discount,
    ratings,
    isBestseller,
    isFeatured,
    stock,
    metalType,
    purity,
  } = product;

  const dispatch = useDispatch();
  const isLoggedIn = useSelector((s) => !!s.auth?.token);
  const wishlisted = useSelector((s) => s.wishlist.productIds.includes(product._id));

  const metalLabel = [purity, formatMetalType(metalType)].filter(Boolean).join(" ");

  const handleWishlistClick = (e) => {
    e.preventDefault(); // don't navigate to the product page
    e.stopPropagation();
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    dispatch(toggleWishlist(product._id));
  };

  return (
    <a href={`/products/${product.slug}`} className="product-card">
      <div className="product-card__media">
        {images?.[0] ? (
          <img src={images[0]} alt={name} />
        ) : (
          <div className="product-card__no-image">No image</div>
        )}

        <div className="product-card__badges">
          {isBestseller && <span className="product-card__badge">Bestseller</span>}
          {isFeatured && !isBestseller && <span className="product-card__badge">Featured</span>}
        </div>

        <button
          type="button"
          className={`product-card__wishlist ${wishlisted ? "is-active" : ""}`}
          onClick={handleWishlistClick}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={16} strokeWidth={2} fill={wishlisted ? "currentColor" : "none"} />
        </button>

        {stock === 0 && <div className="product-card__out-of-stock">Out of stock</div>}
      </div>

      <div className="product-card__body">
        <h3 className="product-card__name">{name}</h3>

        {metalLabel && <p className="product-card__metal">{metalLabel}</p>}

        <div className="product-card__rating">
          <StarRating value={ratings?.avgRating || 0} showValue={ratings?.totalReviews > 0} />
        </div>

        <div className="product-card__price-row">
          <span className="product-card__price">{currency(finalPrice)}</span>
          {discount > 0 && <span className="product-card__strike">{currency(basePrice)}</span>}
        </div>
      </div>
    </a>
  );
}