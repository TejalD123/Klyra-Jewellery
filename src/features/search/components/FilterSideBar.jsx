import { X } from "lucide-react";
import StarRating from "./StarRating";
import "../styles/SearchPage.css";

const RATING_OPTIONS = [4, 3, 2, 1];
const SIZE_OPTIONS = ["48", "50", "52", "54", "56"];

export default function FilterSidebar({ categories, filters, onChange, onClear, isOpen, onClose }) {
  const toggleCategory = (id) => {
    const next = filters.categories.includes(id)
      ? filters.categories.filter((c) => c !== id)
      : [...filters.categories, id];
    onChange({ ...filters, categories: next });
  };

  const toggleSize = (size) => {
    const next = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onChange({ ...filters, sizes: next });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.isBestseller ||
    filters.isCustomizable ||
    filters.sizes.length > 0 ||
    filters.minRating;

  return (
    <>
      {/* Backdrop only ever shows on mobile (see CSS) — hidden entirely
          on laptop/tablet where the sidebar sits statically in the layout. */}
      <div
        className={`filter-backdrop ${isOpen ? "is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`filter-sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="filter-sidebar__header">
          <h2 className="filter-sidebar__title">Filters</h2>
          <div className="filter-sidebar__header-actions">
            {hasActiveFilters && (
              <button onClick={onClear} className="filter-sidebar__clear">
                Clear all
              </button>
            )}
            {/* Close button only relevant on mobile (sheet) — hidden on desktop */}
            <button
              type="button"
              className="filter-sidebar__close"
              onClick={onClose}
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="filter-sidebar__scroll">
          {/* Subcategories of the current main category */}
          {categories?.length > 0 && (
            <div>
              <h3 className="filter-sidebar__section-title">Category</h3>
              <div className="filter-sidebar__category-list">
                {categories.map((cat) => (
                  <label key={cat._id} className="filter-sidebar__checkbox-row">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(cat._id)}
                      onChange={() => toggleCategory(cat._id)}
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price range */}
          <div>
            <h3 className="filter-sidebar__section-title">Price</h3>
            <div className="filter-sidebar__price-row">
              <input
                type="number"
                placeholder="Min"
                className="filter-input"
                value={filters.minPrice}
                onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
              />
              <span>–</span>
              <input
                type="number"
                placeholder="Max"
                className="filter-input"
                value={filters.maxPrice}
                onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="filter-sidebar__section-title">Features</h3>
            <div className="filter-sidebar__category-list">
              <label className="filter-sidebar__checkbox-row">
                <input
                  type="checkbox"
                  checked={filters.isBestseller}
                  onChange={(e) => onChange({ ...filters, isBestseller: e.target.checked })}
                />
                <span>Bestsellers only</span>
              </label>
              <label className="filter-sidebar__checkbox-row">
                <input
                  type="checkbox"
                  checked={filters.isCustomizable}
                  onChange={(e) => onChange({ ...filters, isCustomizable: e.target.checked })}
                />
                <span>Customizable / Engravable</span>
              </label>
            </div>
          </div>

          {/* Size */}
          <div>
            <h3 className="filter-sidebar__section-title">Size</h3>
            <div className="filter-sidebar__size-grid">
              {SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`filter-sidebar__size-chip ${filters.sizes.includes(size) ? "is-selected" : ""}`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Star rating */}
          <div>
            <h3 className="filter-sidebar__section-title">Customer Rating</h3>
            <div className="filter-sidebar__rating-list">
              {RATING_OPTIONS.map((r) => (
                <label key={r} className="filter-sidebar__rating-row">
                  <input
                    type="radio"
                    name="minRating"
                    checked={Number(filters.minRating) === r}
                    onChange={() => onChange({ ...filters, minRating: r })}
                  />
                  <StarRating value={r} size={13} />
                  <span className="filter-sidebar__rating-suffix">&amp; up</span>
                </label>
              ))}
              {filters.minRating && (
                <button onClick={() => onChange({ ...filters, minRating: "" })} className="filter-sidebar__reset-rating">
                  Reset rating
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer "Show Results" button only relevant on mobile — hidden on desktop */}
        <div className="filter-sidebar__footer">
          <button type="button" className="filter-sidebar__apply-btn" onClick={onClose}>
            Show Results
          </button>
        </div>
      </aside>
    </>
  );
}