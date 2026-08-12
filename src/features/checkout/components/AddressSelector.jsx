import { MapPin, Plus, Check } from "lucide-react";
import "../styles/Checkout.css";

const AddressSelector = ({ addresses = [], selectedId, onSelect, onAddNew }) => {
  return (
    <div className="checkout-address-list">
      {addresses.map((addr) => (
        <button
          key={addr._id}
          type="button"
          className={`checkout-address-card ${selectedId === addr._id ? "is-selected" : ""}`}
          onClick={() => onSelect(addr._id)}
        >
          <div className="checkout-address-card__icon">
            <MapPin size={16} />
          </div>
          <div className="checkout-address-card__body">
            <p className="checkout-address-card__name">
              {addr.fullName}
              <span className="checkout-address-card__type">{addr.addressType}</span>
              {addr.isDefault && <span className="checkout-address-card__default">Default</span>}
            </p>
            <p className="checkout-address-card__line">
              {addr.addressLine1}
              {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
            </p>
            <p className="checkout-address-card__line">
              {addr.city}, {addr.state} - {addr.pincode}
            </p>
            <p className="checkout-address-card__phone">{addr.phoneNumber}</p>
          </div>
          {selectedId === addr._id && (
            <div className="checkout-address-card__check">
              <Check size={14} />
            </div>
          )}
        </button>
      ))}

      <button type="button" className="checkout-address-card checkout-address-card--add" onClick={onAddNew}>
        <div className="checkout-address-card__icon">
          <Plus size={16} />
        </div>
        <span>Add New Address</span>
      </button>
    </div>
  );
};

export default AddressSelector;