import { create } from "zustand";

// Initialize from localStorage
const getInitialState = () => {
  try {
    const raw = localStorage.getItem("userInfo");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  userInfo: getInitialState(),

  login: (data) => {
    // Save to both localStorage and sessionStorage
    localStorage.setItem("userInfo", JSON.stringify(data));
    set({ userInfo: data });
  },

  logout: () => {
    localStorage.removeItem("userInfo");
    set({ userInfo: null });
  },

  setUserInfo: (data) => {
    localStorage.setItem("userInfo", JSON.stringify(data));
    set({ userInfo: data });
  },
}));
