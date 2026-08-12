import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addressAPI } from "./address.api";

const rejectMsg = (err, fallback) => err.response?.data?.message || fallback;

export const fetchAddresses = createAsyncThunk(
  "address/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await addressAPI.getMyAddresses();
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Failed to load addresses"));
    }
  }
);

export const addAddress = createAsyncThunk(
  "address/add",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const address = await addressAPI.createAddress(payload);
      dispatch(fetchAddresses()); // refresh full list (isDefault flags may shift)
      return address;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Could not add address"));
    }
  }
);

export const editAddress = createAsyncThunk(
  "address/edit",
  async ({ id, payload }, { dispatch, rejectWithValue }) => {
    try {
      const address = await addressAPI.updateAddress(id, payload);
      dispatch(fetchAddresses());
      return address;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Could not update address"));
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  "address/setDefault",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await addressAPI.setDefaultAddress(id);
      dispatch(fetchAddresses());
      return true;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Could not set default address"));
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "address/delete",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await addressAPI.deleteAddress(id);
      dispatch(fetchAddresses());
      return true;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Could not delete address"));
    }
  }
);

const initialState = {
  list: [],
  status: "idle", // idle | loading | succeeded | failed
  actionStatus: "idle", // add/edit/delete/setDefault ke liye — list ka full reload flicker na ho
  error: null,

  // form modal ka UI state — checkout aur profile dono se control hoga
  isFormOpen: false,
  editingAddress: null, // null = create mode, object = edit mode
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    openAddressForm: (state, action) => {
      state.isFormOpen = true;
      state.editingAddress = action.payload || null; // address object pass karo edit ke liye
    },
    closeAddressForm: (state) => {
      state.isFormOpen = false;
      state.editingAddress = null;
    },
    clearAddressError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (s) => { s.status = "loading"; s.error = null; })
      .addCase(fetchAddresses.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.list = a.payload || [];
      })
      .addCase(fetchAddresses.rejected, (s, a) => { s.status = "failed"; s.error = a.payload; })

      .addCase(addAddress.pending, (s) => { s.actionStatus = "loading"; s.error = null; })
      .addCase(addAddress.fulfilled, (s) => { s.actionStatus = "succeeded"; s.isFormOpen = false; s.editingAddress = null; })
      .addCase(addAddress.rejected, (s, a) => { s.actionStatus = "failed"; s.error = a.payload; })

      .addCase(editAddress.pending, (s) => { s.actionStatus = "loading"; s.error = null; })
      .addCase(editAddress.fulfilled, (s) => { s.actionStatus = "succeeded"; s.isFormOpen = false; s.editingAddress = null; })
      .addCase(editAddress.rejected, (s, a) => { s.actionStatus = "failed"; s.error = a.payload; })

      .addCase(deleteAddress.rejected, (s, a) => { s.error = a.payload; })
      .addCase(setDefaultAddress.rejected, (s, a) => { s.error = a.payload; });
  },
});

export const { openAddressForm, closeAddressForm, clearAddressError } = addressSlice.actions;
export default addressSlice.reducer;