import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AuthMethodToggle from "./AuthMethodToggle";
import CustomPhoneInput from "./PhoneInput";
import { sendOtp, setAuthMethod, clearAuthError, googleAuth } from "../services/Auth.slice";
import "../styles/Auth.css";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z" />
    <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z" />
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
  </svg>
);

const SignupForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authMethod, status, error } = useSelector((s) => s.auth);

  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const isLoading = status === "sendingOtp";

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    // fullName ab sendOtp ko explicitly pass ho raha hai — isse backend
    // pending-registration record fullName ke saath bana sakta hai
    const result = await dispatch(
      sendOtp({ method: authMethod, identifier, fullName, mode: "registration" }),
    );

    if (sendOtp.fulfilled.match(result)) {
      navigate("/otp", {
        state: {
          mode: "registration",
          identifier,
          method: authMethod,
          extraDetails: { fullName },
        },
      });
    }
  };

 const handleGoogleSignup = async () => {
  const result = await dispatch(googleAuth());
  if (googleAuth.fulfilled.match(result)) {
    const role = result.payload?.user?.role;
    navigate(role === "admin" ? "/admin/dashboard" : "/", { replace: true });
  }
};

  return (
    <div>
      <h1 className="auth-title">Create Account</h1>
      <p className="auth-subtitle">Discover timeless elegance with Aurelian.</p>

      <form onSubmit={handleSubmit}>
        <AuthMethodToggle
          value={authMethod}
          onChange={(m) => {
            dispatch(setAuthMethod(m));
            setIdentifier("");
          }}
        />

        <div className="auth-field">
          <label className="auth-label">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
            className="auth-input"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">{authMethod === "email" ? "Email Address" : "Phone Number"}</label>
          {authMethod === "email" ? (
            <input
              type="email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="example@gmail.com"
              required
              className="auth-input"
            />
          ) : (
            <CustomPhoneInput value={identifier} onChange={setIdentifier} />
          )}
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={isLoading} className="auth-submit-btn">
          {isLoading ? "Creating…" : "Create Account"}
        </button>
      </form>

      {/* Firebase invisible reCAPTCHA mounts here for phone signup */}
      <div id="recaptcha-container" />

      <div className="auth-divider">
        <div className="auth-divider__line" />
        <span className="auth-divider__text">OR</span>
        <div className="auth-divider__line" />
      </div>

      <button type="button" onClick={handleGoogleSignup} className="auth-google-btn">
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="auth-footer-note">
        By signing up you agree to our <u>Terms of Service</u> and <u>Privacy Policy</u>
      </p>

      <p className="auth-footer-note auth-footer-note--tight">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </div>
  );
};

export default SignupForm;
