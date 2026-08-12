import axiosInstance from "../../../api/apiClient";

// ===== Email OTP (backend generates + sends via Nodemailer) =====
export const sendEmailOTP = (email, purpose = "registration") =>
  axiosInstance.post("/otp/send-email", { email, purpose });

export const verifyEmailOTP = (email, otpCode, purpose = "registration") =>
  axiosInstance.post("/otp/verify-email", { email, otpCode, purpose });

// ===== Final step: user record create/login karna backend ke MongoDB mein =====
export const completeRegistration = (payload) =>
  axiosInstance.post("/auth/register", payload);

export const completeLogin = (payload) =>
  axiosInstance.post("/auth/login", payload);

// ===== Page refresh pe session restore karne ke liye =====
export const refreshAccessToken = () =>
  axiosInstance.post("/auth/refresh-token");

// FIX: getCurrentUser ab accessToken accept karta hai aur explicitly
// Authorization header mein bhejta hai. Pehle ye interceptor pe depend
// karta tha (store.getState().auth.token), lekin bootstrapAuth ke andar
// is call ke waqt tak naya token store mein dispatch nahi hua hota —
// isliye request bina auth ke jaati thi, 401 aata tha, aur bootstrapAuth
// fail ho jaata tha even with a valid refresh session.
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