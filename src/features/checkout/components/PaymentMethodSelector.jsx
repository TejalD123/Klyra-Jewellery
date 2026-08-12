import { Banknote, CreditCard, Smartphone, Check } from "lucide-react";
import "../styles/Checkout.css";

const PAYMENT_METHODS = [
  { value: "cod", label: "Cash on Delivery", icon: Banknote },
  { value: "card", label: "Credit / Debit Card", icon: CreditCard },
  { value: "upi", label: "UPI", icon: Smartphone },
];

const PaymentMethodSelector = ({ value, onChange }) => {
  return (
    <div className="checkout-payment-grid">
      {PAYMENT_METHODS.map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          className={`checkout-payment-tile ${value === v ? "is-selected" : ""}`}
          onClick={() => onChange(v)}
        >
          <Icon size={20} />
          <span>{label}</span>
          {value === v && (
            <div className="checkout-payment-tile__check">
              <Check size={12} />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default PaymentMethodSelector;