import "../styles/Categories.css";

// shape="square" (default) — rounded-corner square, used on the
// subcategories page.
// shape="circle" — fully round, used on the All Categories (main
// categories) page.
const CategoryCard = ({ name, image, onClick, shape = "square" }) => (
  <button
    onClick={onClick}
    className={`category-card${shape === "circle" ? " category-card--circle" : ""}`}
  >
    <div className="category-card__image">
      {image ? <img src={image} alt={name} /> : <div className="category-card__no-image">No Image</div>}
    </div>
    <span className="category-card__name">{name}</span>
  </button>
);

// "View All" tile — sits at the end of the homepage grid, same footprint
// as a normal CategoryCard so it lines up in the grid, but styled as an
// outlined call-to-action instead of a product image.
export const ViewAllCard = ({ onClick, label = "View All", shape = "square" }) => (
  <button
    onClick={onClick}
    className={`category-card category-card--more${shape === "circle" ? " category-card--circle" : ""}`}
  >
    <div className="category-card__image category-card__image--more">
      <span className="category-card__more-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
    <span className="category-card__name">{label}</span>
  </button>
);

export default CategoryCard;