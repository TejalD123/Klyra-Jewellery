import axiosInstance from "../../../api/apiClient";

export const getProductReviews = (productId, params = {}) =>
  axiosInstance.get(`/products/${productId}/reviews`, { params });

export const getReviewEligibility = (productId) =>
  axiosInstance.get(`/products/${productId}/reviews/eligibility`);

export const submitReview = (productId, payload) =>
  axiosInstance.post(`/products/${productId}/reviews`, payload);