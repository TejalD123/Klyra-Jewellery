import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { productsAPI } from "../../features/product/services/product.api"; // ⚠️ adjust path if different
import { toggleWishlist } from "../../features/wishlist/services/wishlist.slice"; // ⚠️ adjust path if different
import "../styles/BestSellers.css";

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

// Pricing field names vary across product APIs — this pulls whichever
// exists so the component works regardless of exact schema naming.
const getPricing = (p) => {
  const selling =
    p.pricing?.sellingPrice ?? p.sellingPrice ?? p.pricing?.price ?? p.finalPrice ?? p.price ?? 0;
  const mrp =
    p.pricing?.mrp ?? p.mrp ?? p.pricing?.originalPrice ?? p.originalPrice ?? p.compareAtPrice ?? null;

  const hasDiscount = mrp && mrp > selling;
  const discountPct = hasDiscount ? Math.round(((mrp - selling) / mrp) * 100) : 0;

  return { selling, mrp, hasDiscount, discountPct };
};

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const isLoggedIn = useSelector((s) => !!s.auth?.token);
  const wishlistIds = useSelector((s) => s.wishlist.productIds);

  useEffect(() => {
    let cancelled = false;

    productsAPI
      .getAll({ isBestseller: true, limit: 4 })
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products || data || []);
      })
      .catch(() => { if (!cancelled) setProducts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const handleWishlistClick = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    dispatch(toggleWishlist(productId));
  };

  return (
    <section className="bestsellers">
      <div className="bestsellers__inner">
        <div className="bestsellers__header">
          <div>
            <span className="bestsellers__eyebrow">Bestselling</span>
            <h2 className="bestsellers__heading">Our Most Loved Pieces</h2>
          </div>
          <Link to="/collections" className="bestsellers__viewall">
            View All Products →
          </Link>
        </div>

        <div className="bestsellers__grid">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bestsellers__card bestsellers__card--loading">
                  <div className="bestsellers__card-image" />
                  <div className="bestsellers__card-info">
                    <p className="bestsellers__card-name">&nbsp;</p>
                    <p className="bestsellers__card-price">&nbsp;</p>
                  </div>
                </div>
              ))
            : products.map((p) => {
                const image = p.images?.[0] || p.image;
                const { selling, mrp, hasDiscount, discountPct } = getPricing(p);
                const wishlisted = wishlistIds.includes(p._id);

                return (
                  <Link key={p._id} to={`/products/${p.slug}`} className="bestsellers__card">
                    <div className="bestsellers__card-image">
                      {image ? (
                        <img src={image} alt={p.name} loading="lazy" />
                      ) : (
                        <span className="bestsellers__card-label">Product Image</span>
                      )}

                      {hasDiscount && (
                        <span className="bestsellers__discount-tag">{discountPct}% OFF</span>
                      )}

                      <button
                        type="button"
                        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        className={`bestsellers__wishlist ${wishlisted ? "is-active" : ""}`}
                        onClick={(e) => handleWishlistClick(e, p._id)}
                      >
                        <Heart size={14} strokeWidth={1.5} fill={wishlisted ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <div className="bestsellers__card-info">
                      <p className="bestsellers__card-name">{p.name}</p>

                      <div className="bestsellers__card-price-row">
                        <span className="bestsellers__card-price">{currency(selling)}</span>
                        {hasDiscount && (
                          <span className="bestsellers__card-mrp">{currency(mrp)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;