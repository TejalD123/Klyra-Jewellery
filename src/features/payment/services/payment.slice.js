import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentAPI } from "./payment.api";

const rejectMsg = (err, fallback) => err.response?.data?.message || fallback;

export const createPaymentOrder = createAsyncThunk(
  "payment/create",
  async ({ orderId, paymentMethod }, { rejectWithValue }) => {
    try {
      // { isCod, payment } for COD  |  { isCod:false, razorpayOrderId, amount, currency, key, paymentId } otherwise
      return await paymentAPI.createPaymentOrder({ orderId, paymentMethod });
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Could not initiate payment"));
    }
  }
);

export const verifyPayment = createAsyncThunk(
  "payment/verify",
  async (payload, { rejectWithValue }) => {
    try {
      return await paymentAPI.verifyPayment(payload);
    } catch (err) {
      return rejectWithValue(rejectMsg(err, "Payment verification failed"));
    }
  }
);

const initialState = {
  createStatus: "idle",
  createError: null,
  paymentOrder: null,

  verifyStatus: "idle",
  verifyError: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPaymentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentOrder.pending, (s) => { s.createStatus = "loading"; s.createError = null; })
      .addCase(createPaymentOrder.fulfilled, (s, a) => { s.createStatus = "succeeded"; s.paymentOrder = a.payload; })
      .addCase(createPaymentOrder.rejected, (s, a) => { s.createStatus = "failed"; s.createError = a.payload; })

      .addCase(verifyPayment.pending, (s) => { s.verifyStatus = "loading"; s.verifyError = null; })
      .addCase(verifyPayment.fulfilled, (s) => { s.verifyStatus = "succeeded"; })
      .addCase(verifyPayment.rejected, (s, a) => { s.verifyStatus = "failed"; s.verifyError = a.payload; });
  },
});

export const { resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;