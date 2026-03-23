import { create } from "zustand";

export const useAuthStore = create((set) => ({

  userInfo: JSON.parse(localStorage.getItem("userInfo")) || null,

  login: (data) => {
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
  }

}));