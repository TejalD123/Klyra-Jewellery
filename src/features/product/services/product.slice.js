import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productsAPI } from "./product.api";

export const fetchProductBySlug = createAsyncThunk(
  "productDetail/fetchBySlug",
  async (slug, { dispatch, rejectWithValue }) => {
    try {
      const product = await productsAPI.getBySlug(slug);
      dispatch(fetchRelatedProducts(product._id));
      return product;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Product not found");
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  "productDetail/fetchRelated",
  async (productId, { rejectWithValue }) => {
    try {
      return await productsAPI.getRelated(productId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load related products");
    }
  }
);

const initialState = {
  product: { data: null, status: "idle", error: null },
  related: { data: [], status: "idle", error: null },
};

const productSlice = createSlice({
  name: "productDetail",
  initialState,
  reducers: {
    clearProductDetail: (state) => {
      state.product = { data: null, status: "idle", error: null };
      state.related = { data: [], status: "idle", error: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductBySlug.pending, (s) => { s.product.status = "loading"; s.product.error = null; })
      .addCase(fetchProductBySlug.fulfilled, (s, a) => { s.product.status = "succeeded"; s.product.data = a.payload; })
      .addCase(fetchProductBySlug.rejected, (s, a) => { s.product.status = "failed"; s.product.error = a.payload; })

      .addCase(fetchRelatedProducts.pending, (s) => { s.related.status = "loading"; })
      .addCase(fetchRelatedProducts.fulfilled, (s, a) => { s.related.status = "succeeded"; s.related.data = a.payload; })
      .addCase(fetchRelatedProducts.rejected, (s, a) => { s.related.status = "failed"; s.related.error = a.payload; });
  },
});

export const { clearProductDetail } = productSlice.actions;
export default productSlice.reducer;