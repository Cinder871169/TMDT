import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

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
  } catch (err) {
    // ignore
  }
  return config;
});

export default api;
