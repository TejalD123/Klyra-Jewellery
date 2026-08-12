import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, ArrowUpDown, Check } from "lucide-react";
import FilterSidebar from "../components/FilterSideBar";
import SortDropdown, { SORT_OPTIONS } from "../components/SortDropdown";
import ProductCard from "../components/ProductCard";
import MetalTypeTabs from "../components/MetlaTypeTabs";
import {
  searchProducts,
  fetchCategoryById,
  fetchSubcategoriesOf,
} from "../services/search.api";
import "../styles/SearchPage.css";

const emptyFilters = {
  categories: [],
  minPrice: "",
  maxPrice: "",
  isBestseller: false,
  isCustomizable: false,
  sizes: [],
  minRating: "",
};

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "";

  const [queryText, setQueryText] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(queryText);
  const [filters, setFilters] = useState(emptyFilters);
  const [sort, setSort] = useState("-createdAt");
  const [metalType, setMetalType] = useState("");

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [mainCategory, setMainCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    if (!categoryParam) {
      setMainCategory(null);
      setSubcategories([]);
      setFilters(emptyFilters);
      setMetalType("");
      return;
    }

    fetchCategoryById(categoryParam)
      .then((res) => {
        const clicked = res.data.data;
        const isSubcategory = !!clicked.parentCategory;
        const mainId = isSubcategory
          ? clicked.parentCategory._id || clicked.parentCategory
          : clicked._id;

        const applyMain = (mainDoc) => {
          setMainCategory(mainDoc);
          setMetalType("");
          setFilters({
            ...emptyFilters,
            categories: isSubcategory ? [clicked._id] : [],
          });
        };

        if (isSubcategory) {
          fetchCategoryById(mainId).then((mainRes) =>
            applyMain(mainRes.data.data),
          );
        } else {
          applyMain(clicked);
        }

        fetchSubcategoriesOf(mainId).then((subRes) =>
          setSubcategories(subRes.data.data || []),
        );
      })
      .catch(() => {});
  }, [categoryParam]);

  const load = (page = 1) => {
    setLoading(true);
    setError("");
    searchProducts({
      search: debouncedQuery || undefined,
      category: filters.categories.length
        ? filters.categories.join(",")
        : mainCategory?._id || undefined,
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
    if (categoryParam) next.category = categoryParam;
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, filters, sort, metalType, mainCategory]);

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

  // NEW: same poster resolution logic as CategorySubcategoriesPage —
  // posterDesktop/posterMobile with mutual fallback, and both fall back
  // to the old `image` field so categories created before this feature
  // existed still show something.
  const desktopPosterUrl =
    mainCategory?.posterDesktop ||
    mainCategory?.posterMobile ||
    mainCategory?.image ||
    "";
  const mobilePosterUrl =
    mainCategory?.posterMobile ||
    mainCategory?.posterDesktop ||
    mainCategory?.image ||
    "";

  return (
    <div className="search-page">
      {mainCategory && (
        <div className="search-page__hero">
          {/* NEW: two separately-cropped background layers — CSS media
              query decides which is visible, same pattern as the
              subcategories page hero, so the jewellery doesn't get cut
              off on mobile. */}
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
            <h1 className="search-page__hero-title">{mainCategory.name}</h1>
            {mainCategory.description && (
              <p className="search-page__hero-desc">
                {mainCategory.description}
              </p>
            )}
          </div>
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

        <div className="search-page__toolbar">
          <p className="search-page__result-label">{resultLabel}</p>

          {mainCategory && (mainCategory.metalTypes || []).length > 0 && (
            <MetalTypeTabs
              metalTypes={mainCategory.metalTypes || []}
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
              <div className="search-page__grid search-page__grid--skeleton">
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
                {/* Desktop/tablet: normal grid, all products together */}
                <div className="search-page__grid">
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {/* Mobile only (see CSS): same products split into two
                    rows that each scroll horizontally on their own —
                    scrolling row 1 doesn't move row 2 and vice versa. */}
                <div className="search-page__grid-mobile">
                  <div className="search-page__grid-row">
                    {products
                      .filter((_, i) => i % 2 === 0)
                      .map((p) => (
                        <ProductCard key={p._id} product={p} />
                      ))}
                  </div>
                  <div className="search-page__grid-row">
                    {products
                      .filter((_, i) => i % 2 === 1)
                      .map((p) => (
                        <ProductCard key={p._id} product={p} />
                      ))}
                  </div>
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