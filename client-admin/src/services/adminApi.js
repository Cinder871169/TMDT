import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const api = axios.create({ baseURL: BASE });

// Request interceptor - add token from localStorage
api.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem("userInfo");
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch {}
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("userInfo");
      // Redirect to admin login
      window.location.href = `http://localhost:5174/login`;
    }
    return Promise.reject(error);
  },
);

// ==================== ADMIN API ====================
export const adminApi = {
  // Dashboard stats - endpoint is /api/admin/users/stats/dashboard
  getDashboardStats: (params) =>
    api.get("/api/admin/users/stats/dashboard", { params }),

  // Products
  getProducts: (params) => api.get("/api/admin/products", { params }),
  getProduct: (id) => api.get(`/api/admin/products/${id}`),
  createProduct: (data) =>
    api.post("/api/admin/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateProduct: (id, data) =>
    api.put(`/api/admin/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteProduct: (id) => api.delete(`/api/admin/products/${id}`),

  // Orders
  getOrders: (params) => api.get("/api/admin/orders", { params }),
  getOrder: (id) => api.get(`/api/admin/orders/${id}`),
  updateOrderStatus: (id, status) =>
    api.put(`/api/admin/orders/${id}/status`, { status }),
  deleteOrder: (id) => api.delete(`/api/admin/orders/${id}`),

  // Users
  getUsers: (params) => api.get("/api/admin/users", { params }),
  getUser: (id) => api.get(`/api/admin/users/${id}`),
  updateUserRole: (id, isAdmin) =>
    api.put(`/api/admin/users/${id}/role`, { isAdmin }),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),

  // News
  getNews: (params) => api.get("/api/admin/news", { params }),
  getNewsItem: (id) => api.get(`/api/admin/news/${id}`),
  createNews: (data) =>
    api.post("/api/admin/news", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateNews: (id, data) =>
    api.put(`/api/admin/news/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteNews: (id) => api.delete(`/api/admin/news/${id}`),

  // Contacts
  getContacts: () => api.get("/api/admin/users/contacts"),
  deleteContact: (id) => api.delete(`/api/admin/users/contacts/${id}`),

  // Newsletter
  getNewsletter: () => api.get("/api/admin/users/newsletter"),
};

export default api;
