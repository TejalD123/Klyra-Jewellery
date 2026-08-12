import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { addAddress, editAddress, closeAddressForm, clearAddressError } from "../services/address.slice";
import "../style/addressForm.css";

const ADDRESS_TYPES = ["Home", "Office", "Other"];

const EMPTY_FORM = {
  fullName: "",
  phoneNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  addressType: "Home",
  isDefault: false,
};

const AddressForm = () => {
  const dispatch = useDispatch();
  const { isFormOpen, editingAddress, actionStatus, error } = useSelector((s) => s.address);

  const isEditMode = !!editingAddress;
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isFormOpen) {
      setForm(editingAddress ? { ...EMPTY_FORM, ...editingAddress } : EMPTY_FORM);
      setFieldErrors({});
      dispatch(clearAddressError());
    }
  }, [isFormOpen, editingAddress, dispatch]);

  useEffect(() => {
    document.body.style.overflow = isFormOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFormOpen]);

  if (!isFormOpen) return null;

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName?.trim() || form.fullName.trim().length < 2) errs.fullName = "Enter full name";
    if (!/^[6-9]\d{9}$/.test(form.phoneNumber || "")) errs.phoneNumber = "Enter valid 10-digit phone number";
    if (!form.addressLine1?.trim()) errs.addressLine1 = "Address line 1 is required";
    if (!form.city?.trim()) errs.city = "City is required";
    if (!form.state?.trim()) errs.state = "State is required";
    if (!/^[1-9][0-9]{5}$/.test(form.pincode || "")) errs.pincode = "Enter valid 6-digit pincode";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = { ...form };

    if (isEditMode) {
      await dispatch(editAddress({ id: editingAddress._id, payload }));
    } else {
      await dispatch(addAddress(payload));
    }
    // form.isFormOpen ko close karna slice ke fulfilled reducer mein already hota hai
  };

  const handleClose = () => dispatch(closeAddressForm());

  return (
    <div className="address-form-overlay">
      <div className="address-form-backdrop" onClick={handleClose} />

      <div className="address-form-panel">
        <div className="address-form__header">
          <h2 className="address-form__title">{isEditMode ? "Edit Address" : "Add New Address"}</h2>
          <button aria-label="Close" onClick={handleClose} className="address-form__close">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="address-form">
          <div className="address-form__row">
            <div className="address-form__field">
              <label>Full Name</label>
              <input value={form.fullName} onChange={handleChange("fullName")} placeholder="Recipient's full name" />
              {fieldErrors.fullName && <span className="address-form__error">{fieldErrors.fullName}</span>}
            </div>
            <div className="address-form__field">
              <label>Phone Number</label>
              <input value={form.phoneNumber} onChange={handleChange("phoneNumber")} placeholder="10-digit mobile number" maxLength={10} />
              {fieldErrors.phoneNumber && <span className="address-form__error">{fieldErrors.phoneNumber}</span>}
            </div>
          </div>

          <div className="address-form__field">
            <label>Address Line 1</label>
            <input value={form.addressLine1} onChange={handleChange("addressLine1")} placeholder="House no, building, street" />
            {fieldErrors.addressLine1 && <span className="address-form__error">{fieldErrors.addressLine1}</span>}
          </div>

          <div className="address-form__field">
            <label>Address Line 2 <span className="address-form__optional">(optional)</span></label>
            <input value={form.addressLine2} onChange={handleChange("addressLine2")} placeholder="Landmark, area" />
          </div>

          <div className="address-form__row">
            <div className="address-form__field">
              <label>City</label>
              <input value={form.city} onChange={handleChange("city")} placeholder="City" />
              {fieldErrors.city && <span className="address-form__error">{fieldErrors.city}</span>}
            </div>
            <div className="address-form__field">
              <label>State</label>
              <input value={form.state} onChange={handleChange("state")} placeholder="State" />
              {fieldErrors.state && <span className="address-form__error">{fieldErrors.state}</span>}
            </div>
          </div>

          <div className="address-form__row">
            <div className="address-form__field">
              <label>Pincode</label>
              <input value={form.pincode} onChange={handleChange("pincode")} placeholder="6-digit pincode" maxLength={6} />
              {fieldErrors.pincode && <span className="address-form__error">{fieldErrors.pincode}</span>}
            </div>
            <div className="address-form__field">
              <label>Country</label>
              <input value={form.country} onChange={handleChange("country")} disabled />
            </div>
          </div>

          <div className="address-form__field">
            <label>Address Type</label>
            <div className="address-form__type-options">
              {ADDRESS_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setForm((f) => ({ ...f, addressType: type }))}
                  className={`address-form__type-btn ${form.addressType === type ? "address-form__type-btn--active" : ""}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <label className="address-form__checkbox">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
            />
            Set as default address
          </label>

          {error && <p className="address-form__server-error">{error}</p>}

          <button type="submit" disabled={actionStatus === "loading"} className="address-form__submit">
            {actionStatus === "loading" ? "Saving..." : isEditMode ? "Save Changes" : "Add Address"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;