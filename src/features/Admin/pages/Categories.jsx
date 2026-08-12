import { useEffect, useState } from "react";
import Topbar from "../components/TopBar";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
} from "../services/Categoryservice";

import "../styles/admincard.css";
import "../styles/adminbutton.css";
import "../styles/admintable.css";
import "../styles/adminbadge.css";
import "../styles/categoryform.css";
import "../styles/admintableactions.css";

const METAL_OPTIONS = ["18K Gold", "Platinum", "Sterling Silver", "Rose Gold"];

const slugify = (str = "") =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" strokeLinecap="round" />
  </svg>
);
const IconGem = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M6 3h12l3 5-9 13L3 8l3-5z" strokeLinejoin="round" />
    <path d="M3 8h18M8.5 3 12 8l3.5-5" strokeLinejoin="round" />
  </svg>
);
const IconImage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="M21 16l-5-5-4 4-3-3-5 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconLayers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3l9 5-9 5-9-5 9-5z" strokeLinejoin="round" />
    <path d="M3 13l9 5 9-5" strokeLinejoin="round" />
  </svg>
);
const IconUpload = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M12 16V4M8 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" strokeLinecap="round" strokeLinejoin="round" />
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
const IconNoImage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 16l4-4 4 4 6-6 4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconChevron = ({ expanded }) => (
  <svg
    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
    style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.15s ease" }}
  >
    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconMonitor = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M8 21h8M12 17v4" strokeLinecap="round" />
  </svg>
);

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  metalTypes: [],
  attributes: [{ name: "", value: "" }],
  image: null,
  poster: null,
  parentCategory: "",
  displayOrder: 0,
  isActive: true,
};

const emptyExistingImages = { image: "", poster: "" };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [customMetalInput, setCustomMetalInput] = useState("");

  // Current uploaded URLs (image/posterDesktop/posterMobile) for the
  // category being edited — used only to render preview thumbnails.
  const [existingImages, setExistingImages] = useState(emptyExistingImages);

  // Local object-URL previews for whatever file the user JUST picked in
  // this session (image / poster). This is what confirms "haa, ha image
  // add zala" before saving — separate from existingImages, which only
  // reflects what's already saved on the server.
  const [newPreviews, setNewPreviews] = useState({ image: "", poster: "" });

  useEffect(() => {
    const urls = {};
    ["image", "poster"].forEach((key) => {
      if (form[key]) urls[key] = URL.createObjectURL(form[key]);
    });
    setNewPreviews((prev) => ({ ...prev, ...urls }));
    return () => {
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.image, form.poster]);

  // Edit mode — only used by table Edit icon. Does not change form JSX/layout.
  const [editingId, setEditingId] = useState(null);

  // Table: which top-level category rows are expanded to show their
  // subcategories (accordion-style, so the table only lists main
  // categories by default instead of a flat mix of everything).
  const [expandedIds, setExpandedIds] = useState(new Set());
  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Table-only additions: lightbox for viewing the category image, and a
  // short-lived toast after an action (toggle/delete/save).
  const [lightboxImage, setLightboxImage] = useState(null);
  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(""), 2500);
  };

  const loadCategories = () => {
    setLoading(true);
    fetchCategories()
      .then((res) => setCategories(res.data.data.categories || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadCategories, []);

  const subcategoryCount = (categoryId) =>
    categories.filter((c) => {
      const parentId = c.parentCategory?._id || c.parentCategory;
      return String(parentId) === String(categoryId);
    }).length;

  const subcategoriesOf = (categoryId) =>
    categories.filter((c) => {
      const parentId = c.parentCategory?._id || c.parentCategory;
      return String(parentId) === String(categoryId);
    });

  const topLevelCategories = categories.filter((c) => !c.parentCategory);

  const handleNameChange = (value) => {
    setForm((f) => ({ ...f, name: value, slug: slugTouched ? f.slug : slugify(value) }));
  };

  const toggleMetal = (metal) => {
    setForm((f) => ({
      ...f,
      metalTypes: f.metalTypes.includes(metal)
        ? f.metalTypes.filter((m) => m !== metal)
        : [...f.metalTypes, metal],
    }));
  };

  // Custom metal types: anything the user types that isn't in the default
  // METAL_OPTIONS list. Stored the same way in form.metalTypes, just shown
  // as removable chips instead of checkboxes.
  const customMetalsInForm = form.metalTypes.filter((m) => !METAL_OPTIONS.includes(m));

  const addCustomMetal = () => {
    const value = customMetalInput.trim();
    if (!value) return;
    setForm((f) => {
      const alreadyExists = f.metalTypes.some(
        (m) => m.toLowerCase() === value.toLowerCase()
      );
      if (alreadyExists) return f;
      return { ...f, metalTypes: [...f.metalTypes, value] };
    });
    setCustomMetalInput("");
  };

  const handleCustomMetalKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomMetal();
    }
  };

  const removeCustomMetal = (metal) => {
    setForm((f) => ({ ...f, metalTypes: f.metalTypes.filter((m) => m !== metal) }));
  };

  const updateAttribute = (idx, key, value) => {
    setForm((f) => {
      const attrs = [...f.attributes];
      attrs[idx] = { ...attrs[idx], [key]: value };
      return { ...f, attributes: attrs };
    });
  };

  const addAttribute = () => {
    setForm((f) => ({ ...f, attributes: [...f.attributes, { name: "", value: "" }] }));
  };

  // Removes a single attribute row (used by the cross/delete button).
  // Keeps at least one row so the "Category Attributes" field never
  // collapses to nothing.
  const removeAttribute = (idx) => {
    setForm((f) => ({ ...f, attributes: f.attributes.filter((_, i) => i !== idx) }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setSlugTouched(false);
    setFormError("");
    setCustomMetalInput("");
    setExistingImages(emptyExistingImages);
    setNewPreviews({ image: "", poster: "" });
    setShowForm(false);
    setEditingId(null);
  };

  // Clears a just-picked (not-yet-saved) file for image/posterDesktop/posterMobile,
  // reverting that dropzone back to showing the existing saved image (if any).
  const clearNewFile = (key) => {
    setForm((f) => ({ ...f, [key]: null }));
    setNewPreviews((p) => ({ ...p, [key]: "" }));
  };

  // Table Edit icon -> pre-fill form state (no visual/layout change to the form itself)
  const handleEditClick = (cat) => {
    setForm({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      metalTypes: cat.metalTypes || [],
      attributes: cat.attributes?.length ? cat.attributes : [{ name: "", value: "" }],
      image: null,
      poster: null, // user only sets this if they want to REPLACE it
      parentCategory: cat.parentCategory?._id || cat.parentCategory || "",
      displayOrder: cat.displayOrder ?? 0,
      isActive: cat.isActive,
    });
    setExistingImages({
      image: cat.image || "",
      poster: cat.poster || "",
    });
    setSlugTouched(true);
    setEditingId(cat._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim()) {
      setFormError("Category name required ahe");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        parentCategory: form.parentCategory || null,
        metalTypes: form.metalTypes.map((m) => m.toLowerCase()),
        displayOrder: Number(form.displayOrder) || 0,
        isActive: form.isActive,
        image: form.image,
        poster: form.poster,
      };
      if (editingId) {
        await updateCategory(editingId, payload);
        showToast("Category updated");
      } else {
        await createCategory(payload);
        showToast("Category created");
      }
      resetForm();
      loadCategories();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    const cat = categories.find((c) => c._id === id);
    await toggleCategoryStatus(id);
    showToast(cat?.isActive ? "Category deactivated" : "Category activated");
    loadCategories();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" delete karायचi? Ha action undo hoत nahi.`)) return;
    try {
      await deleteCategory(id);
      showToast("Category deleted");
      loadCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 admin-page-full">
      <Topbar
        title="Categories"
        subtitle={showForm ? "New category" : `${topLevelCategories.length} main categories · ${categories.length} total`}
        actions={
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
          >
            {showForm ? "Cancel" : "+ Create Category"}
          </button>
        }
      />

      {showForm ? (
        <form onSubmit={handleSubmit} className="admin-form-container admin-form-container--wide">
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
                  <div className="admin-field">
                    <label>Category Name</label>
                    <input
                      placeholder="e.g. Engagement Rings"
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </div>
                  <div className="admin-field">
                    <label>URL Slug</label>
                    <input
                      className="is-slug"
                      placeholder="engagement-rings"
                      value={form.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
                      }}
                    />
                  </div>
                  <div className="admin-field admin-form-grid--full">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe the collection's focus and heritage…"
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                </div>
              </section>

              {/* ---- Luxury Attributes ---- */}
              <section className="admin-form-section">
                <div className="admin-form-section__header">
                  <IconGem />
                  <span className="admin-form-section__title">Luxury Attributes</span>
                </div>
                <div className="admin-form-section__body">
                  <div className="admin-field" style={{ marginBottom: "1.25rem" }}>
                    <label>Metal Types</label>
                    <div className="admin-form-grid">
                      {METAL_OPTIONS.map((metal) => (
                        <label
                          key={metal}
                          className={`admin-radio-card ${form.metalTypes.includes(metal) ? "is-selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={form.metalTypes.includes(metal)}
                            onChange={() => toggleMetal(metal)}
                          />
                          {metal}
                        </label>
                      ))}
                    </div>

                    {/* ---- Custom metal type add: one field box, same pattern
                         as "Category Attributes" below ---- */}
                    <div className="admin-field" style={{ marginTop: "1rem" }}>
                      <label>Custom Metal Type</label>
                      <input
                        type="text"
                        placeholder="e.g. Titanium, White Gold"
                        value={customMetalInput}
                        onChange={(e) => setCustomMetalInput(e.target.value)}
                        onKeyDown={handleCustomMetalKeyDown}
                      />
                    </div>
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost"
                      style={{ marginTop: "0.75rem" }}
                      onClick={addCustomMetal}
                    >
                      + Add Custom Metal
                    </button>

                    {customMetalsInForm.length > 0 && (
                      <div className="admin-metal-chip-row">
                        {customMetalsInForm.map((metal) => (
                          <span key={metal} className="admin-metal-chip">
                            {metal}
                            <button
                              type="button"
                              className="admin-metal-chip__remove"
                              onClick={() => removeCustomMetal(metal)}
                              aria-label={`Remove ${metal}`}
                            >
                              <IconX />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="admin-field">
                    <label>Category Attributes</label>
                    {form.attributes.map((attr, idx) => (
                      <div key={idx} className="admin-attr-row">
                        <input
                          className="admin-attr-row__input"
                          placeholder="Attribute Name (e.g. Carat Fit)"
                          value={attr.name}
                          onChange={(e) => updateAttribute(idx, "name", e.target.value)}
                        />
                        <input
                          className="admin-attr-row__input"
                          placeholder="Default Value"
                          value={attr.value}
                          onChange={(e) => updateAttribute(idx, "value", e.target.value)}
                        />
                        {form.attributes.length > 1 && (
                          <button
                            type="button"
                            className="admin-attr-row__remove"
                            onClick={() => removeAttribute(idx)}
                            aria-label="Remove attribute"
                          >
                            <IconX />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="admin-btn admin-btn-ghost" onClick={addAttribute}>
                      + Add Another Attribute
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* ---- RIGHT COLUMN ---- */}
            <div className="admin-form-col">
              {/* ---- Hero Image (card/thumbnail) — kept exactly as-is ---- */}
              <section className="admin-form-section">
                <div className="admin-form-section__header">
                  <IconImage />
                  <span className="admin-form-section__title">Hero Image</span>
                </div>
                <div className="admin-form-section__body">
                  {form.image && newPreviews.image ? (
                    <div className="admin-poster-preview admin-poster-preview--new">
                      <img src={newPreviews.image} alt="Selected preview" />
                      <div className="admin-poster-preview__row">
                        <span className="admin-poster-preview__label admin-poster-preview__label--new">
                          ✓ {form.image.name}
                        </span>
                        <button
                          type="button"
                          className="admin-poster-preview__clear"
                          onClick={() => clearNewFile("image")}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : existingImages.image ? (
                    <div className="admin-poster-preview">
                      <img src={existingImages.image} alt="Current" />
                      <span className="admin-poster-preview__label">Current image — upload new to replace</span>
                    </div>
                  ) : null}
                  <label className="admin-dropzone">
                    <IconUpload />
                    <span className="admin-dropzone__title">Drag &amp; drop or click</span>
                    <span className="admin-dropzone__hint">PNG, JPG up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm((f) => ({ ...f, image: e.target.files[0] || null }))}
                    />
                  </label>
                </div>
              </section>

              {/* ---- Category Poster (single banner image, reused for
                   both desktop and mobile) — one clean upload card ---- */}
              <section className="admin-form-section">
                <div className="admin-form-section__header">
                  <IconMonitor />
                  <span className="admin-form-section__title">Category Poster (Banner)</span>
                </div>
                <div className="admin-form-section__body">
                  <div className="admin-poster-field admin-poster-field--single">
                    <label>Poster Image</label>
                    <p className="admin-poster-field__hint">Used as the banner on both desktop and mobile.</p>

                    {form.poster && newPreviews.poster ? (
                      <div className="admin-poster-preview admin-poster-preview--new">
                        <img src={newPreviews.poster} alt="Selected poster preview" />
                        <div className="admin-poster-preview__row">
                          <span className="admin-poster-preview__label admin-poster-preview__label--new">
                            ✓ {form.poster.name}
                          </span>
                          <button
                            type="button"
                            className="admin-poster-preview__clear"
                            onClick={() => clearNewFile("poster")}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : existingImages.poster ? (
                      <div className="admin-poster-preview">
                        <img src={existingImages.poster} alt="Current poster" />
                        <span className="admin-poster-preview__label">Current — upload new to replace</span>
                      </div>
                    ) : null}

                    <label className="admin-dropzone admin-dropzone--compact">
                      <IconUpload />
                      <span className="admin-dropzone__title">Drag &amp; drop or click</span>
                      <span className="admin-dropzone__hint">Wide image, e.g. 1920×600</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setForm((f) => ({ ...f, poster: e.target.files[0] || null }))}
                      />
                    </label>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* ---- Hierarchy & Status — full-width section below both
               columns, fields sit compactly side-by-side in one row ---- */}
          <section className="admin-form-section admin-form-section--full">
            <div className="admin-form-section__header">
              <IconLayers />
              <span className="admin-form-section__title">Hierarchy &amp; Status</span>
            </div>
            <div className="admin-form-section__body admin-hierarchy-row">
              <div className="admin-field">
                <label>Parent Category</label>
                <select
                  value={form.parentCategory}
                  onChange={(e) => setForm((f) => ({ ...f, parentCategory: e.target.value }))}
                >
                  <option value="">None (Root Category)</option>
                  {topLevelCategories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label>Display Order</label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
                />
              </div>
              <div className="admin-toggle-row">
                <div>
                  <p className="admin-toggle-row__label">Is Active</p>
                  <p className="admin-toggle-row__hint">Visible on storefront</p>
                </div>
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

          <div className="admin-form-footer">
            <button type="button" className="admin-btn admin-btn-ghost" onClick={resetForm}>
              Discard Changes
            </button>
            <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
              {saving ? "Saving…" : editingId ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      ) : (
        <div className="admin-card">
          <div className="admin-table-scroll">
            <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "2.5rem" }}></th>
                <th>Image</th>
                <th>Name</th>
                <th>Subcategories</th>
                <th>Metal Types</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">Loading…</td></tr>
              ) : error ? (
                <tr><td colSpan={7} className="text-center py-8" style={{ color: "var(--admin-danger)" }}>{error}</td></tr>
              ) : topLevelCategories.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8">Ajun kahi category nahi. Vartun create kar.</td></tr>
              ) : (
                topLevelCategories.map((cat) => {
                  const subs = subcategoriesOf(cat._id);
                  const isExpanded = expandedIds.has(cat._id);
                  return (
                    <>
                      {/* ---- Main category row ---- */}
                      <tr key={cat._id}>
                        <td>
                          {subs.length > 0 && (
                            <button
                              type="button"
                              className="admin-icon-btn"
                              onClick={() => toggleExpanded(cat._id)}
                              title={isExpanded ? "Collapse subcategories" : "Show subcategories"}
                            >
                              <IconChevron expanded={isExpanded} />
                            </button>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-thumb-cell"
                            onClick={() => cat.image && setLightboxImage({ title: cat.name, images: [cat.image] })}
                            disabled={!cat.image}
                            title={cat.image ? "View image" : "No image uploaded"}
                          >
                            {cat.image ? (
                              <img src={cat.image} alt={cat.name} />
                            ) : (
                              <span className="admin-thumb-cell__placeholder"><IconNoImage /></span>
                            )}
                          </button>
                        </td>
                        <td className="font-medium">{cat.name}</td>
                        <td>
                          <button
                            type="button"
                            className="admin-badge admin-badge-info"
                            style={{ cursor: subs.length > 0 ? "pointer" : "default", border: "none" }}
                            onClick={() => subs.length > 0 && toggleExpanded(cat._id)}
                          >
                            {subs.length}
                          </button>
                        </td>
                        <td className="text-sm" style={{ color: "var(--admin-text-muted)" }}>
                          {cat.metalTypes?.join(", ") || "—"}
                        </td>
                        <td>
                          <span className={`admin-badge ${cat.isActive ? "admin-badge-success" : "admin-badge-neutral"}`}>
                            {cat.isActive ? "active" : "inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="admin-action-row">
                            <button
                              className="admin-icon-btn"
                              title="Edit category"
                              onClick={() => handleEditClick(cat)}
                            >
                              <IconEdit />
                            </button>
                            <button
                              className={`admin-icon-btn ${cat.isActive ? "" : "admin-icon-btn--active"}`}
                              title={cat.isActive ? "Deactivate category" : "Activate category"}
                              onClick={() => handleToggle(cat._id)}
                            >
                              <IconPower />
                            </button>
                            <button
                              className="admin-icon-btn admin-icon-btn--danger"
                              title="Delete category"
                              onClick={() => handleDelete(cat._id, cat.name)}
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ---- Subcategory rows (only rendered when expanded) ---- */}
                      {isExpanded && subs.map((sub) => (
                        <tr key={sub._id} className="admin-table-subrow">
                          <td></td>
                          <td>
                            <button
                              type="button"
                              className="admin-thumb-cell"
                              onClick={() => sub.image && setLightboxImage({ title: sub.name, images: [sub.image] })}
                              disabled={!sub.image}
                              title={sub.image ? "View image" : "No image uploaded"}
                            >
                              {sub.image ? (
                                <img src={sub.image} alt={sub.name} />
                              ) : (
                                <span className="admin-thumb-cell__placeholder"><IconNoImage /></span>
                              )}
                            </button>
                          </td>
                          <td style={{ paddingLeft: "1.5rem", color: "var(--admin-text-muted)" }}>
                            {sub.name}
                          </td>
                          <td>
                            <span className="admin-badge admin-badge-neutral">—</span>
                          </td>
                          <td className="text-sm" style={{ color: "var(--admin-text-muted)" }}>
                            {sub.metalTypes?.join(", ") || "—"}
                          </td>
                          <td>
                            <span className={`admin-badge ${sub.isActive ? "admin-badge-success" : "admin-badge-neutral"}`}>
                              {sub.isActive ? "active" : "inactive"}
                            </span>
                          </td>
                          <td>
                            <div className="admin-action-row">
                              <button
                                className="admin-icon-btn"
                                title="Edit subcategory"
                                onClick={() => handleEditClick(sub)}
                              >
                                <IconEdit />
                              </button>
                              <button
                                className={`admin-icon-btn ${sub.isActive ? "" : "admin-icon-btn--active"}`}
                                title={sub.isActive ? "Deactivate subcategory" : "Activate subcategory"}
                                onClick={() => handleToggle(sub._id)}
                              >
                                <IconPower />
                              </button>
                              <button
                                className="admin-icon-btn admin-icon-btn--danger"
                                title="Delete subcategory"
                                onClick={() => handleDelete(sub._id, sub.name)}
                              >
                                <IconTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {lightboxImage && (
        <div className="admin-lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <div className="admin-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="admin-lightbox-close" onClick={() => setLightboxImage(null)} aria-label="Close">
              <IconX />
            </button>
            <div className="admin-lightbox-title">{lightboxImage.title}</div>
            <div className="admin-lightbox-single">
              <img src={lightboxImage.images[0]} alt={lightboxImage.title} />
            </div>
          </div>
        </div>
      )}

      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}