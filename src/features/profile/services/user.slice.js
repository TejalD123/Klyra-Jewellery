import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userAPI } from "../../auth/services/auth.api";
import { updateUserProfile } from "../../auth/services/Auth.slice";

const rejectMsg = (err, fallback) => err.response?.data?.message || fallback;

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const user = await userAPI.updateMe(payload);
      dispatch(updateUserProfile(user)); // auth.user ko sync karo — Navbar isi se displayName leta hai
      return user;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Could not update profile"));
    }
  }
);

const initialState = {
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (s) => { s.status = "loading"; s.error = null; })
      .addCase(updateProfile.fulfilled, (s) => { s.status = "succeeded"; })
      .addCase(updateProfile.rejected, (s, a) => { s.status = "failed"; s.error = a.payload; });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;