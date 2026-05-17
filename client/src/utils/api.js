import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/";

const api = axios.create({
  baseURL: BASE,
});

// Attach token automatically from localStorage when present
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
  } catch {
    // ignore
  }
  return config;
});

// Response interceptor - handle 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("userInfo");
      window.location.href = "http://localhost:5173/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Product API
export const productApi = {
  getAll: (params = {}) => api.get("/api/products", { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  checkStock: (items) => {
    return api.get("/api/products/check-stock", {
      params: { items: JSON.stringify(items) }
    });
  },
};

// Cart API
export const cartApi = {
  checkout: (orderData) => api.post("/api/orders", orderData),
};
