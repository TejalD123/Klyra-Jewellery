import "../styles/Auth.css";

const AuthMethodToggle = ({ value, onChange }) => {
  const options = [
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
  ];

  return (
    <div className="auth-method-toggle">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`auth-method-toggle__btn ${value === opt.key ? "auth-method-toggle__btn--active" : ""}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default AuthMethodToggle;
