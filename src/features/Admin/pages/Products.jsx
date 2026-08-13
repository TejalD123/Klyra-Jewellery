import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Topbar from "../components/TopBar";
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  updateProductStock,
  toggleProductFeatured,
  toggleProductStatus,
  deleteProduct,
} from "../services/Productservice";
import { fetchCategories } from "../services/categoryService";

import "../styles/admincard.css";
import "../styles/adminbutton.css";
import "../styles/admintable.css";
import "../styles/adminbadge.css";
import "../styles/adminform.css";
import "../styles/admintableactions.css";

// value = exact enum backend accepts (product.model.js / product.validation.js).
// label = what admin sees in the dropdown. Karat-level detail (18K/22K/925)
// goes in the separate "Purity" field, since backend's metalType enum is
// only ["gold","silver","platinum","rosegold"].
const METAL_TYPES = [
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "platinum", label: "Platinum" },
  { value: "rosegold", label: "Rose Gold" },
];
const STONE_TYPES = [
  { value: "None", label: "None" },
  { value: "Diamond", label: "Diamond" },
  { value: "Pearl", label: "Pearl" },
  { value: "Kundan", label: "Kundan" },
  { value: "Ruby", label: "Ruby" },
  { value: "Emerald", label: "Emerald" },
];
const DEFAULT_SIZES = ["48", "50", "52", "54", "56"];

const slugify = (str = "") =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Normalizes an image entry to a plain URL string — handles both
// ["https://..."] (array of strings) and [{url: "..."}] shapes defensively.
const imgUrl = (img) => (typeof img === "string" ? img : img?.url || img?.secure_url || "");

const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" strokeLinecap="round" />
  </svg>
);
const IconSpec = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="7" height="7" rx="1" /><rect x="14" y="4" width="7" height="7" rx="1" />
    <rect x="3" y="15" width="7" height="5" rx="1" /><rect x="14" y="15" width="7" height="5" rx="1" />
  </svg>
);
const IconPricing = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="M9 15c0 1.1 1.3 2 3 2s3-.9 3-2-1.3-1.7-3-2-3-.9-3-2 1.3-2 3-2 3 .9 3 2" strokeLinecap="round" />
  </svg>
);
const IconMedia = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" />
    <path d="M21 16l-5-5-4 4-3-3-5 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconUpload = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M12 16V4M8 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
  </svg>
);
const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 20h9" strokeLinecap="round" />
    <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconPower = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2v10" strokeLinecap="round" />
    <path d="M18.36 6.64a9 9 0 11-12.73 0" strokeLinecap="round" />
  </svg>
);
const IconStar = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2.5l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.9-6.2 3.9 1.6-7L2 9.7l7.1-.6L12 2.5z" strokeLinejoin="round" />
  </svg>
);
const IconNoImage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 16l4-4 4 4 6-6 4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const emptyForm = {
  name: "",
  slug: "", // UI preview only — backend auto-generates the real slug, never sent
  sku: "",
  description: "",
  category: "", // final id sent to backend — subcategory if chosen, else main category
  mainCategory: "", // UI-only, drives the subcategory dropdown, never sent to backend
  metalType: METAL_TYPES[0].value,
  purity: "",
  weight: "",
  stoneType: STONE_TYPES[0].value,
  sizes: [],
  basePrice: "",
  makingCharges: 0,
  discount: 0,
  images: [],
  stock: 0,
  isActive: true,
  isFeatured: false,
  isBestseller: false,
  allowCustomEngraving: false, // maps to backend's isCustomizable on submit
  // isNewArrival / collection: UI-only for now — product.model.js has no
  // matching fields yet, so these are NOT sent to the backend. Add them to
  // product.model.js + product.validation.js first if you want them saved.
  isNewArrival: false,
  collection: "",
};

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Edit mode — only used by table Edit icon. Does not change form JSX/layout.
  const [editingId, setEditingId] = useState(null);
  const [existingImages, setExistingImages] = useState([]); // kept silently, sent as keepImages

  // Table-only additions: lightbox gallery + toast
  const [lightbox, setLightbox] = useState(null);
  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(""), 2500);
  };

  // Deep-link from Dashboard's Low Stock Alert (?edit=<productId>)
  const [searchParams, setSearchParams] = useSearchParams();

  const loadProducts = (page = 1, q = search) => {
    setLoading(true);
    fetchProducts({ page, search: q || undefined })
      .then((res) => {
        setProducts(res.data.data.products || []);
        setPagination(res.data.data.pagination || { page: 1, totalPages: 1, total: 0 });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts(1, "");
    fetchCategories().then((res) => setCategories(res.data.data.categories || [])).catch(() => {});
  }, []);

  // categories comes back as a flat list (root categories + subcategories
  // together, each with parentCategory populated as {_id, name, slug} or
  // null). Split it here instead of a second API call.
  const mainCategories = categories.filter((c) => !c.parentCategory);
  const subcategoriesForSelected = categories.filter(
    (c) => c.parentCategory?._id === form.mainCategory
  );
  const mainCategoryName =
    mainCategories.find((c) => c._id === form.mainCategory)?.name || "this category";

  // Table display only — resolve "Rings / Engagement Rings" style breadcrumb
  // for a product's category using the already-fetched flat categories
  // list (which has parentCategory populated). No extra backend call.
  const categoryBreadcrumb = (product) => {
    const categoryId = product.category?._id || product.category;
    const matched = categories.find((c) => c._id === categoryId);
    if (!matched) return product.category?.name || "—";
    return matched.parentCategory
      ? `${matched.parentCategory.name} / ${matched.name}`
      : matched.name;
  };

  const handleNameChange = (value) => {
    setForm((f) => ({ ...f, name: value, slug: slugTouched ? f.slug : slugify(value) }));
  };

  const toggleSize = (size) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  };

  const addCustomSize = () => {
    const value = window.prompt("Enter size:");
    if (value) toggleSize(value);
  };

  const subtotal = (Number(form.basePrice) || 0) + (Number(form.makingCharges) || 0);
  const estimatedPrice = subtotal - (subtotal * (Number(form.discount) || 0)) / 100;

  const resetForm = () => {
    setForm(emptyForm);
    setSlugTouched(false);
    setFormError("");
    setShowForm(false);
    setEditingId(null);
    setExistingImages([]);
  };

  // Table Edit icon -> pre-fill form state (no visual/layout change to the form itself)
  const handleEditClick = (p) => {
    const categoryId = p.category?._id || p.category || "";
    // p.category might itself be a subcategory — find its parent (if any)
    // so the Main Category dropdown pre-selects correctly and the
    // Subcategory dropdown then shows the right list with this one selected.
    const matchedCategory = categories.find((c) => c._id === categoryId);
    const parentId = matchedCategory?.parentCategory?._id || null;
    const resolvedMainCategory = parentId || categoryId;

    setForm({
      name: p.name || "",
      slug: p.slug || "",
      sku: p.sku || "",
      description: p.description || "",
      category: categoryId,
      mainCategory: resolvedMainCategory,
      metalType: p.metalType || METAL_TYPES[0].value,
      purity: p.purity || "",
      weight: p.weight ?? "",
      stoneType: p.stoneType || STONE_TYPES[0].value,
      sizes: p.sizeOptions || p.sizes || [],
      basePrice: p.basePrice ?? "",
      makingCharges: p.makingCharges ?? 0,
      discount: p.discount ?? 0,
      images: [],
      stock: p.stock ?? 0,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      isBestseller: p.isBestseller ?? false,
      allowCustomEngraving: p.isCustomizable ?? false,
      isNewArrival: p.isNewArrival ?? false,
      collection: p.collection || "",
    });
    setExistingImages((p.images || []).map(imgUrl).filter(Boolean));
    setSlugTouched(true);
    setEditingId(p._id);
    setShowForm(true);
  };

  // Deep-link: /admin/products?edit=<id> from Dashboard's Low Stock Alert.
  // Waits for categories to load first, since handleEditClick needs them
  // to resolve the parent category for the subcategory dropdown.
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || categories.length === 0) return;

    fetchProductById(editId)
      .then((res) => {
        handleEditClick(res.data.data);
        setSearchParams({}, { replace: true });
      })
      .catch(() => {
        showToast("Product load nahi jhala");
        setSearchParams({}, { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.name || !form.category || !form.weight || !form.basePrice) {
      setFormError("Name, category, weight ani base price required ahet");
      return;
    }
    setSaving(true);
    try {
      // Only send fields product.validation.js (createProductSchema) knows
      // about. slug is server-generated; isNewArrival/collection have no
      // backend field yet (add to product.model.js + product.validation.js
      // first if you want those persisted) — sending them causes a 400
      // since Joi rejects unknown keys.
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        metalType: form.metalType,
        purity: form.purity,
        weight: form.weight,
        stoneType: form.stoneType,
        makingCharges: form.makingCharges,
        basePrice: form.basePrice,
        discount: form.discount,
        stock: form.stock,
        sku: form.sku,
        sizeOptions: form.sizes,
        isCustomizable: form.allowCustomEngraving,
        isFeatured: form.isFeatured,
        isBestseller: form.isBestseller,
        isActive: form.isActive,
      };

      if (editingId) {
        await updateProduct(editingId, { ...payload, keepImages: existingImages }, form.images);
        showToast("Product updated");
      } else {
        await createProduct(payload, form.images);
        showToast("Product created");
      }
      resetForm();
      loadProducts(1, "");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStockUpdate = async (id, currentStock) => {
    const value = window.prompt("Naya stock quantity taak:", currentStock);
    if (value === null || isNaN(Number(value))) return;
    await updateProductStock(id, "set", Number(value));
    showToast("Stock updated");
    loadProducts(pagination.page);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" delete karायचi?`)) return;
    try {
      await deleteProduct(id);
      showToast("Product deleted");
      loadProducts(pagination.page);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (p) => {
    await toggleProductStatus(p._id);
    showToast(p.isActive ? "Product deactivated" : "Product activated");
    loadProducts(pagination.page);
  };

  const handleToggleFeatured = async (p) => {
    await toggleProductFeatured(p._id);
    showToast(p.isFeatured ? "Removed from featured" : "Marked as featured");
    loadProducts(pagination.page);
  };

  return (
    <div className="space-y-6">
      <Topbar
        title="Products"
        subtitle={`${pagination.total} total`}
        actions={
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
          >
            {showForm ? "Cancel" : "+ Create Product"}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form-container">
          {formError && <div className="admin-form-error">{formError}</div>}

          <div className="admin-form-columns">
            {/* ---- LEFT COLUMN ---- */}
            <div className="admin-form-col">
              {/* ---- General Information ---- */}
              <section className="admin-form-section">
                <div className="admin-form-section__header">
                  <IconInfo />
                  <span className="admin-form-section__title">General Information</span>
                </div>
                <div className="admin-form-section__body admin-form-grid">
                  <div className="admin-field admin-form-grid--full">
                    <label>Product Name</label>
                    <input
                      placeholder="e.g. Celestial Diamond Halo Ring"
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Slug (URL Key)</label>
                    <input
                      className="is-slug"
                      placeholder="celestial-diamond-halo-ring"
                      value={form.slug}
                      onChange={(e) => { setSlugTouched(true); setForm((f) => ({ ...f, slug: slugify(e.target.value) })); }}
                    />
                  </div>
                  <div className="admin-field">
                    <label>SKU Code</label>
                    <input
                      placeholder="LX-DR-0021"
                      value={form.sku}
                      onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Main Category</label>
                    <select
                      value={form.mainCategory}
                      onChange={(e) => {
                        const mainId = e.target.value;
                        // picking a new main category resets category to
                        // that main category by default; if it has
                        // subcategories the admin can then narrow it down
                        setForm((f) => ({ ...f, mainCategory: mainId, category: mainId }));
                      }}
                    >
                      <option value="">Select main category</option>
                      {mainCategories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Subcategory</label>
                    <select
                      value={subcategoriesForSelected.length > 0 ? form.category : ""}
                      disabled={subcategoriesForSelected.length === 0}
                      onChange={(e) => {
                        const subId = e.target.value;
                        // empty selection -> fall back to the main category itself
                        setForm((f) => ({ ...f, category: subId || f.mainCategory }));
                      }}
                    >
                      <option value="">
                        {subcategoriesForSelected.length > 0 ? `None — use ${mainCategoryName}` : "No subcategories"}
                      </option>
                      {subcategoriesForSelected.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-field admin-form-grid--full">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      placeholder="Describe the craftsmanship, heritage, and unique features…"
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                </div>
              </section>

              {/* ---- Product Specifications ---- */}
              <section className="admin-form-section">
                <div className="admin-form-section__header">
                  <IconSpec />
                  <span className="admin-form-section__title">Product Specifications</span>
                </div>
                <div className="admin-form-section__body admin-form-grid">
                  <div className="admin-field">
                    <label>Metal Type</label>
                    <select value={form.metalType} onChange={(e) => setForm((f) => ({ ...f, metalType: e.target.value }))}>
                      {METAL_TYPES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Purity</label>
                    <input
                      placeholder="e.g. 22K, 18K, 925 Sterling"
                      value={form.purity}
                      onChange={(e) => setForm((f) => ({ ...f, purity: e.target.value }))}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Metal Weight (g)</label>
                    <input
                      type="number" step="0.01"
                      value={form.weight}
                      onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Stone Type</label>
                    <select value={form.stoneType} onChange={(e) => setForm((f) => ({ ...f, stoneType: e.target.value }))}>
                      {STONE_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="admin-field admin-form-grid--full">
                    <label>Available Sizes</label>
                    <div className="admin-chip-row">
                      {[...new Set([...DEFAULT_SIZES, ...form.sizes])].map((size) => (
                        <button
                          type="button"
                          key={size}
                          className={`admin-chip ${form.sizes.includes(size) ? "is-selected" : ""}`}
                          onClick={() => toggleSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                      <button type="button" className="admin-chip-add" onClick={addCustomSize} aria-label="Add size">
                        <IconPlus />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* ---- Pricing & Valuation ---- */}
              <section className="admin-form-section">
                <div className="admin-form-section__header">
                  <IconPricing />
                  <span className="admin-form-section__title">Pricing &amp; Valuation</span>
                </div>
                <div className="admin-form-section__body admin-form-grid">
                  <div className="admin-field">
                    <label>Base Price (₹)</label>
                    <input
                      type="number"
                      value={form.basePrice}
                      onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Making Charges (₹)</label>
                    <input
                      type="number"
                      value={form.makingCharges}
                      onChange={(e) => setForm((f) => ({ ...f, makingCharges: e.target.value }))}
                    />
                  </div>
                  <div className="admin-field admin-form-grid--full">
                    <label>Discount (%)</label>
                    <input
                      type="number"
                      value={form.discount}
                      onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-grid--full admin-computed-banner">
                    <span className="admin-computed-banner__label">Estimated Retail Price</span>
                    <span className="admin-computed-banner__value">{currency(estimatedPrice)}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* ---- RIGHT COLUMN ---- */}
            <div className="admin-form-col">
              {/* ---- Product Media ---- */}
              <section className="admin-form-section">
                <div className="admin-form-section__header">
                  <IconMedia />
                  <span className="admin-form-section__title">Product Media</span>
                </div>
                <div className="admin-form-section__body">
                  <label className="admin-dropzone">
                    <IconUpload />
                    <span className="admin-dropzone__title">Primary Asset</span>
                    <span className="admin-dropzone__hint">Drag and drop or click to upload (up to 8 images)</span>
                    <input
                      type="file" accept="image/*" multiple
                      onChange={(e) => setForm((f) => ({ ...f, images: Array.from(e.target.files).slice(0, 8) }))}
                    />
                  </label>
                  {editingId && existingImages.length > 0 && (
                    <div className="admin-thumb-row">
                      {existingImages.map((url, i) => (
                        <div key={`existing-${i}`} className="admin-thumb">
                          <img src={url} alt={`existing-${i}`} />
                        </div>
                      ))}
                    </div>
                  )}
                  {form.images.length > 0 && (
                    <div className="admin-thumb-row">
                      {form.images.map((file, i) => (
                        <div key={i} className="admin-thumb">
                          <img src={URL.createObjectURL(file)} alt={`upload-${i}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* ---- Availability & Logistics ---- */}
              <section className="admin-form-section">
                <div className="admin-form-section__header">
                  <IconSpec />
                  <span className="admin-form-section__title">Availability &amp; Logistics</span>
                </div>
                <div className="admin-form-section__body admin-form-grid">
                  <div className="admin-field admin-form-grid--full">
                    <label>Stock Level</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    />
                  </div>
                  <div className="admin-form-grid--full admin-toggle-row">
                    <span className="admin-toggle-row__label">Live on Storefront</span>
                    <button
                      type="button"
                      className={`admin-toggle ${form.isActive ? "is-on" : ""}`}
                      onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                    >
                      <span className="admin-toggle__dot" />
                    </button>
                  </div>
                </div>
              </section>

              {/* ---- Marketing Flags ---- */}
              <section className="admin-form-section">
                <div className="admin-form-section__header">
                  <IconInfo />
                  <span className="admin-form-section__title">Marketing Flags</span>
                </div>
                <div className="admin-form-section__body">
                  <div className="admin-checkbox-list">
                    <label className="admin-checkbox-row">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                      />
                      Featured Product
                    </label>
                    <label className="admin-checkbox-row">
                      <input
                        type="checkbox"
                        checked={form.isBestseller}
                        onChange={(e) => setForm((f) => ({ ...f, isBestseller: e.target.checked }))}
                      />
                      Bestseller
                    </label>
                    <label className="admin-checkbox-row">
                      <input
                        type="checkbox"
                        checked={form.allowCustomEngraving}
                        onChange={(e) => setForm((f) => ({ ...f, allowCustomEngraving: e.target.checked }))}
                      />
                      Allow Custom Engraving
                    </label>
                    <label className="admin-checkbox-row">
                      <input
                        type="checkbox"
                        checked={form.isNewArrival}
                        onChange={(e) => setForm((f) => ({ ...f, isNewArrival: e.target.checked }))}
                      />
                      New Arrival
                    </label>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="admin-form-footer">
            <button type="button" className="admin-btn admin-btn-ghost" onClick={resetForm}>
              Discard
            </button>
            <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
              {saving ? "Saving…" : editingId ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      )}

      {!showForm && (
      <>
      <div className="admin-field" style={{ maxWidth: 320 }}>
        <input
          placeholder="Search by name / SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadProducts(1, search)}
        />
      </div>

      <div className="admin-card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Metal</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-8">Loading…</td></tr>
            ) : error ? (
              <tr><td colSpan={9} className="text-center py-8" style={{ color: "var(--admin-danger)" }}>{error}</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8">Kahi product sapadla nahi.</td></tr>
            ) : (
              products.map((p) => {
                const images = (p.images || []).map(imgUrl).filter(Boolean);
                return (
                  <tr key={p._id}>
                    <td>
                      <button
                        type="button"
                        className="admin-thumb-cell"
                        onClick={() => images.length && setLightbox({ title: p.name, images })}
                        disabled={!images.length}
                        title={images.length ? `View ${images.length} image(s)` : "No images uploaded"}
                      >
                        {images.length ? (
                          <img src={images[0]} alt={p.name} />
                        ) : (
                          <span className="admin-thumb-cell__placeholder"><IconNoImage /></span>
                        )}
                        {images.length > 1 && (
                          <span className="admin-thumb-cell__badge">+{images.length - 1}</span>
                        )}
                      </button>
                    </td>
                    <td className="font-medium">
                      {p.name}
                      {p.isFeatured && <span className="admin-badge admin-badge-warning ml-2">featured</span>}
                    </td>
                    <td className="text-sm" style={{ color: "var(--admin-text-muted)" }}>{p.sku}</td>
                    <td className="text-sm">{categoryBreadcrumb(p)}</td>
                    <td className="text-sm capitalize">{p.metalType}</td>
                    <td>{currency(p.finalPrice)}</td>
                    <td>
                      <button
                        className={`admin-badge ${p.stock <= 5 ? "admin-badge-danger" : "admin-badge-neutral"}`}
                        onClick={() => handleStockUpdate(p._id, p.stock)}
                        title="Click to update stock"
                      >
                        {p.stock}
                      </button>
                    </td>
                    <td>
                      <span className={`admin-badge ${p.isActive ? "admin-badge-success" : "admin-badge-neutral"}`}>
                        {p.isActive ? "active" : "inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-row">
                        <button
                          className="admin-icon-btn"
                          title="Edit product"
                          onClick={() => handleEditClick(p)}
                        >
                          <IconEdit />
                        </button>
                        <button
                          className={`admin-icon-btn ${p.isActive ? "" : "admin-icon-btn--active"}`}
                          title={p.isActive ? "Deactivate product" : "Activate product"}
                          onClick={() => handleToggleStatus(p)}
                        >
                          <IconPower />
                        </button>
                        <button
                          className={`admin-icon-btn ${p.isFeatured ? "admin-icon-btn--active" : ""}`}
                          title={p.isFeatured ? "Remove from featured" : "Mark as featured"}
                          onClick={() => handleToggleFeatured(p)}
                        >
                          <IconStar filled={p.isFeatured} />
                        </button>
                        <button
                          className="admin-icon-btn admin-icon-btn--danger"
                          title="Delete product"
                          onClick={() => handleDelete(p._id, p.name)}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {pagination.totalPages > 1 && (
          <div className="admin-pagination">
            <button
              className="admin-pagination__btn"
              disabled={pagination.page <= 1}
              onClick={() => loadProducts(pagination.page - 1)}
            >
              <IconChevronLeft />
              Previous
            </button>

            <div className="admin-pagination__info">
              Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
            </div>

            <button
              className="admin-pagination__btn"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadProducts(pagination.page + 1)}
            >
              Next
              <IconChevronRight />
            </button>
          </div>
        )}
      </div>
      </>
      )}

      {lightbox && (
        <div className="admin-lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="admin-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="admin-lightbox-close" onClick={() => setLightbox(null)} aria-label="Close">
              <IconX />
            </button>
            <div className="admin-lightbox-title">{lightbox.title}</div>
            {lightbox.images.length === 1 ? (
              <div className="admin-lightbox-single">
                <img src={lightbox.images[0]} alt={lightbox.title} />
              </div>
            ) : (
              <div className="admin-lightbox-grid">
                {lightbox.images.map((url, i) => (
                  <img key={i} src={url} alt={`${lightbox.title}-${i}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}