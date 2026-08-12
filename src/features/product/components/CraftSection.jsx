// "The Craftsmanship" storytelling block — artisan photo + narrative copy.
//
// NOTE: product.model.js has no fields for this yet (no craftsmanship
// story/hours/image). Passing product.craftsmanship = { hours, story, image }
// will use real per-product content; otherwise it falls back to generic
// brand copy so the section still renders something reasonable. Add
// `craftsmanship: { hours: Number, story: String, image: String }` to
// product.model.js (+ admin form + validation schema) if you want this
// to be editable per product from the admin panel.
import "../styles/ProductDetail.css";

const DEFAULT_STORY =
  "hand-cast by our master artisans in the Klyra Atelier, ensuring the structural integrity matches the aesthetic brilliance. This is not just jewelry; it is a legacy piece carved from time itself.";

const CraftSection = ({ product }) => {
  const hours = product?.craftsmanship?.hours || 200;
  const story = product?.craftsmanship?.story || DEFAULT_STORY;
  const image = product?.craftsmanship?.image || product?.images?.[1] || product?.images?.[0];

  return (
    <section className="craftsmanship">
      <div className="craftsmanship__media">
        {image ? (
          <img src={image} alt="Klyra Atelier craftsmanship" />
        ) : (
          <div className="craftsmanship__no-image">Atelier</div>
        )}
      </div>
      <div className="craftsmanship__content">
        <span className="craftsmanship__eyebrow">The Craftsmanship</span>
        <h2 className="craftsmanship__heading">{hours} Hours of Devotion</h2>
        <p className="craftsmanship__story">
          Each {product?.name || "piece"} is the result of over {hours} hours of meticulous labor. Our master artisans are {story}
        </p>
        <a href="/atelier" className="craftsmanship__link">
          Explore the Atelier →
        </a>
      </div>
    </section>
  );
};

export default CraftSection;