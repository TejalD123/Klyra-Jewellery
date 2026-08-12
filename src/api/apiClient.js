import axios from "axios";
import { store } from "../app/store";
import { logout, setToken } from "../features/auth/services/Auth.slice";
import * as authAPI from "../features/auth/services/auth.api"; // adjust path if different

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// In requests ke 401 par forced redirect NAHI chahiye — yeh silent bootstrap
// checks hain, inka fail hona normal hai (naya user / expired session)
const SILENT_AUTH_PATHS = ["/auth/refresh-token", "/users/me"];

// While a refresh is in-flight, queue up any other requests that also hit
// a 401 in the meantime instead of firing multiple parallel refresh calls
// (e.g. a page that fires several API calls at once, all with an expired
// token — without this they'd each independently try to refresh).
let isRefreshing = false;
let pendingQueue = [];

const resolvePendingQueue = (newToken, err) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (err) reject(err);
    else resolve(newToken);
  });
  pendingQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isSilentAuthCall = SILENT_AUTH_PATHS.some((path) =>
      originalRequest?.url?.includes(path)
    );

    // Only attempt a silent refresh-and-retry for a real "access token
    // expired mid-session" 401 — not for the silent bootstrap calls
    // themselves (that would loop), and only once per request
    // (_retry guards against a retried request 401'ing again).
    if (error.response?.status === 401 && !isSilentAuthCall && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // a refresh is already in progress — wait for it instead of
        // starting a second one
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const refreshResponse = await authAPI.refreshAccessToken();
        const newToken = refreshResponse.data.data.accessToken;

        store.dispatch(setToken(newToken));
        resolvePendingQueue(newToken, null);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        // refresh itself failed (refresh cookie actually expired/invalid)
        // — THIS is when we actually log out and redirect, not on every 401.
        resolvePendingQueue(null, refreshErr);
        store.dispatch(logout());
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;