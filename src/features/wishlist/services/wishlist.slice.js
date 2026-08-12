import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getWishlist, toggleWishlist as toggleWishlistApi } from "./wishlist.api";

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getWishlist();
      return res.data.data?.items || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load wishlist");
    }
  }
);

// Optimistic: the reducer flips the id on .pending (before the request
// even resolves) so the heart updates instantly. .fulfilled reconciles
// with the server's actual inWishlist result; .rejected rolls the flip back.
export const toggleWishlist = createAsyncThunk(
  "wishlist/toggleWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await toggleWishlistApi(productId);
      return { productId, inWishlist: res.data.data.inWishlist };
    } catch (err) {
      return rejectWithValue({
        productId,
        message: err.response?.data?.message || "Failed to update wishlist",
      });
    }
  }
);

const initialState = {
  productIds: [], // plain array (Redux state must be serializable — not a Set)
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlistState: (state) => {
      state.productIds = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.productIds = action.payload.map((item) => item.product?._id || item.product);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(toggleWishlist.pending, (state, action) => {
        const productId = action.meta.arg;
        if (state.productIds.includes(productId)) {
          state.productIds = state.productIds.filter((id) => id !== productId);
        } else {
          state.productIds.push(productId);
        }
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, inWishlist } = action.payload;
        const has = state.productIds.includes(productId);
        if (inWishlist && !has) state.productIds.push(productId);
        if (!inWishlist && has) state.productIds = state.productIds.filter((id) => id !== productId);
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        // roll back the optimistic flip from .pending
        const productId = action.payload?.productId || action.meta.arg;
        if (state.productIds.includes(productId)) {
          state.productIds = state.productIds.filter((id) => id !== productId);
        } else {
          state.productIds.push(productId);
        }
      });
  },
});

export const { clearWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;