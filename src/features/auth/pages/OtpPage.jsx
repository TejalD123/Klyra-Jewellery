import { useEffect, useRef, useState } from "react";
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
  const from = state?.from;

  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const isVerifying = status === "verifying";

  // status Redux se async aata hai (dispatch ke ek tick baad), isliye agar
  // onComplete do baar ek hi tick mein fire ho jaaye to isVerifying dono
  // baar false hi milega. Ref synchronous hai — isliye duplicate submit
  // ko turant rokta hai, chahe status abhi tak update na hua ho.
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleComplete = async (code) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    dispatch(clearAuthError());
    const result = await dispatch(verifyOtp({ method, identifier, otpCode: code, extraDetails, mode }));

    if (verifyOtp.fulfilled.match(result)) {
      const role = result.payload?.user?.role;
      const redirectTo = role === "admin" ? "/admin/dashboard" : from || "/";
      navigate(redirectTo, { replace: true });
    } else {
      // galat OTP ho sakta hai — user ko dobara try karne dena hai
      hasSubmittedRef.current = false;
    }
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    if (method === "phone") {
      sendPhoneOTP(identifier);
    } else {
      dispatch(sendOtp({ method, identifier, fullName: extraDetails?.fullName, mode }));
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
