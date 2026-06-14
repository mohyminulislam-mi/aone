import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  googleLogin: (data) => api.post("/auth/google-login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
};

export const productAPI = {
  getProducts: (params) =>
    api.get("/products", { params: { limit: 100, ...params } }),
  getProduct: (idOrSlug) => api.get(`/products/${idOrSlug}`),
  getCategories: () => api.get("/products/categories"),
  getBrands: () => api.get("/products/brands"),
  createProduct: (data) => api.post("/products", data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

export const orderAPI = {
  createOrder: (data) => api.post("/orders", data),
  getMyOrders: () =>
    api.get("/orders/my-orders", { params: { _t: Date.now() } }),
  getOrderDetails: (id) => api.get(`/orders/${id}`),
  getAllOrders: () => api.get("/orders", { params: { _t: Date.now() } }),
  updateStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
};

export const reviewAPI = {
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  addReview: (productId, data) => api.post(`/reviews/${productId}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getCharts: () => api.get("/admin/charts"),
  getUsers: () => api.get("/users"),
  updateUserRole: (id, roleData) =>
    api.put(`/admin/users/${id}/role`, roleData),
};

export default api;