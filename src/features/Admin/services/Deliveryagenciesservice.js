import axiosInstance from "../../../api/apiClient";

const BASE = "/admin/delivery";

// GET /api/v1/admin/delivery — all agencies (active + inactive), for the management page
export const fetchAllDeliveryAgencies = () => axiosInstance.get(BASE);

// GET /api/v1/admin/delivery/active — active only, for the Orders page picker
export const fetchActiveDeliveryAgencies = () => axiosInstance.get(`${BASE}/active`);

const buildFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "logo" && value instanceof File) {
      formData.append("logo", value);
    } else if (key === "stateRates") {
      formData.append("stateRates", JSON.stringify(value || []));
    } else {
      formData.append(key, value);
    }
  });
  return formData;
};

// POST /api/v1/admin/delivery  (multipart/form-data — logo is optional)
export const createDeliveryAgency = (payload) =>
  axiosInstance.post(BASE, buildFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });

// PUT /api/v1/admin/delivery/:id
export const updateDeliveryAgency = (id, payload) =>
  axiosInstance.put(`${BASE}/${id}`, buildFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const toggleDeliveryAgencyStatus = (id) => axiosInstance.patch(`${BASE}/${id}/toggle`);

export const deleteDeliveryAgency = (id) => axiosInstance.delete(`${BASE}/${id}`);