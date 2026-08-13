import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus, Pencil, Trash2, CheckCircle2, BadgeCheck, Mail, Phone, AtSign,ArrowLeft } from "lucide-react";
import { updateProfile, clearUserError } from "../services/user.slice";
import { fetchAddresses, openAddressForm, deleteAddress, setDefaultAddress } from "../../address/services/address.slice";
import "../styles/profilepage.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { status: userStatus, error: userError } = useSelector((s) => s.user);
  const { list: addresses, status: addressStatus } = useSelector((s) => s.address);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    setFullName(user?.fullName || "");
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    dispatch(clearUserError());
    const result = await dispatch(updateProfile({ fullName: fullName.trim() }));
    if (updateProfile.fulfilled.match(result)) setIsEditing(false);
  };

  const handleCancel = () => {
    setFullName(user?.fullName || "");
    setIsEditing(false);
    dispatch(clearUserError());
  };

  const displayName = user?.fullName || user?.username || "User";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="profile-page">
       <button type="button" onClick={() => navigate(-1)} className="profile-back-btn">
        <ArrowLeft size={16} strokeWidth={2} /> Back
      </button>
      {/* ---- Hero header ---- */}
      <section className="profile-hero">
        <div className="profile-hero__avatar">{displayName.charAt(0).toUpperCase()}</div>
        <div className="profile-hero__info">
          <h1 className="profile-hero__name">{displayName}</h1>
          <p className="profile-hero__meta">
            {user?.username && <span>@{user.username}</span>}
            {memberSince && <span>Member since {memberSince}</span>}
          </p>
        </div>
      </section>

      {/* ---- Personal Details ---- */}
      <section className="profile-card">
        <div className="profile-card__header">
          <h2 className="profile-card__title">Personal Details</h2>
          {!isEditing && (
            <button type="button" onClick={() => setIsEditing(true)} className="profile-card__add-btn">
              <Pencil size={14} /> Edit Name
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="profile-info-item__icon">
                <AtSign size={16} strokeWidth={1.75} />
              </span>
              <div className="profile-info-item__body">
                <span className="profile-info-item__label">Full Name</span>
                {isEditing ? (
                  <input
                    className="profile-info-item__input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    autoFocus
                  />
                ) : (
                  <span className="profile-info-item__value">{user?.fullName || "—"}</span>
                )}
              </div>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-item__icon">
                <AtSign size={16} strokeWidth={1.75} />
              </span>
              <div className="profile-info-item__body">
                <span className="profile-info-item__label">Username</span>
                <span className="profile-info-item__value">{user?.username || "—"}</span>
              </div>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-item__icon">
                <Mail size={16} strokeWidth={1.75} />
              </span>
              <div className="profile-info-item__body">
                <span className="profile-info-item__label">Email</span>
                <span className="profile-info-item__value">
                  {user?.email || "—"}
                  {user?.email && user?.isEmailVerified && (
                    <span className="profile-info-item__verified">
                      <BadgeCheck size={13} /> Verified
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-item__icon">
                <Phone size={16} strokeWidth={1.75} />
              </span>
              <div className="profile-info-item__body">
                <span className="profile-info-item__label">Phone Number</span>
                <span className="profile-info-item__value">
                  {user?.phone || "—"}
                  {user?.phone && user?.isPhoneVerified && (
                    <span className="profile-info-item__verified">
                      <BadgeCheck size={13} /> Verified
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {userError && <p className="profile-form__error">{userError}</p>}

          {isEditing && (
            <div className="profile-form__actions">
              <button type="submit" disabled={userStatus === "loading"} className="profile-form__save">
                {userStatus === "loading" ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={handleCancel} className="profile-form__cancel">
                Cancel
              </button>
            </div>
          )}
        </form>
      </section>

      {/* ---- Saved Addresses ---- */}
      <section className="profile-card">
        <div className="profile-card__header">
          <h2 className="profile-card__title">Saved Addresses</h2>
          <button onClick={() => dispatch(openAddressForm())} className="profile-card__add-btn">
            <Plus size={16} /> Add New
          </button>
        </div>

        {addressStatus === "loading" && addresses.length === 0 ? (
          <p className="profile-empty">Loading addresses...</p>
        ) : addresses.length === 0 ? (
          <div className="profile-empty">
            <MapPin size={32} strokeWidth={1} />
            <p>No saved addresses yet</p>
          </div>
        ) : (
          <div className="address-list">
            {addresses.map((addr) => (
              <div key={addr._id} className={`address-card ${addr.isDefault ? "address-card--default" : ""}`}>
                <div className="address-card__top">
                  <span className="address-card__type">{addr.addressType}</span>
                  {addr.isDefault && (
                    <span className="address-card__default">
                      <CheckCircle2 size={13} /> Default
                    </span>
                  )}
                </div>
                <p className="address-card__name">{addr.fullName}</p>
                <p className="address-card__text">
                  {addr.addressLine1}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}, {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="address-card__phone">Phone: {addr.phoneNumber}</p>

                <div className="address-card__actions">
                  <button onClick={() => dispatch(openAddressForm(addr))} className="address-card__action-btn">
                    <Pencil size={14} /> Edit
                  </button>
                  {!addr.isDefault && (
                    <button onClick={() => dispatch(setDefaultAddress(addr._id))} className="address-card__action-btn">
                      <CheckCircle2 size={14} /> Set Default
                    </button>
                  )}
                  <button
                    onClick={() => dispatch(deleteAddress(addr._id))}
                    className="address-card__action-btn address-card__action-btn--danger"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;