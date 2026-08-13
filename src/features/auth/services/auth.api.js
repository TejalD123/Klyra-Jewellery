import axiosInstance from "../../../api/apiClient";

// ===== Email OTP (backend generates + sends via Nodemailer) =====
// Backend ka /otp/send-email schema sirf { email, purpose } accept karta
// hai — "fullName" bhejne pe backend "\"fullName\" is not allowed" error
// deta hai (strict Joi/validator schema). fullName sirf verify step pe
// bhejna hai, send-email step pe nahi.
export const sendEmailOTP = (email, purpose = "registration") =>
  axiosInstance.post("/otp/send-email", { email, purpose });

// ===== Final step (email flow): verifies the OTP AND issues the session
// (user + accessToken + refreshToken cookie) in a single backend call.
// fullName yahan bhejna hai — is endpoint ne fullName ko reject nahi kiya,
// isliye backend ka verify-registration-otp schema ise accept karta hai.
export const verifyRegistrationOtp = (email, otp, fullName) =>
  axiosInstance.post("/auth/verify-registration-otp", { email, otp, fullName });

export const verifyLoginOtp = (email, otp) =>
  axiosInstance.post("/auth/verify-login-otp", { email, otp });

// ===== Final step (phone/Google flow): user record create/login karna
// backend ke MongoDB mein — Firebase idToken already verified hota hai
// client-side, backend sirf decode + session issue karta hai.
export const completeRegistration = (payload) =>
  axiosInstance.post("/auth/register", payload);
export const completeLogin = (payload) =>
  axiosInstance.post("/auth/login", payload);

// ===== Page refresh pe session restore karne ke liye =====
export const refreshAccessToken = () =>
  axiosInstance.post("/auth/refresh-token");

export const getCurrentUser = (accessToken) =>
  axiosInstance.get("/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const userAPI = {
  getMe: () => axiosInstance.get("/users/me").then((res) => res.data.data),
  updateMe: (payload) =>
    axiosInstance.patch("/users/me", payload).then((res) => res.data.data),
};

export default axiosInstance;
