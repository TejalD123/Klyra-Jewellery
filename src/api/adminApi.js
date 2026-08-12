import axios from "axios";

/**
 * ASSUMPTION: backend uses httpOnly JWT cookie set by /auth login/OTP flow
 * (matches Klyra's protect middleware pattern). If your setup instead sends
 * the token via Authorization header from localStorage, tell me and I'll
 * swap this for a request interceptor that attaches it.
 */
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Every Klyra controller responds with new ApiResponse(statusCode, data, message)
// so we unwrap `.data.data` here — pages just get the payload directly.
adminApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject({ ...error, message });
  }
);

export default adminApi;