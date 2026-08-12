import { useEffect, useState } from "react";
import Topbar from "../components/TopBar";
import {
  fetchBanners,
  createBanner,
  updateBanner,
  toggleBannerStatus,
  deleteBanner,
} from "../services/Bannerservice";

import "../styles/admincard.css";
import "../styles/adminbutton.css";
import "../styles/admintable.css";
import "../styles/adminbadge.css";
import "../styles/admintableactions.css";

const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" strokeLinecap="round" />
  </svg>
);
const IconUpload = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M12 16V4M8 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" strokeLinecap="round" strokeLinejoin="round" />
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

const emptyForm = {
  type: "hero",
  title: "",
  subtitle: "",
  ctaText: "Shop Now",
  ctaLink: "/collections",
  backgroundColor: "#311120",
  textColor: "#FBF3EC",
  buttonColor: "#C9A067",
  displayOrder: 0,
  startDate: "",
  endDate: "",
  isActive: true,
  image: null,
};

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all"); // all | hero | sale

  const [lightboxImage, setLightboxImage] = useState(null);
  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(""), 2500);
  };

  const loadBanners = async () => {
    setLoading(true);
    setError("");
    try {
      const params = typeFilter !== "all" ? { type: typeFilter } : {};
      const res = await fetchBanners(params);
      setBanners(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Banners load karta yeta nahi ale");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const resetForm = () => {
    setForm(emptyForm);
    setFormError("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (banner) => {
    setForm({
      type: banner.type,
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      ctaText: banner.ctaText || "Shop Now",
      ctaLink: banner.ctaLink || "/collections",
      backgroundColor: banner.backgroundColor || "#311120",
      textColor: banner.textColor || "#FBF3EC",
      buttonColor: banner.buttonColor || "#C9A067",
      displayOrder: banner.displayOrder ?? 0,
      startDate: toDateInput(banner.startDate),
      endDate: toDateInput(banner.endDate),
      isActive: banner.isActive,
      image: null,
    });
    setEditingId(banner._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim()) {
      setFormError("Banner title required ahe");
      return;
    }
    if (form.type === "hero" && !form.image && !editingId) {
      setFormError("Hero banner sathi image required ahe");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, displayOrder: Number(form.displayOrder) || 0 };
      if (editingId) {
        await updateBanner(editingId, payload);
        showToast("Banner updated");
      } else {
        await createBanner(payload);
        showToast("Banner created");
      }
      resetForm();
      loadBanners();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    const banner = banners.find((b) => b._id === id);
    try {
      await toggleBannerStatus(id);
      showToast(banner?.isActive ? "Banner deactivated" : "Banner activated");
      loadBanners();
    } catch (err) {
      alert(err.response?.data?.message || "Toggle fail zhala");
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`"${title}" delete karायचi? Ha action undo hoत nahi.`)) return;
    try {
      await deleteBanner(id);
      showToast("Banner deleted");
      loadBanners();
    } catch (err) {
      alert(err.response?.data?.message || "Delete fail zhala");
    }
  };

  return (
    <div className="space-y-6 admin-page-full">
      <Topbar
        title="Banners"
        subtitle={showForm ? (editingId ? "Edit banner" : "New banner") : `${banners.length} banners`}
        actions={
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
          >
            {showForm ? "Cancel" : "+ Create Banner"}
          </button>
        }
      />

      {showForm ? (
        <form onSubmit={handleSubmit} className="admin-form-container admin-form-container--wide">
          {formError && <div className="admin-form-error">{formError}</div>}

          <div className="admin-form-columns">
            {/* ---- LEFT COLUMN ---- */}
            <div className="admin-form-col">
              <section className="admin-form-section">
                <div className="admin-form-section__header">
                  <IconInfo />
                  <span className="admin-form-section__title">Banner Details</span>
                </div>
                <div className="admin-form-section__body">
                  <div className="admin-form-grid--full" style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
                    {["hero", "sale"].map((t) => (
                      <label
                        key={t}
                        className={`admin-radio-card ${form.type === t ? "is-selected" : ""}`}
                        style={{ flex: 1, cursor: "pointer" }}
                      >
                        <input
                          type="radio"
                          name="bannerType"
                          checked={form.type === t}
                          onChange={() => setForm((f) => ({ ...f, type: t }))}
                        />
                        {t === "hero" ? "Hero Banner (homepage top)" : "Sale Strip (promo banner)"}
                      </label>
                    ))}
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-field admin-form-grid--full">
                      <label>Title</label>
                      <input
                        placeholder="e.g. Timeless Elegance, Redefined"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      />
                    </div>
                    <div className="admin-field admin-form-grid--full">
                      <label>Subtitle</label>
                      <input
                        placeholder="e.g. Explore our new festive collection"
                        value={form.subtitle}
                        onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                      />
                    </div>
                    <div className="admin-field">
                      <label>CTA Text</label>
                      <input
                        value={form.ctaText}
                        onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))}
                      />
                    </div>
                    <div className="admin-field">
                      <label>CTA Link</label>
                      <input
                        placeholder="/collections"
                        value={form.ctaLink}
                        onChange={(e) => setForm((f) => ({ ...f, ctaLink: e.target.value }))}
                      />
                    </div>
                    <div className="admin-field">
                      <label>Background Color</label>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input
                          type="color"
                          value={form.backgroundColor}
                          onChange={(e) => setForm((f) => ({ ...f, backgroundColor: e.target.value }))}
                          style={{ width: "2.5rem", height: "2.25rem", padding: 0, border: "1px solid var(--admin-border)", borderRadius: "6px", cursor: "pointer" }}
                        />
                        <input
                          value={form.backgroundColor}
                          onChange={(e) => setForm((f) => ({ ...f, backgroundColor: e.target.value }))}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                    <div className="admin-field">
                      <label>Text Color</label>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input
                          type="color"
                          value={form.textColor}
                          onChange={(e) => setForm((f) => ({ ...f, textColor: e.target.value }))}
                          style={{ width: "2.5rem", height: "2.25rem", padding: 0, border: "1px solid var(--admin-border)", borderRadius: "6px", cursor: "pointer" }}
                        />
                        <input
                          value={form.textColor}
                          onChange={(e) => setForm((f) => ({ ...f, textColor: e.target.value }))}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                    <div className="admin-field">
                      <label>Button Color</label>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input
                          type="color"
                          value={form.buttonColor}
                          onChange={(e) => setForm((f) => ({ ...f, buttonColor: e.target.value }))}
                          style={{ width: "2.5rem", height: "2.25rem", padding: 0, border: "1px solid var(--admin-border)", borderRadius: "6px", cursor: "pointer" }}
                        />
                        <input
                          value={form.buttonColor}
                          onChange={(e) => setForm((f) => ({ ...f, buttonColor: e.target.value }))}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                    <div className="admin-field">
                      <label>Display Order</label>
                      <input
                        type="number"
                        value={form.displayOrder}
                        onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="admin-form-section">
                <div className="admin-form-section__header">
                  <IconInfo />
                  <span className="admin-form-section__title">Scheduling (optional)</span>
                </div>
                <div className="admin-form-section__body admin-form-grid">
                  <div className="admin-field">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="admin-field">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
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
            </div>

            {/* ---- RIGHT COLUMN ---- */}
            <div className="admin-form-col">
              <section className="admin-form-section">
                <div className="admin-form-section__header">
                  <IconUpload />
                  <span className="admin-form-section__title">
                    Banner Image {form.type === "sale" && <span style={{ fontWeight: 400 }}>(optional for sale strip)</span>}
                  </span>
                </div>
                <div className="admin-form-section__body">
                  <label className="admin-dropzone">
                    <IconUpload />
                    <span className="admin-dropzone__title">Upload Banner Image</span>
                    <span className="admin-dropzone__hint">Recommended: 1920×800px, JPG/PNG</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm((f) => ({ ...f, image: e.target.files[0] || null }))}
                    />
                  </label>
                  {form.image && (
                    <div className="admin-thumb-row">
                      <div className="admin-thumb">
                        <img src={URL.createObjectURL(form.image)} alt="preview" />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          <div className="admin-form-footer">
            <button type="button" className="admin-btn admin-btn-ghost" onClick={resetForm}>
              Discard Changes
            </button>
            <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
              {saving ? "Saving…" : editingId ? "Update Banner" : "Create Banner"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
            {["all", "hero", "sale"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`admin-badge ${typeFilter === t ? "admin-badge-info" : "admin-badge-neutral"}`}
                style={{ cursor: "pointer", border: "none", textTransform: "capitalize" }}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="admin-card overflow-hidden">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Order</th>
                  <th>Validity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8">Loading…</td></tr>
                ) : error ? (
                  <tr><td colSpan={7} className="text-center py-8" style={{ color: "var(--admin-danger)" }}>{error}</td></tr>
                ) : banners.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8">Ajun kahi banner nahi. Vartun create kar.</td></tr>
                ) : (
                  banners.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <button
                          type="button"
                          className="admin-thumb-cell"
                          onClick={() => b.image && setLightboxImage({ title: b.title, images: [b.image] })}
                          disabled={!b.image}
                          title={b.image ? "View image" : "No image uploaded"}
                        >
                          {b.image ? (
                            <img src={b.image} alt={b.title} />
                          ) : (
                            <span className="admin-thumb-cell__placeholder"><IconNoImage /></span>
                          )}
                        </button>
                      </td>
                      <td>
                        <span className={`admin-badge ${b.type === "hero" ? "admin-badge-info" : "admin-badge-neutral"}`}>
                          {b.type}
                        </span>
                      </td>
                      <td className="font-medium">{b.title}</td>
                      <td className="text-sm" style={{ color: "var(--admin-text-muted)" }}>{b.displayOrder}</td>
                      <td className="text-sm" style={{ color: "var(--admin-text-muted)" }}>
                        {b.startDate || b.endDate
                          ? `${b.startDate ? toDateInput(b.startDate) : "—"} → ${b.endDate ? toDateInput(b.endDate) : "—"}`
                          : "Always"}
                      </td>
                      <td>
                        <span className={`admin-badge ${b.isActive ? "admin-badge-success" : "admin-badge-neutral"}`}>
                          {b.isActive ? "active" : "inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-action-row">
                          <button className="admin-icon-btn" title="Edit banner" onClick={() => handleEditClick(b)}>
                            <IconEdit />
                          </button>
                          <button
                            className={`admin-icon-btn ${b.isActive ? "" : "admin-icon-btn--active"}`}
                            title={b.isActive ? "Deactivate banner" : "Activate banner"}
                            onClick={() => handleToggle(b._id)}
                          >
                            <IconPower />
                          </button>
                          <button
                            className="admin-icon-btn admin-icon-btn--danger"
                            title="Delete banner"
                            onClick={() => handleDelete(b._id, b.title)}
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {lightboxImage && (
        <div className="admin-lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <div className="admin-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="admin-lightbox-close" onClick={() => setLightboxImage(null)} aria-label="Close">✕</button>
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