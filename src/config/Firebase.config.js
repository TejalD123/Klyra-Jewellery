import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Recaptcha aur confirmationResult ko module-level variable mein rakha hai —
// Redux store mein nahi (Firebase objects serializable nahi hote, Redux warning dega)
let recaptchaVerifier = null;
let activeConfirmationResult = null;

const getRecaptcha = () => {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
  }
  return recaptchaVerifier;
};

// Phone number pe OTP bhejna — number "+91XXXXXXXXXX" format mein hona chahiye
export const sendPhoneOTP = async (phoneNumber) => {
  const formatted = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;
  const verifier = getRecaptcha();
  activeConfirmationResult = await signInWithPhoneNumber(auth, formatted, verifier);
  return true;
};

// User ne jo 6-digit code daala, use verify karna
export const verifyPhoneOTP = async (otpCode) => {
  if (!activeConfirmationResult) {
    throw new Error("OTP session expired. Please request a new code.");
  }
  const result = await activeConfirmationResult.confirm(otpCode);
  const idToken = await result.user.getIdToken();
  return idToken; // yeh token backend ko bhejenge verify karne ke liye
};

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return {
    idToken,
    email: result.user.email,
    fullName: result.user.displayName,
  };
};