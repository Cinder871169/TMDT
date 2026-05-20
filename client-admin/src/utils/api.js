import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/";

const api = axios.create({ baseURL: BASE });

// Request interceptor - add token from localStorage
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("userInfo");
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch { }
  return config;
});

// Response interceptor - handle 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("userInfo");
      // Redirect to client login
      window.location.href = `${import.meta.env.VITE_CLIENT_URL || "http://localhost:5173"}/login`;
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Dashboard stats
  getDashboardStats: () => api.get("/api/admin/stats/dashboard"),

  // Products
  getProducts: () => api.get("/api/admin/products"),
  getProduct: (id) => api.get(`/api/admin/products/${id}`),
  createProduct: (data) => api.post("/api/admin/products", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  updateProduct: (id, data) => api.put(`/api/admin/products/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  deleteProduct: (id) => api.delete(`/api/admin/products/${id}`),

  // Orders
  getOrders: () => api.get("/api/admin/orders"),
  getOrder: (id) => api.get(`/api/admin/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/api/admin/orders/${id}/status`, { status }),
  deleteOrder: (id) => api.delete(`/api/admin/orders/${id}`),

  // Users
  getUsers: () => api.get("/api/admin/users"),
  getUser: (id) => api.get(`/api/admin/users/${id}`),
  updateUserRole: (id, isAdmin) => api.put(`/api/admin/users/${id}/role`, { isAdmin }),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),

  // News
  getNews: () => api.get("/api/admin/news"),
  getNewsItem: (id) => api.get(`/api/admin/news/${id}`),
  createNews: (data) => api.post("/api/admin/news", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  updateNews: (id, data) => api.put(`/api/admin/news/${id}`, data, {
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
