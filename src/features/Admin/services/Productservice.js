import axiosInstance from "../../../api/apiClient";

const BASE = "/admin/products";

// GET /api/v1/admin/products?page=&limit=&search=&category=&isActive=...
export const fetchProducts = (params = {}) =>
  axiosInstance.get(BASE, { params: { limit: 20, ...params } });

// GET /api/v1/admin/products/:id
export const fetchProductById = (id) => axiosInstance.get(`${BASE}/${id}`);

// Shared multipart builder — product.routes.js expects `images` (up to 8 files)
// and JSON-stringified `sizeOptions` / `keepImages` (parseJsonFields middleware).
const buildProductFormData = (payload, imageFiles = []) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "sizeOptions" || key === "keepImages") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });
  imageFiles.forEach((file) => formData.append("images", file));
  return formData;
};

// POST /api/v1/admin/products
export const createProduct = (payload, imageFiles = []) =>
  axiosInstance.post(BASE, buildProductFormData(payload, imageFiles), {
    headers: { "Content-Type": "multipart/form-data" },
  });

// PUT /api/v1/admin/products/:id
export const updateProduct = (id, payload, imageFiles = []) =>
  axiosInstance.put(`${BASE}/${id}`, buildProductFormData(payload, imageFiles), {
    headers: { "Content-Type": "multipart/form-data" },
  });

// PATCH /api/v1/admin/products/:id/stock   body: { action: 'increment'|'decrement'|'set', quantity }
export const updateProductStock = (id, action, quantity) =>
  axiosInstance.patch(`${BASE}/${id}/stock`, { action, quantity });

// PATCH /api/v1/admin/products/:id/toggle-featured
export const toggleProductFeatured = (id) =>
  axiosInstance.patch(`${BASE}/${id}/toggle-featured`);

// PATCH /api/v1/admin/products/:id/toggle-status
export const toggleProductStatus = (id) =>
  axiosInstance.patch(`${BASE}/${id}/toggle-status`);

// DELETE /api/v1/admin/products/:id
export const deleteProduct = (id) => axiosInstance.delete(`${BASE}/${id}`);