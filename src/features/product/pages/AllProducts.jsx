import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, ArrowUpDown, Check } from "lucide-react";
import FilterSidebar from "../../search/components/FilterSideBar"; // ⚠️ adjust path if different
import SortDropdown, {
  SORT_OPTIONS,
} from "../../search/components/SortDropdown"; // ⚠️ adjust path if different
import ProductCard from "../../search/components/ProductCard"; // ⚠️ adjust path if different
import MetalTypeTabs from "../../search/components/MetlaTypeTabs"; // ⚠️ adjust path if different
import { searchProducts } from "../../search/services/search.api"; // ⚠️ adjust path if different
import { categoriesAPI } from "../../categories/services/categories.api"; // ⚠️ adjust path if different
import MainCategoryNav from "../components/MainCatgeoryNav";
import "../../search/styles/SearchPage.css"; // reused as-is: searchbar, toolbar, grid, pagination, mobile bar, sort sheet
import "../styles/allproducts.css";

const emptyFilters = {
  categories: [],
  minPrice: "",
  maxPrice: "",
  isBestseller: false,
  isCustomizable: false,
  sizes: [],
  minRating: "",
};

export default function AllProducts() {
  const [searchParams, setSearchParams] = useSearchParams();

  // "category" here always means a MAIN (top-level) category id. This
  // page never deep-links straight into a subcategory the way /products
  // does — subcategory narrowing only happens via the FilterSidebar
  // checkboxes once a main category is picked from the nav chips.
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState(
    searchParams.get("category") || "",
  );

  const [queryText, setQueryText] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(queryText);
  const [filters, setFilters] = useState(emptyFilters);
  const [sort, setSort] = useState("-createdAt");
  const [metalType, setMetalType] = useState("");

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [mainCategories, setMainCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---- top-level category list, loaded once — powers the nav chips ----
  useEffect(() => {
    categoriesAPI
      .getAll({
        parentCategory: "null",
        isActive: true,
        limit: 100,
        sort: "displayOrder",
      })
      .then((data) => setMainCategories(data.categories || []))
      .catch(() => {});
  }, []);
  // NEW: keeps the searchbar in sync when the URL's ?q= changes from
  // OUTSIDE this page — e.g. the navbar search box, used while the user
  // is already sitting on /search (route doesn't remount, so the initial
  // useState read of searchParams alone wouldn't catch this).
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQueryText(q);
    setDebouncedQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(queryText), 400);
    return () => clearTimeout(t);
  }, [queryText]);

  useEffect(() => {
    document.body.style.overflow = filtersOpen || sortOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [filtersOpen, sortOpen]);

  // ---- whenever the selected MAIN category changes, load its
  // subcategories for the (unmodified) FilterSidebar checkboxes ----
  useEffect(() => {
    if (!selectedMainCategoryId) {
      setSubcategories([]);
      return;
    }
    categoriesAPI
      .getSubcategories(selectedMainCategoryId)
      .then((subs) => setSubcategories(subs || []))
      .catch(() => setSubcategories([]));
  }, [selectedMainCategoryId]);

  const selectedMainCategory = useMemo(
    () => mainCategories.find((c) => c._id === selectedMainCategoryId) || null,
    [mainCategories, selectedMainCategoryId],
  );

  const handleSelectMainCategory = (id) => {
    setSelectedMainCategoryId(id);
    setMetalType("");
    setFilters(emptyFilters); // new subcategory set -> old subcategory checkboxes no longer apply
  };

  const load = (page = 1) => {
    setLoading(true);
    setError("");
    searchProducts({
      search: debouncedQuery || undefined,
      category: filters.categories.length
        ? filters.categories.join(",")
        : selectedMainCategoryId || undefined,
      metalType: metalType || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      isBestseller: filters.isBestseller || undefined,
      isCustomizable: filters.isCustomizable || undefined,
      size: filters.sizes.length ? filters.sizes.join(",") : undefined,
      minRating: filters.minRating || undefined,
      isActive: true,
      sort,
      page,
      limit: 12,
    })
      .then((res) => {
        setProducts(res.data.data.products);
        setPagination(res.data.data.pagination);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
    const next = {};
    if (debouncedQuery) next.q = debouncedQuery;
    if (selectedMainCategoryId) next.category = selectedMainCategoryId;
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, filters, sort, metalType, selectedMainCategoryId]);

  const resultLabel = useMemo(() => {
    if (loading) return "Searching…";
    if (debouncedQuery)
      return `${pagination.total} results for "${debouncedQuery}"`;
    return `${pagination.total} pieces`;
  }, [loading, debouncedQuery, pagination.total]);

  const activeFilterCount =
    filters.categories.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.isBestseller ? 1 : 0) +
    (filters.isCustomizable ? 1 : 0) +
    filters.sizes.length +
    (filters.minRating ? 1 : 0);

  // Same poster resolution pattern used on CategorySubcategoriesPage / Search.jsx
  const desktopPosterUrl =
    selectedMainCategory?.posterDesktop ||
    selectedMainCategory?.posterMobile ||
    selectedMainCategory?.image ||
    "";
  const mobilePosterUrl =
    selectedMainCategory?.posterMobile ||
    selectedMainCategory?.posterDesktop ||
    selectedMainCategory?.image ||
    "";

  return (
    <div className="search-page">
      {selectedMainCategory ? (
        <div className="search-page__hero">
          {desktopPosterUrl && (
            <div
              className="search-page__hero-bg search-page__hero-bg--desktop"
              style={{ backgroundImage: `url(${desktopPosterUrl})` }}
            />
          )}
          {mobilePosterUrl && (
            <div
              className="search-page__hero-bg search-page__hero-bg--mobile"
              style={{ backgroundImage: `url(${mobilePosterUrl})` }}
            />
          )}
          <div className="search-page__hero-overlay">
            <h1 className="search-page__hero-title">
              {selectedMainCategory.name}
            </h1>
            {selectedMainCategory.description && (
              <p className="search-page__hero-desc">
                {selectedMainCategory.description}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="jewellery-hero-plain">
          <h1 className="jewellery-hero-plain__title">All Jewellery</h1>
          <p className="jewellery-hero-plain__desc">
            Every piece, every category — in one place.
          </p>
        </div>
      )}

      <div className="search-page__inner">
        <div className="search-page__searchbar">
          <input
            type="text"
            placeholder="Search necklaces, rings, earrings…"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
          />
        </div>

        <MainCategoryNav
          categories={mainCategories}
          selectedId={selectedMainCategoryId}
          onSelect={handleSelectMainCategory}
        />

        <div className="search-page__toolbar">
          <p className="search-page__result-label">{resultLabel}</p>

          {selectedMainCategory &&
            (selectedMainCategory.metalTypes || []).length > 0 && (
              <MetalTypeTabs
                metalTypes={selectedMainCategory.metalTypes || []}
                value={metalType}
                onChange={setMetalType}
              />
            )}

          <div className="search-page__sort-desktop">
            <SortDropdown value={sort} onChange={setSort} />
          </div>
        </div>

        <div className="search-page__layout">
          <FilterSidebar
            categories={subcategories}
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters(emptyFilters)}
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
          />

          <div className="search-page__grid-wrap">
            {loading ? (
              <div className="search-page__grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="search-page__skeleton" />
                ))}
              </div>
            ) : error ? (
              <p className="search-page__error">{error}</p>
            ) : products.length === 0 ? (
              <div className="search-page__empty">
                <p className="search-page__empty-title">No pieces found</p>
                <p className="search-page__empty-sub">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            ) : (
              <>
                <div className="search-page__grid">
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="search-page__pagination">
                    <button
                      className="search-page__page-btn"
                      disabled={pagination.page <= 1}
                      onClick={() => load(pagination.page - 1)}
                    >
                      Previous
                    </button>
                    <span className="search-page__page-label">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      className="search-page__page-btn"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => load(pagination.page + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="search-page__mobile-bar">
        <button
          type="button"
          className="search-page__mobile-bar-btn"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal size={16} strokeWidth={2} />
          Filter
          {activeFilterCount > 0 && (
            <span className="search-page__filter-count">
              {activeFilterCount}
            </span>
          )}
        </button>
        <span className="search-page__mobile-bar-divider" />
        <button
          type="button"
          className="search-page__mobile-bar-btn"
          onClick={() => setSortOpen(true)}
        >
          <ArrowUpDown size={16} strokeWidth={2} />
          Sort
        </button>
      </div>

      <div
        className={`sort-backdrop ${sortOpen ? "is-open" : ""}`}
        onClick={() => setSortOpen(false)}
      />
      <div className={`sort-sheet ${sortOpen ? "is-open" : ""}`}>
        <div className="sort-sheet__header">
          <h2>Sort by</h2>
        </div>
        <div className="sort-sheet__options">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`sort-sheet__option ${sort === opt.value ? "is-selected" : ""}`}
              onClick={() => {
                setSort(opt.value);
                setSortOpen(false);
              }}
            >
              {opt.label}
              {sort === opt.value && <Check size={16} strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
