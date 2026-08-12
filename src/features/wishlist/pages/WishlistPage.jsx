import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, X, ShoppingBag } from "lucide-react";
import { getWishlist, removeFromWishlist } from "../services/wishlist.api";
import "../styles/Wishlist.css";

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getWishlist();
        setItems(res.data.data?.items || []);
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    const prevItems = items;
    setItems((curr) => curr.filter((item) => item.product?._id !== productId));

    try {
      await removeFromWishlist(productId);
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      setItems(prevItems);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <section className="wishlist-page">
        <div className="wishlist-page__inner">
          <div className="wishlist-page__grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="wishlist-page__skeleton" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="wishlist-page">
      <div className="wishlist-page__inner">
        <div className="wishlist-page__header">
          <span className="wishlist-page__eyebrow">Saved For Later</span>
          <h1 className="wishlist-page__title">My Wishlist</h1>
          {items.length > 0 && (
            <p className="wishlist-page__count">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="wishlist-page__empty">
            <div className="wishlist-page__empty-icon">
              <Heart size={24} strokeWidth={1.5} />
            </div>
            <h2 className="wishlist-page__empty-title">Your wishlist is empty</h2>
            <p className="wishlist-page__empty-sub">Save the pieces you love and come back to them anytime.</p>
            <Link to="/collections" className="wishlist-page__empty-cta">
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="wishlist-page__grid">
            {items.map(({ product }) => {
              if (!product) return null;

              return (
                <div key={product._id} className="wishlist-item">
                  <div className="wishlist-item__media">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} />
                    ) : (
                      <span className="wishlist-item__label">Product Image</span>
                    )}

                    <button
                      aria-label="Remove from wishlist"
                      onClick={() => handleRemove(product._id)}
                      disabled={removingId === product._id}
                      className="wishlist-item__remove"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>

                    {product.stock === 0 && <span className="wishlist-item__oos">Out of Stock</span>}
                  </div>

                  {/* FIXED: was /product/:slug (singular) — the actual
                      registered route is /products/:slug (plural), so
                      this link 404'd before. */}
                  <Link to={`/products/${product.slug}`}>
                    <p className="wishlist-item__name">{product.name}</p>
                  </Link>
                  <div className="wishlist-item__bottom">
                    {/* FIXED: was product.price, which doesn't exist on
                        the Product model — the field is finalPrice
                        (with basePrice as the pre-discount strike-through). */}
                    <div className="wishlist-item__price-row">
                      <p className="wishlist-item__price">{currency(product.finalPrice)}</p>
                      {product.discount > 0 && (
                        <p className="wishlist-item__strike">{currency(product.basePrice)}</p>
                      )}
                    </div>
                    <button aria-label="Add to bag" disabled={product.stock === 0} className="wishlist-item__add-btn">
                      <ShoppingBag size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default WishlistPage;