import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Newspaper,
  LogOut,
  ChevronLeft,
  Menu,
  Search,
  Settings,
  X,
  Tag,
} from "lucide-react";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/products", label: "Sản phẩm", icon: Package },
  { path: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
  { path: "/admin/vouchers", label: "Mã giảm giá", icon: Tag },
  { path: "/admin/users", label: "Người dùng", icon: Users },
  { path: "/admin/news", label: "Bài viết", icon: Newspaper },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo: adminUser, logout } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getBreadcrumb = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    const filteredPaths = paths.filter((p) => p.toLowerCase() !== "admin");
    if (filteredPaths.length === 0) return "Dashboard";
    return filteredPaths
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" / ");
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Search:", searchQuery);
    }
  };

  return (
    <div className="admin-layout">
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""} ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <Link to="/admin/dashboard" className="logo">
            <div className="logo-icon">S</div>
            <div className="logo-text">
              SneakerZone
              <span className="logo-badge">Admin</span>
            </div>
          </Link>
          {mobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-close-btn"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Chính</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path !== "/admin/dashboard" && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">
              {adminUser?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="admin-info">
              <span className="admin-name">{adminUser?.name || "Admin"}</span>
              <span className="admin-email">{adminUser?.email || "admin@example.com"}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-menu-btn"
            >
              <Menu size={20} />
            </button>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="menu-toggle"
              title={sidebarCollapsed ? "Mở rộng" : "Thu gọn"}
            >
              <ChevronLeft
                size={18}
                style={{
                  transform: sidebarCollapsed ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                }}
              />
            </button>

            <div className="breadcrumb">
              <span className="breadcrumb-root">Admin</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{getBreadcrumb()}</span>
            </div>
          </div>

          <div className="topbar-right">
            <form onSubmit={handleSearch} className="topbar-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="topbar-date">{getCurrentDate()}</div>

            
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
