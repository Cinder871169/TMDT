import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return; // Prevent re-initialization on hot reload

    const initAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userParam = urlParams.get("user");

        if (userParam) {
          try {
            const user = JSON.parse(decodeURIComponent(atob(userParam)));
            if (user?.isAdmin) {
              localStorage.setItem("userInfo", JSON.stringify(user));
              setAdminUser(user);
              setToken(user?.token);
              window.history.replaceState({}, "", window.location.pathname);
              setIsLoading(false);
              setInitialized(true);
              return;
            }
          } catch (e) {
            console.error("Failed to parse user param:", e);
          }
        }

        const raw = localStorage.getItem("userInfo");
        if (raw) {
          try {
            const user = JSON.parse(raw);
            if (user?.isAdmin) {
              setAdminUser(user);
              setToken(user?.token);
            } else if (user && window.location.pathname !== "/login") {
              // Only redirect if user exists but not admin, and not on login page
              window.location.href = `${window.location.origin}/login`;
            }
          } catch (e) {
            console.error("Failed to parse localStorage:", e);
            localStorage.removeItem("userInfo");
          }
        }
      } catch (err) {
        console.error("Error initializing admin store:", err);
      } finally {
        setIsLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, [initialized]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      if (!data.isAdmin) {
        throw new Error("Tài khoản không có quyền admin");
      }

      localStorage.setItem("userInfo", JSON.stringify(data));
      setAdminUser(data);
      setToken(data.token);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("userInfo");
    setAdminUser(null);
    setToken(null);
    setError(null);
    window.location.href = "http://localhost:5173/login";
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    adminUser,
    token,
    isAuthenticated: !!adminUser && !!token,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminStore() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminStore must be used within AdminAuthProvider");
  }
  return context;
}

export default useAdminStore;
