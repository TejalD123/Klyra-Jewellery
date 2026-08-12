import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authAPI from "./auth.api";
import { sendPhoneOTP, verifyPhoneOTP } from "../../../config/Firebase.config";

export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async ({ method, identifier }, thunkAPI) => {
    try {
      if (method === "phone") {
        const formatted = identifier.startsWith("+")
          ? identifier
          : `+91${identifier}`;
        await sendPhoneOTP(formatted);
        return { identifier: formatted };
      }

      await authAPI.sendEmailOTP(identifier);
      return { identifier };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to send OTP";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ method, identifier, otpCode, extraDetails, mode }, thunkAPI) => {
    try {
      let payload;

      if (method === "phone") {
        const idToken = await verifyPhoneOTP(otpCode); // Firebase verifies client-side
        payload = { ...extraDetails, idToken, phone: identifier };
      } else {
        await authAPI.verifyEmailOTP(identifier, otpCode);
        payload = { ...extraDetails, email: identifier };
      }

      const response =
        mode === "login"
          ? await authAPI.completeLogin(payload)
          : await authAPI.completeRegistration(payload);

      // Backend ApiResponse wrapper: { statusCode, success, message, data: { user, accessToken, refreshToken } }
      return response.data.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "OTP verification failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// ===== Google Sign-In (single-step: Firebase popup -> backend /auth/register) =====
export const googleAuth = createAsyncThunk(
  "auth/googleAuth",
  async (_, thunkAPI) => {
    try {
      const { signInWithGoogle } =
        await import("../../../config/Firebase.config");
      const { idToken } = await signInWithGoogle();
      const response = await authAPI.completeRegistration({
        idToken,
        provider: "google",
      });
      return response.data.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Google sign-in failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const bootstrapAuth = createAsyncThunk(
  "auth/bootstrapAuth",
  async (_, thunkAPI) => {
    try {
      const refreshResponse = await authAPI.refreshAccessToken();
      const { accessToken } = refreshResponse.data.data;

      const meResponse = await authAPI.getCurrentUser(accessToken);
      const user = meResponse.data.data;

      return { user, accessToken };
    } catch (err) {
      return thunkAPI.rejectWithValue(null);
    }
  },
);

const initialState = {
  user: null,
  token: null,
  authMethod: "email",
  pendingIdentifier: null,
  status: "idle", // idle | sendingOtp | otpSent | verifying | succeeded | failed
  error: null,
  authChecked: false, // <-- added: App.jsx isse decide karta hai bootstrap complete hua ya nahi
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthMethod: (state, action) => {
      state.authMethod = action.payload;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = "idle";
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    // NEW — user.slice ke updateProfile thunk se call hota hai, profile edit
    // (fullName waghera) ke baad auth.user object ko naye fields se merge
    // karta hai. Navbar aur ProfilePage dono isi state.auth.user se read
    // karte hain, isliye yeh sync zaroori hai warna edit ke baad naam
    // purana hi dikhta rahega jab tak page refresh na ho.
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    // NEW — used by apiClient.js's response interceptor after a silent
    // background refresh-token call succeeds (e.g. access token expired
    // mid-session on an "Add to Bag" click). Just swaps the token in —
    // doesn't touch user/status, since the session itself never actually
    // ended, only the short-lived access token did.
    setToken: (state, action) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- sendOtp ----
      .addCase(sendOtp.pending, (state) => {
        state.status = "sendingOtp";
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.status = "otpSent";
        state.pendingIdentifier = action.payload.identifier;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // ---- verifyOtp ----
      .addCase(verifyOtp.pending, (state) => {
        state.status = "verifying";
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // ---- googleAuth ----
      .addCase(googleAuth.pending, (state) => {
        state.status = "verifying";
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // ---- bootstrapAuth ----
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.status = "succeeded";
        state.authChecked = true;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.status = "idle";
        state.authChecked = true;
      });
  },
});

export const { setAuthMethod, logout, clearAuthError, updateUserProfile, setToken } = authSlice.actions;
export const resendOtp = sendOtp; // alias so OtpPage's resend button works
export default authSlice.reducer;