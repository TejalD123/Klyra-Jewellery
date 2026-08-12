import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AuthLayout from "../../../layout/AuthLayout";
import OTPInput from "../components/OtpInput";
import { verifyOtp, sendOtp, clearAuthError } from "../services/Auth.slice";
import { sendPhoneOTP } from "../../../config/Firebase.config";
import "../styles/Auth.css";

const RESEND_SECONDS = 30;

const maskIdentifier = (value = "", method) => {
  if (!value) return "";
  if (method === "email") {
    const [name, domain] = value.split("@");
    if (!domain) return value;
    const visible = name.slice(0, 2);
    return `${visible}${"*".repeat(Math.max(name.length - 2, 1))}@${domain}`;
  }
  return value.replace(/\d(?=\d{2})/g, "*");
};

const OtpPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { status, error } = useSelector((s) => s.auth);

  const mode = state?.mode ?? "login";
  const identifier = state?.identifier ?? "";
  const method = state?.method ?? "email";
  const extraDetails = state?.extraDetails ?? {};
  // LoginForm se relay hoke aayega — agar LoginForm abhi "from" pass nahi kar
  // raha to yeh hamesha undefined rahega aur neeche "/" pe fallback hoga
  const from = state?.from;

  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const isVerifying = status === "verifying";

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleComplete = async (code) => {
    dispatch(clearAuthError());
    const result = await dispatch(verifyOtp({ method, identifier, otpCode: code, extraDetails, mode }));

    if (verifyOtp.fulfilled.match(result)) {
      const role = result.payload?.user?.role;
      // admin hamesha admin dashboard pe; normal user "from" pe (agar tha)
      // warna home pe
      const redirectTo = role === "admin" ? "/admin/dashboard" : from || "/";
      navigate(redirectTo, { replace: true });
    }
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    if (method === "phone") {
      sendPhoneOTP(identifier);
    } else {
      dispatch(sendOtp({ method, identifier }));
    }
    setSecondsLeft(RESEND_SECONDS);
  };

  return (
    <AuthLayout>
      <div className="otp-wrap">
        <h1 className="auth-title" style={{ fontSize: "1.5rem" }}>
          Verify Your Identity
        </h1>
        <p className="auth-subtitle">
          Enter the 6-digit code sent to <span className="otp-highlight">{maskIdentifier(identifier, method)}</span>
        </p>

        <OTPInput length={6} onComplete={handleComplete} disabled={isVerifying} />

        {error && <p className="auth-error" style={{ marginTop: "1rem" }}>{error}</p>}

        <button type="button" onClick={handleResend} disabled={secondsLeft > 0} className="otp-resend">
          {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend Code"}
        </button>

        <div id="recaptcha-container" />
      </div>
    </AuthLayout>
  );
};

export default OtpPage;