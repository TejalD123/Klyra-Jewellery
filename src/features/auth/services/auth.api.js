import axiosInstance from "../../../api/apiClient";

export const sendEmailOTP = (email, purpose = "registration") =>
  axiosInstance.post("/otp/send-email", { email, purpose });

export const verifyRegistrationOtp = (email, otp) =>
  axiosInstance.post("/auth/verify-registration-otp", { email, otp });

export const verifyLoginOtp = (email, otp) =>
  axiosInstance.post("/auth/verify-login-otp", { email, otp });

export const completeRegistration = (payload) =>
  axiosInstance.post("/auth/register", payload);
export const completeLogin = (payload) =>
  axiosInstance.post("/auth/login", payload);

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
