import api from "../../../api/apiClient";

// GET /api/v1/products — all filters map 1:1 to getAllProductsService.
export const searchProducts = (params = {}) => api.get("/products", { params });

// GET /api/v1/categories/tree — kept for anywhere the full nested tree is
// still needed (not used by SearchPage anymore — see fetchCategoryById +
// fetchSubcategoriesOf below, which scope the sidebar to ONE main
// category's subcategories instead of the whole site's category tree).
export const fetchCategoryTree = () => api.get("/categories/tree");

// GET /api/v1/categories/:id — single category (used to detect whether
// the id in the URL is a main category or a subcategory, and to read its
// metalTypes for the top metal-type tabs).
export const fetchCategoryById = (id) => api.get(`/categories/${id}`);

// GET /api/v1/categories/:id/subcategories — direct children of a main
// category, used to populate the sidebar's "Category" checkbox list.
export const fetchSubcategoriesOf = (id) => api.get(`/categories/${id}/subcategories`);