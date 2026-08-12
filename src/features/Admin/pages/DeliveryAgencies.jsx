import { useEffect, useState } from "react";
import { Truck, Plus, Pencil, Trash2, Power, X, Info, ImagePlus, Percent, IndianRupee } from "lucide-react";
import Topbar from "../components/TopBar";
import {
  fetchAllDeliveryAgencies,
  createDeliveryAgency,
  updateDeliveryAgency,
  toggleDeliveryAgencyStatus,
  deleteDeliveryAgency,
} from "../services/Deliveryagenciesservice";
import "../styles/admincard.css";
import "../styles/adminbutton.css";
import "../styles/admintable.css";
import "../styles/adminbadge.css";
import "../styles/admintableactions.css";
import "../styles/deliveryAgencyForm.css";

const emptyForm = {
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  defaultCharge: "", // pahile default 50 hota — ata khali, placeholder madhe "50" disel
  isActive: true,
  stateRates: [], // [{ state, charge }]
  logoFile: null,
  logoPreview: "", // existing logoUrl (edit) or objectURL of a newly picked file
};

export default function DeliveryAgencies() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  const load = () => {
    setLoading(true);
    fetchAllDeliveryAgencies()
      .then((res) => setAgencies(res.data.data || []))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (agency) => {
    setForm({
      name: agency.name,
      contactPerson: agency.contactPerson || "",
      phone: agency.phone || "",
      email: agency.email || "",
      defaultCharge: agency.defaultCharge,
      isActive: agency.isActive,
      stateRates: agency.stateRates || [],
      logoFile: null,
      logoPreview: agency.logoUrl || "",
    });
    setEditingId(agency._id);
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, logoFile: file, logoPreview: URL.createObjectURL(file) }));
  };

  const addStateRateRow = () => {
    setForm((f) => ({ ...f, stateRates: [...f.stateRates, { state: "", charge: 0 }] }));
  };

  const updateStateRateRow = (index, field, value) => {
    setForm((f) => {
      const rows = [...f.stateRates];
      rows[index] = { ...rows[index], [field]: field === "charge" ? Number(value) : value };
      return { ...f, stateRates: rows };
    });
  };

  const removeStateRateRow = (index) => {
    setForm((f) => ({ ...f, stateRates: f.stateRates.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim()) {
      setFormError("Agency naav required ahe");
      return;
    }
    if (form.defaultCharge === "" || Number(form.defaultCharge) < 0) {
      setFormError("Default charge valid ahe ka check kar");
      return;
    }
    const cleanedRates = form.stateRates.filter((r) => r.state.trim() !== "");

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        contactPerson: form.contactPerson,
        phone: form.phone,
        email: form.email,
        defaultCharge: Number(form.defaultCharge),
        isActive: form.isActive,
        stateRates: cleanedRates,
        logo: form.logoFile || undefined,
      };
      if (editingId) {
        await updateDeliveryAgency(editingId, payload);
        showToast("Agency updated");
      } else {
        await createDeliveryAgency(payload);
        showToast("Agency added");
      }
      closeForm();
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (agency) => {
    try {
      await toggleDeliveryAgencyStatus(agency._id);
      showToast(agency.isActive ? "Agency deactivated" : "Agency activated");
      load();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (agency) => {
    if (!window.confirm(`Delete "${agency.name}"? Ha undo hoणार nahi.`)) return;
    try {
      await deleteDeliveryAgency(agency._id);
      showToast("Agency deleted");
      load();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="ord-page">
      <Topbar
        title="Delivery Agencies"
        subtitle={showForm ? undefined : `${agencies.length} agencies configured`}
        actions={
          showForm ? (
            <button type="button" className="admin-btn admin-btn-ghost" onClick={closeForm}>
              Cancel
            </button>
          ) : (
            <button type="button" className="admin-btn admin-btn-primary" onClick={openCreateForm}>
              <Plus size={16} /> Add Agency
            </button>
          )
        }
      />

      {showForm ? (
        <form onSubmit={handleSubmit} className="da-layout">
          <div className="da-col da-col--main">
            <section className="da-panel">
              <div className="da-panel__header">
                <Info size={16} strokeWidth={2} />
                <h3>General Information</h3>
              </div>
              <div className="da-panel__body">
                <div className="da-field">
                  <label>Agency Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. BlueDart Express"
                  />
                </div>
                <div className="da-form-grid">
                  <div className="da-field">
                    <label>Contact Person</label>
                    <input
                      value={form.contactPerson}
                      onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="da-field">
                    <label>Phone</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="da-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </section>

            <section className="da-panel">
              <div className="da-panel__header">
                <Percent size={16} strokeWidth={2} />
                <h3>State-wise Rates</h3>
                <button type="button" className="da-panel__header-action" onClick={addStateRateRow}>
                  <Plus size={14} /> Add State
                </button>
              </div>
              <div className="da-panel__body">
                <p className="da-panel__hint">Override the default charge for specific states</p>

                {form.stateRates.length === 0 && (
                  <p className="da-rates-empty">
                    Kahi state-specific rate nahi — sagle orders sathi Default Charge lagू hoईल.
                  </p>
                )}

                {form.stateRates.map((row, i) => (
                  <div key={i} className="da-rate-row">
                    <input
                      placeholder="State (e.g. Maharashtra)"
                      value={row.state}
                      onChange={(e) => updateStateRateRow(i, "state", e.target.value)}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Charge (₹)"
                      value={row.charge}
                      onChange={(e) => updateStateRateRow(i, "charge", e.target.value.replace(/[^0-9]/g, ""))}
                    />
                    <button type="button" className="da-rate-remove" onClick={() => removeStateRateRow(i)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {formError && <p className="da-form-error">{formError}</p>}

            <div className="da-form-actions">
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save Changes" : "Create Agency"}
              </button>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={closeForm}>
                Cancel
              </button>
            </div>
          </div>

          <div className="da-col da-col--side">
            <section className="da-panel">
              <div className="da-panel__header">
                <ImagePlus size={16} strokeWidth={2} />
                <h3>Agency Logo</h3>
              </div>
              <div className="da-panel__body">
                <label className="da-logo-drop">
                  <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
                  {form.logoPreview ? (
                    <img src={form.logoPreview} alt="Agency logo" />
                  ) : (
                    <>
                      <ImagePlus size={22} strokeWidth={1.5} />
                      <span>Click to upload logo</span>
                    </>
                  )}
                </label>
              </div>
            </section>

            <section className="da-panel">
              <div className="da-panel__header">
                <IndianRupee size={16} strokeWidth={2} />
                <h3>Pricing &amp; Status</h3>
              </div>
              <div className="da-panel__body">
                <div className="da-field da-field--money">
                  <label>Default Charge *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.defaultCharge}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setForm((f) => ({ ...f, defaultCharge: val }));
                    }}
                    placeholder="e.g. 50"
                  />
                  <span className="da-field__hint">Applied when a state above isn't listed</span>
                </div>

                <div className="da-toggle-row">
                  <span>Active</span>
                  <button
                    type="button"
                    className={`admin-toggle ${form.isActive ? "is-on" : ""}`}
                    onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  />
                </div>
              </div>
            </section>
          </div>
        </form >
      ) : (
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Agency</th>
                <th>Contact</th>
                <th>Default Charge</th>
                <th>State Rates</th>
                <th>Status</th>
                <th aria-hidden="true"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}>Loading…</td></tr>
              ) : error ? (
                <tr><td colSpan={6} style={{ color: "var(--admin-danger)" }}>{error}</td></tr>
              ) : agencies.length === 0 ? (
                <tr><td colSpan={6}>Kahi delivery agency nahi ajun — "Add Agency" var click kar.</td></tr>
              ) : (
                agencies.map((agency) => (
                  <tr key={agency._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        {agency.logoUrl ? (
                          <img src={agency.logoUrl} alt="" className="da-table-logo" />
                        ) : (
                          <Truck size={16} strokeWidth={1.5} />
                        )}
                        <span style={{ fontWeight: 600 }}>{agency.name}</span>
                      </div>
                    </td>
                    <td>
                      <div>{agency.contactPerson || "—"}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                        {agency.phone || agency.email || ""}
                      </div>
                    </td>
                    <td>₹{agency.defaultCharge}</td>
                    <td>{agency.stateRates?.length || 0} states</td>
                    <td>
                      <span className={`admin-badge ${agency.isActive ? "admin-badge-success" : "admin-badge-neutral"}`}>
                        {agency.isActive ? "active" : "inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-row">
                        <button type="button" className="admin-icon-btn" onClick={() => openEditForm(agency)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className={`admin-icon-btn ${agency.isActive ? "" : "admin-icon-btn--active"}`}
                          onClick={() => handleToggle(agency)}
                          title={agency.isActive ? "Deactivate" : "Activate"}
                        >
                          <Power size={14} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn admin-icon-btn--danger"
                          onClick={() => handleDelete(agency)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )
      }

      {toast && <div className="admin-toast">{toast}</div>}
    </div >
  );
}