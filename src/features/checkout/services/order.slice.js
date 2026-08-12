import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderAPI } from "./order.api";

const rejectMsg = (err, fallback) => err.response?.data?.message || fallback;

export const createOrder = createAsyncThunk(
  "orders/create",
  async ({ addressId, paymentMethod, couponCode }, { rejectWithValue }) => {
    try {
      return await orderAPI.create({ addressId, paymentMethod, couponCode });
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Could not place order"));
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  "orders/fetchMy",
  async (params, { rejectWithValue }) => {
    try {
      return await orderAPI.getMyOrders(params); // { orders, pagination }
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Failed to load orders"));
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await orderAPI.getById(id);
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Order not found"));
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "orders/cancel",
  async ({ id, reason }, { dispatch, rejectWithValue }) => {
    try {
      const order = await orderAPI.cancelOrder(id, reason);
      dispatch(fetchOrderById(id));
      return order;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Could not cancel order"));
    }
  }
);

export const cancelOrderItem = createAsyncThunk(
  "orders/cancelItem",
  async ({ id, itemId, reason }, { dispatch, rejectWithValue }) => {
    try {
      await orderAPI.cancelItem(id, itemId, reason);
      dispatch(fetchOrderById(id));
      return true;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Could not cancel item"));
    }
  }
);

export const requestItemReturn = createAsyncThunk(
  "orders/requestReturn",
  async ({ id, itemId, reason }, { dispatch, rejectWithValue }) => {
    try {
      await orderAPI.requestReturn(id, itemId, reason);
      dispatch(fetchOrderById(id));
      return true;
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Could not submit return request"));
    }
  }
);

const initialState = {
  list: { data: [], pagination: null, status: "idle", error: null },
  current: { data: null, status: "idle", error: null },
  createStatus: "idle",
  createError: null,
  createdOrder: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrentOrder: (s) => { s.current = { data: null, status: "idle", error: null }; },
    resetCreateStatus: (s) => { s.createStatus = "idle"; s.createError = null; s.createdOrder = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (s) => { s.createStatus = "loading"; s.createError = null; })
      .addCase(createOrder.fulfilled, (s, a) => { s.createStatus = "succeeded"; s.createdOrder = a.payload; })
      .addCase(createOrder.rejected, (s, a) => { s.createStatus = "failed"; s.createError = a.payload; })

      .addCase(fetchMyOrders.pending, (s) => { s.list.status = "loading"; })
      .addCase(fetchMyOrders.fulfilled, (s, a) => {
        s.list.status = "succeeded";
        s.list.data = a.payload.orders;
        s.list.pagination = a.payload.pagination;
      })
      .addCase(fetchMyOrders.rejected, (s, a) => { s.list.status = "failed"; s.list.error = a.payload; })

      .addCase(fetchOrderById.pending, (s) => { s.current.status = "loading"; })
      .addCase(fetchOrderById.fulfilled, (s, a) => { s.current.status = "succeeded"; s.current.data = a.payload; })
      .addCase(fetchOrderById.rejected, (s, a) => { s.current.status = "failed"; s.current.error = a.payload; });
  },
});

export const { clearCurrentOrder, resetCreateStatus } = ordersSlice.actions;
export default ordersSlice.reducer;