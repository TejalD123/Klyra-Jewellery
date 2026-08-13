import axiosInstance from "../../../api/apiClient";

// ===== Email OTP (backend generates + sends via Nodemailer) =====
// fullName ab yahan se backend ko jaata hai taaki registration ke liye
// pending-registration record fullName ke saath banaya ja sake.
export const sendEmailOTP = (email, purpose = "registration", fullName) =>
  axiosInstance.post("/otp/send-email", { email, purpose, fullName });

// ===== Final step (email flow): verifies the OTP AND issues the session
// (user + accessToken + refreshToken cookie) in a single backend call.
// Do NOT call this together with /otp/verify-email — that endpoint only
// marks the OTP as verified and does not issue a session, so calling it
// first would make this call fail with "OTP not found or already used".
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
