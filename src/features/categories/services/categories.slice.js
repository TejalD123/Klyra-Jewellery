import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { categoriesAPI } from "./categories.api";

export const fetchMainCategories = createAsyncThunk(
  "categories/fetchMainCategories",
  async (limit = 8, { rejectWithValue }) => {
    try {
      const data = await categoriesAPI.getAll({
        parentCategory: "null", // matches backend's string check
        isActive: true,
        limit,
        sort: "displayOrder",
      });
      return data.categories;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load categories");
    }
  }
);

export const fetchAllMainCategories = createAsyncThunk(
  "categories/fetchAllMainCategories",
  async (_, { rejectWithValue }) => {
    try {
      const data = await categoriesAPI.getAll({
        parentCategory: "null",
        isActive: true,
        limit: 100,
        sort: "displayOrder",
      });
      return data.categories;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load categories");
    }
  }
);

export const fetchCategoryBySlug = createAsyncThunk(
  "categories/fetchCategoryBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      return await categoriesAPI.getBySlug(slug);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Category not found");
    }
  }
);

export const fetchSubcategories = createAsyncThunk(
  "categories/fetchSubcategories",
  async (categoryId, { rejectWithValue }) => {
    try {
      return await categoriesAPI.getSubcategories(categoryId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load subcategories");
    }
  }
);

const initialState = {
  homeCategories: { data: [], status: "idle", error: null },
  allMainCategories: { data: [], status: "idle", error: null },
  currentCategory: { data: null, status: "idle", error: null },
  subcategories: { data: [], status: "idle", error: null },
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCurrentCategory: (state) => {
      state.currentCategory = { data: null, status: "idle", error: null };
      state.subcategories = { data: [], status: "idle", error: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMainCategories.pending, (s) => { s.homeCategories.status = "loading"; s.homeCategories.error = null; })
      .addCase(fetchMainCategories.fulfilled, (s, a) => { s.homeCategories.status = "succeeded"; s.homeCategories.data = a.payload; })
      .addCase(fetchMainCategories.rejected, (s, a) => { s.homeCategories.status = "failed"; s.homeCategories.error = a.payload; })

      .addCase(fetchAllMainCategories.pending, (s) => { s.allMainCategories.status = "loading"; s.allMainCategories.error = null; })
      .addCase(fetchAllMainCategories.fulfilled, (s, a) => { s.allMainCategories.status = "succeeded"; s.allMainCategories.data = a.payload; })
      .addCase(fetchAllMainCategories.rejected, (s, a) => { s.allMainCategories.status = "failed"; s.allMainCategories.error = a.payload; })

      .addCase(fetchCategoryBySlug.pending, (s) => { s.currentCategory.status = "loading"; s.currentCategory.error = null; })
      .addCase(fetchCategoryBySlug.fulfilled, (s, a) => { s.currentCategory.status = "succeeded"; s.currentCategory.data = a.payload; })
      .addCase(fetchCategoryBySlug.rejected, (s, a) => { s.currentCategory.status = "failed"; s.currentCategory.error = a.payload; })

      .addCase(fetchSubcategories.pending, (s) => { s.subcategories.status = "loading"; s.subcategories.error = null; })
      .addCase(fetchSubcategories.fulfilled, (s, a) => { s.subcategories.status = "succeeded"; s.subcategories.data = a.payload; })
      .addCase(fetchSubcategories.rejected, (s, a) => { s.subcategories.status = "failed"; s.subcategories.error = a.payload; });
  },
});

export const { clearCurrentCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;