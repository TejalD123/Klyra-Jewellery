import "../styles/allproducts.css";

// Horizontal, always-visible category switcher — "All Jewellery" plus
// every top-level main category (Rings, Earrings, Necklaces...). Clicking
// one narrows the grid + reveals that category's subcategories in the
// existing FilterSidebar. This is the ONLY new UI element this feature
// adds — everything else reuses Search.jsx's existing components as-is.
export default function MainCategoryNav({ categories = [], selectedId, onSelect }) {
  return (
    <div className="jewellery-nav">
      <button
        type="button"
        className={`jewellery-nav__chip ${!selectedId ? "is-active" : ""}`}
        onClick={() => onSelect("")}
      >
        All Jewellery
      </button>
      {categories.map((cat) => (
        <button
          key={cat._id}
          type="button"
          className={`jewellery-nav__chip ${selectedId === cat._id ? "is-active" : ""}`}
          onClick={() => onSelect(cat._id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}