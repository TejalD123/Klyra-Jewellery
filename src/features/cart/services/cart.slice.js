import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartAPI } from "./cart.api";

const rejectMsg = (err, fallback) => err.response?.data?.message || fallback;

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    return await cartAPI.getCart();
  } catch (err) {
    return rejectWithValue(rejectMsg(err, "Failed to load cart"));
  }
});

export const addToCart = createAsyncThunk(
  "cart/addItem",
  async ({ productId, quantity = 1, size = "" }, { dispatch, rejectWithValue }) => {
    try {
      await cartAPI.addItem({ productId, quantity, size });
      dispatch(fetchCart()); // refresh with populated product details
      return true;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Could not add item to cart"));
    }
  }
);

export const updateCartItemQty = createAsyncThunk(
  "cart/updateItem",
  async ({ itemId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      await cartAPI.updateItem(itemId, quantity);
      dispatch(fetchCart());
      return true;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Could not update quantity"));
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (itemId, { dispatch, rejectWithValue }) => {
    try {
      await cartAPI.removeItem(itemId);
      dispatch(fetchCart());
      return true;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Could not remove item"));
    }
  }
);

export const clearCart = createAsyncThunk("cart/clear", async (_, { rejectWithValue }) => {
  try {
    await cartAPI.clearCart();
    return true;
  } catch (err) {
    return rejectWithValue(rejectMsg(err, "Could not clear cart"));
  }
});

const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  status: "idle", // idle | loading | succeeded | failed
  actionStatus: "idle", // for add/update/remove — separate so list doesn't full-reload flicker
  error: null,

  // ---- UI state (sidebar + toast) — cartUI.slice se merge kiya, alag slice nahi ----
  isSidebarOpen: false,
  hasAddedOnce: false, // session ke liye — pehla add sidebar kholta hai, uske baad sirf toast
  toast: null, // { message } | null
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    openCartSidebar: (state) => {
      state.isSidebarOpen = true;
    },
    closeCartSidebar: (state) => {
      state.isSidebarOpen = false;
    },
    toggleCartSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    // ProductDetailPage isko call karega — khud decide karta hai sidebar khole ya toast dikhaye
    notifyItemAdded: (state, action) => {
      if (!state.hasAddedOnce) {
        state.hasAddedOnce = true;
        state.isSidebarOpen = true;
      } else {
        state.toast = { message: action.payload?.message || "Product added to cart" };
      }
    },
    hideToast: (state) => {
      state.toast = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (s) => { s.status = "loading"; s.error = null; })
      .addCase(fetchCart.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.items = a.payload.items || [];
        s.totalItems = a.payload.totalItems || 0;
        s.totalAmount = a.payload.totalAmount || 0;
      })
      .addCase(fetchCart.rejected, (s, a) => { s.status = "failed"; s.error = a.payload; })

      .addCase(addToCart.pending, (s) => { s.actionStatus = "loading"; })
      .addCase(addToCart.fulfilled, (s) => { s.actionStatus = "succeeded"; })
      .addCase(addToCart.rejected, (s, a) => { s.actionStatus = "failed"; s.error = a.payload; })

      .addCase(updateCartItemQty.rejected, (s, a) => { s.error = a.payload; })
      .addCase(removeCartItem.rejected, (s, a) => { s.error = a.payload; })

      .addCase(clearCart.fulfilled, (s) => { s.items = []; s.totalItems = 0; s.totalAmount = 0; });
  },
});

export const { openCartSidebar, closeCartSidebar, toggleCartSidebar, notifyItemAdded, hideToast } =
  cartSlice.actions;

export default cartSlice.reducer;