import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, ShoppingBag, Heart, User, LogOut } from "lucide-react";

const BottomNav = ({ userInfo, onLogout, hideWhen = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleAccountClick = () => {
    if (userInfo) {
      if (window.confirm("Bạn có muốn đăng xuất?")) {
        onLogout();
        navigate("/");
      }
    } else {
      navigate("/login");
    }
  };

  const navItems = [
    {
      path: "/",
      icon: Home,
      label: "Trang chủ",
      exact: true,
    },
    {
      path: "/products",
      icon: ShoppingBag,
      label: "Sản phẩm",
    },
    {
      path: "/wishlist",
      icon: Heart,
      label: "Yêu thích",
    },
    {
      path: "/account",
      icon: userInfo ? LogOut : User,
      label: userInfo ? "Đăng xuất" : "Tài khoản",
      isAction: true,
    },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden transition-opacity duration-200 ${hideWhen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.exact);

          return item.isAction ? (
            <button
              key={item.path}
              onClick={handleAccountClick}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                active ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon
                size={22}
                className={`transition-transform duration-200 ${
                  active ? "scale-110" : ""
                }`}
              />
              <span
                className={`text-[10px] font-bold mt-1 tracking-wide ${
                  active ? "font-extrabold" : ""
                }`}
              >
                {item.label}
              </span>
            </button>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                active ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon
                size={22}
                className={`transition-transform duration-200 ${
                  active ? "scale-110" : ""
                }`}
              />
              <span
                className={`text-[10px] font-bold mt-1 tracking-wide ${
                  active ? "font-extrabold" : ""
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
