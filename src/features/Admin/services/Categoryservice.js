import axiosInstance from "../../../api/apiClient";

const BASE = "/admin/categories";

// GET /api/v1/admin/categories?page=&limit=&search=&parentCategory=
export const fetchCategories = (params = {}) =>
  axiosInstance.get(BASE, { params: { limit: 200, ...params } });

// GET /api/v1/admin/categories/:id
export const fetchCategoryById = (id) => axiosInstance.get(`${BASE}/${id}`);

// ---- NEW: image + posterDesktop + posterMobile are all Files now, so
// the FormData builder checks against a list of file keys instead of
// just "image". Everything else (arrays -> JSON.stringify, plain values
// appended as-is) is unchanged.
const FILE_KEYS = ["image", "posterDesktop", "posterMobile"];

const buildCategoryFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (FILE_KEYS.includes(key) && value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value) || typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });
  return formData;
};

// POST /api/v1/admin/categories  (multipart/form-data)
export const createCategory = (payload) =>
  axiosInstance.post(BASE, buildCategoryFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });

// PUT /api/v1/admin/categories/:id
export const updateCategory = (id, payload) =>
  axiosInstance.put(`${BASE}/${id}`, buildCategoryFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });

// PATCH /api/v1/admin/categories/:id/toggle-status
export const toggleCategoryStatus = (id) =>
  axiosInstance.patch(`${BASE}/${id}/toggle-status`);

// DELETE /api/v1/admin/categories/:id
export const deleteCategory = (id) => axiosInstance.delete(`${BASE}/${id}`);