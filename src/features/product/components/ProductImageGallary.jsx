import { useState } from "react";
import "../styles/ProductDetail.css";

const MAX_THUMBS = 4;

const ProductImageGallery = ({ images = [], name }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasImages = images.length > 0;
  // Only ever show up to 4 thumbnail boxes below the main image. If there's
  // 1 image (or 0), no thumbnail row is shown at all.
  const visibleThumbs = images.slice(0, MAX_THUMBS);

  return (
    <div className="product-gallery">
      <div className="product-gallery__main">
        {hasImages ? (
          <img src={images[activeIndex]} alt={name} />
        ) : (
          <div className="product-gallery__no-image">No Image Available</div>
        )}
      </div>

      {visibleThumbs.length > 1 && (
        <div className="product-gallery__thumbs">
          {visibleThumbs.map((img, idx) => (
            <button
              key={img}
              onClick={() => setActiveIndex(idx)}
              className={`product-gallery__thumb ${idx === activeIndex ? "product-gallery__thumb--active" : ""}`}
            >
              <img src={img} alt={`${name} ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;