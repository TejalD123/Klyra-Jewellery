import { useNavigate } from "react-router-dom";
import "../styles/ProductDetail.css";

const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num || 0);

const RelatedProducts = ({ products = [], viewMoreLink }) => {
  const navigate = useNavigate();

  const visibleProducts = products.slice(0, 5);
  const hasMore = products.length > 5;

  return (
    <section className="related-products">
      <div className="related-products__header">
        <div>
          <span className="related-products__eyebrow">Curated Pairing</span>
          <h2 className="related-products__heading">Complete the Look</h2>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="related-products__empty">No related products found for this item yet.</p>
      ) : (
        <>
          <div className="related-products__grid">
            {visibleProducts.map((p) => (
              <button key={p._id} onClick={() => navigate(`/products/${p.slug}`)} className="related-products__card">
                <div className="related-products__image">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} />
                  ) : (
                    <div className="related-products__no-image">No Image</div>
                  )}
                </div>
                <p className="related-products__name">{p.name}</p>
                <p className="related-products__price">{formatINR(p.finalPrice)}</p>
              </button>
            ))}
          </div>

          {hasMore && (
            <div className="related-products__view-more-wrap">
              <button
                onClick={() => navigate(viewMoreLink || "/products")}
                className="related-products__view-more"
              >
                View More
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default RelatedProducts;