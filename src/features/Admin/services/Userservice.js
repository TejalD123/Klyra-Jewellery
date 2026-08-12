import axiosInstance from "../../../api/apiClient";

const BASE = "/admin/users";

// GET /api/v1/admin/users?page=&limit=&search=
export const fetchUsers = (params = {}) =>
  axiosInstance.get(BASE, { params: { limit: 20, ...params } });