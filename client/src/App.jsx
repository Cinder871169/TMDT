import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, Navigate, Outlet, useLocation } from "react-router-dom";
import api from "./utils/api";
import { Toaster, toast } from "react-hot-toast";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  User,
  LogOut,
  Package,
  Search,
  Heart,
  Menu,
} from "lucide-react";

import { useCartStore } from "./store/useCartStore";
import { useAuthStore } from "./store/useAuthStore";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Order";
import OrderDetail from "./pages/OrderDetail";
import OrderSuccess from "./pages/OrderSuccess";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import Products from "./pages/Products";
import News from "./pages/News";
import Contact from "./pages/Contact";
import Vouchers from "./pages/Vouchers";
import BlogDetail from "./pages/BlogDetails";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Sidebar from "./components/Sidebar";
import Newsletter from "./components/Newsletter";
import Hero from "./components/HeroBanner";
import FeatureHighlights from "./components/FeatureHighlights";
import ProductCard from "./components/ProductCard";
import Categories from "./components/Categories";
import Trending from "./components/Trending";
import SearchBar from "./components/SearchBar";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import SEO from "./components/SEO";
import BottomNav from "./components/BottomNav";
import BackToTop from "./components/BackToTop";

// Admin Imports
import "./admin/admin.css";
import AdminLayout from "./admin/components/AdminLayout";
import AdminDashboard from "./admin/pages/Dashboard";
import AdminProducts from "./admin/pages/Products";
import AdminProductForm from "./admin/pages/ProductForm";
import AdminOrders from "./admin/pages/Orders";
import AdminOrderDetail from "./admin/pages/OrderDetail";
import AdminUsers from "./admin/pages/Users";
import AdminNews from "./admin/pages/News";
import AdminNewsForm from "./admin/pages/NewsForm";
import AdminVouchers from "./admin/pages/Vouchers";

const ProductSkeleton = () => (
  <div className="bg-white p-4 rounded-[2rem] border border-gray-100 animate-pulse">
    <div className="h-64 rounded-2xl bg-gray-200 mb-5"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded-lg w-1/3"></div>
      <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-3 h-3 bg-gray-200 rounded"></div>
        ))}
        <div className="h-3 bg-gray-200 rounded w-16 ml-1"></div>
      </div>
      <div className="flex justify-between items-center pt-3">
        <div className="h-6 bg-gray-200 rounded-lg w-1/3"></div>
        <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  </div>
);

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword] = useState("");
  const [brand, setBrand] = useState("Tất cả");
  const [priceRange, setPriceRange] = useState(10000000);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(
          `/api/products?keyword=${keyword}&brand=${brand}`,
        );

        let filtered = data.filter((p) => p.price <= priceRange);

        if (selectedSizes.length > 0) {
          filtered = filtered.filter((p) =>
            p.sizes.some((size) => selectedSizes.includes(size)),
          );
        }

        if (selectedColors.length > 0) {
          filtered = filtered.filter((p) =>
            selectedColors.some((color) => p.colors.includes(color)),
          );
        }

        setProducts(filtered);
        setTimeout(() => setLoading(false), 500);
      } catch {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, brand, priceRange, selectedSizes, selectedColors]);

  return (
    <>
      <SEO
        title="Cửa Hàng Giày Sneaker Chính Hãng Việt Nam"
        description="Chuyên cung cấp giày sneaker chính hãng Nike, Adidas, Jordan, Puma với giá tốt nhất. Miễn phí vận chuyển, đổi trả 30 ngày."
      />
      <main className="max-w-[1440px] mx-auto px-6 py-10">
      <Hero />
      <FeatureHighlights />
      <Categories />
      <Trending />
      <div
        id="products-section"
        className="flex flex-col lg:grid lg:grid-cols-12 gap-10"
      >
        <div className="lg:col-span-3">
          <div className="sticky top-28">
            <Sidebar
              brand={brand}
              setBrand={setBrand}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedSizes={selectedSizes}
              setSelectedSizes={setSelectedSizes}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
            />
          </div>
        </div>
        <div className="lg:col-span-9">
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Hiển thị{" "}
              <span className="font-bold text-gray-900">{products.length}</span>{" "}
              sản phẩm
              {(brand !== "Tất cả" ||
                priceRange < 10000000 ||
                selectedSizes.length > 0 ||
                selectedColors.length > 0) && (
                <span className="text-orange-600 font-bold"> (đã lọc)</span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading ? (
              [...Array(6)].map((_, i) => <ProductSkeleton key={i} />)
            ) : products.length > 0 ? (
              products.map((shoe) => (
                <ProductCard key={shoe._id} product={shoe} />
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-500">
                  Thử điều chỉnh bộ lọc hoặc tìm kiếm từ khóa khác
                </p>
              </div>
            )}
          </div>
          <Newsletter />
        </div>
      </div>
    </main>
    </>
  );
}

// Admin Guard & Layout Wrapper
function AdminGuard() {
  const { userInfo } = useAuthStore();
  if (!userInfo || !userInfo.isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

const AdminLayoutWrapper = () => (
  <AdminLayout>
    <Outlet />
  </AdminLayout>
);

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const { userInfo, logout } = useAuthStore();
  const navigate = useNavigate();
  const {
    cart,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    hydrateCart,
    clearCart,
    removeMultipleFromCart,
  } = useCartStore();

  useEffect(() => {
    const userId = userInfo?._id;
    const nextKey = userId ? `cart_${userId}` : "cart_guest";
    hydrateCart(nextKey);
  }, [userInfo, hydrateCart]);


  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <div className="font-sans text-gray-900 bg-white">
      <Toaster position="top-center" />

      {/* NAVBAR */}
      {!isAdminRoute && (
        <>
          <nav className="bg-white/80 backdrop-blur-xl shadow-sm py-4 px-4 md:py-6 md:px-12 flex justify-between items-center sticky top-0 z-40 border-b border-gray-100/50">
        <Link
          to="/"
          className="text-xl md:text-2xl font-black tracking-tighter uppercase flex items-center gap-2 group"
        >
          <svg
            className="w-8 h-8 text-orange-600 group-hover:rotate-12 transition-transform duration-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>{" "}
          SneakerZone
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10 text-sm font-bold uppercase">
          <div className="relative group">
            <Link to="/" className="hover:text-orange-600 transition-colors">
              Trang chủ
            </Link>
          </div>

          <div className="relative">
            <Link
              to="/products"
              className="hover:text-orange-600 transition-colors"
            >
              Sản phẩm
            </Link>
          </div>

          <div className="relative group">
            <Link
              to="/news"
              className="hover:text-orange-600 transition-colors"
            >
              Tin tức
            </Link>
          </div>

          <div className="relative group">
            <Link
              to="/vouchers"
              className="hover:text-orange-600 transition-colors bg-orange-50 text-orange-600 px-3 py-1 rounded-full"
            >
              Khuyến mãi
            </Link>
          </div>

          <div className="relative group">
            <Link
              to="/contact"
              className="hover:text-orange-600 transition-colors"
            >
              Liên hệ
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center gap-4 sm:gap-6">
          {/* SearchBar - mobile button only */}
          <SearchBar
            isMobileSearchOpen={isMobileSearchOpen}
            onCloseMobileSearch={() => setIsMobileSearchOpen(false)}
            onOpenMobileSearch={() => setIsMobileSearchOpen(true)}
            variant="mobile-only"
          />
          {userInfo ? (
            <div className="group relative py-2 hidden md:block">
              <div className="flex items-center gap-3 cursor-pointer font-black text-[10px] uppercase tracking-[0.2em] bg-zinc-950 text-white px-4 md:px-7 py-2 md:py-3 rounded-full whitespace-nowrap">
                <User size={14} /> <span className="hidden lg:inline">{userInfo.name}</span>
              </div>
              <div className="hidden group-hover:block absolute top-full right-0 pt-3 w-64 animate-in fade-in slide-in-from-top-2">
                <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-2xl p-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase hover:bg-gray-50 rounded-2xl"
                  >
                    <User size={18} className="text-orange-500" /> Profile
                  </Link>
                  <Link
                    to="/wishlist"
                    className="flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase hover:bg-gray-50 rounded-2xl"
                  >
                    <Heart size={18} className="text-red-500" /> Yêu thích
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase hover:bg-gray-50 rounded-2xl"
                  >
                    <Package size={18} className="text-orange-500" /> Đơn hàng
                  </Link>
                  <Link
                    to="/vouchers"
                    className="flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase hover:bg-gray-50 rounded-2xl"
                  >
                    <svg className="w-[18px] h-[18px] text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg> Kho Voucher
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="w-full flex items-center gap-4 px-6 py-5 text-[10px] font-black uppercase hover:bg-red-50 text-red-500 rounded-2xl"
                  >
                    <LogOut size={18} /> Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-[10px] font-black uppercase hover:text-orange-600 hidden md:block"
            >
              Đăng nhập
            </Link>
          )}

          {/* NÚT GIỎ HÀNG */}
          <div
            className="relative cursor-pointer group"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart
              size={28}
              className="group-hover:text-orange-600 transition-colors"
            />
            {totalItems > 0 && (
              <span className="absolute -top-2.5 -right-2.5 bg-orange-600 text-white text-[9px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                {totalItems}
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Search bar below navbar - Desktop only */}
      <div className="bg-white border-b py-3 md:py-4 hidden md:block">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex justify-center">
            <SearchBar
              isMobileSearchOpen={isMobileSearchOpen}
              onCloseMobileSearch={() => setIsMobileSearchOpen(false)}
              onOpenMobileSearch={() => setIsMobileSearchOpen(true)}
              variant="desktop-only"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50">
          <div className="bg-white w-80 h-full ml-auto p-6 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-black uppercase">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 px-4 text-lg font-bold hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"
                >
                  Trang chủ
                </Link>
                <Link
                  to="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 px-4 text-lg font-bold hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"
                >
                  Sản phẩm
                </Link>
                <Link
                  to="/news"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 px-4 text-lg font-bold hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"
                >
                  Tin tức
                </Link>
                <Link
                  to="/vouchers"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 px-4 text-lg font-bold text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                >
                  Khuyến mãi
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 px-4 text-lg font-bold hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"
                >
                  Liên hệ
                </Link>
              </div>

              <div className="border-t pt-6 space-y-4">
                {userInfo ? (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <User size={20} className="text-orange-500" />
                      <span className="font-bold">{userInfo.name}</span>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <User size={20} className="text-orange-500" />
                      Profile
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <Heart size={20} className="text-red-500" />
                      Yêu thích
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <Package size={20} className="text-orange-500" />
                      Đơn hàng
                    </Link>
                    <Link
                      to="/vouchers"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                      Kho Voucher
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                        navigate("/");
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                    >
                      <LogOut size={20} />
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full bg-black text-white py-3 px-4 rounded-xl font-bold text-center hover:bg-orange-600 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )}

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/news" element={<News />} />
          <Route path="/vouchers" element={<Vouchers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/payment-success" element={<PaymentSuccess />} />
          <Route path="/checkout/payment-cancel" element={<PaymentCancel />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Admin Routes */}
          <Route element={<AdminGuard />}>
            <Route element={<AdminLayoutWrapper />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/products/create" element={<AdminProductForm />} />
              <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/news" element={<AdminNews />} />
              <Route path="/admin/news/create" element={<AdminNewsForm />} />
              <Route path="/admin/news/:id/edit" element={<AdminNewsForm />} />
              <Route path="/admin/vouchers" element={<AdminVouchers />} />
            </Route>
          </Route>
        </Routes>
      </div>

      {/* --- GIỎ HÀNG TRƯỢT (CART DRAWER) --- */}
      {!isAdminRoute && (
        <>
          <div
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsCartOpen(false)}
      ></div>

      <div
        className={`fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[450px] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col rounded-t-3xl sm:rounded-none ${isCartOpen ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-x-full"}`}
        style={{ maxHeight: "95vh" }}
      >
        {/* Drag handle for mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-base font-black flex items-center gap-2">
            <ShoppingCart size={20} /> GIỎ HÀNG
            {cart.length > 0 && (
              <span className="text-xs font-bold text-gray-400">({cart.length})</span>
            )}
          </h2>
          <div className="flex items-center gap-2 sm:gap-3">
            {cart.length > 0 && (
              <div className="flex items-center gap-1.5 mr-1 sm:mr-2">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={
                    selectedItems.length === cart.length && cart.length > 0
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(
                        cart.map(
                          (item) => `${item._id}-${item.size}-${item.color}`,
                        ),
                      );
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                />
                <label
                  htmlFor="selectAll"
                  className="text-[10px] sm:text-xs font-bold text-gray-500 cursor-pointer uppercase"
                >
                  Tất cả
                </label>
              </div>
            )}
            {cart.length > 0 && (
              <button
                onClick={() => {
                  if (selectedItems.length > 0) {
                    if (
                      window.confirm(
                        `Bạn có chắc chắn muốn xóa ${selectedItems.length} sản phẩm đã chọn?`,
                      )
                    ) {
                      removeMultipleFromCart(selectedItems);
                      setSelectedItems([]);
                    }
                  } else {
                    if (
                      window.confirm(
                        "Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ?",
                      )
                    ) {
                      clearCart();
                      setSelectedItems([]);
                    }
                  }
                }}
                className="text-[10px] sm:text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-widest bg-red-50 hover:bg-red-100 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                {selectedItems.length > 0
                  ? `Xóa (${selectedItems.length})`
                  : "Xóa hết"}
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-full transition-all shrink-0"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-12 sm:py-20 opacity-60">
              <ShoppingCart size={60} className="mx-auto mb-4 sm:mb-6" />
              <p className="font-black uppercase text-xs tracking-widest">
                Giỏ hàng trống
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item._id}-${item.size}-${item.color}`}
                className="flex gap-3 sm:gap-4 group border-b border-gray-100 pb-4 sm:pb-6 last:border-0"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(
                      `${item._id}-${item.size}-${item.color}`,
                    )}
                    onChange={(e) => {
                      const key = `${item._id}-${item.size}-${item.color}`;
                      if (e.target.checked) {
                        setSelectedItems((prev) => [...prev, key]);
                      } else {
                        setSelectedItems((prev) =>
                          prev.filter((k) => k !== key),
                        );
                      }
                    }}
                    className="w-5 h-5 sm:w-5 sm:h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                  />
                </div>
                <img
                  src={item.image}
                  alt=""
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-2xl sm:rounded-3xl object-cover border border-gray-100 flex-shrink-0"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/96x96/cccccc/666666?text=Img";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm sm:text-base mb-1 line-clamp-2">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500">Size {item.size} • {item.color}</p>
                  <p className="text-orange-600 font-black text-sm sm:text-base mt-1">
                    {item.price.toLocaleString("vi-VN")}đ
                  </p>
                  <div className="flex justify-between items-center mt-2 sm:mt-3">
                    <div className="flex items-center bg-gray-50 rounded-xl p-1">
                      <button
                        onClick={() =>
                          decreaseQuantity(item._id, item.size, item.color)
                        }
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-white rounded-lg active:scale-95 transition-all"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 sm:px-5 text-xs sm:text-sm font-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToCart({ ...item, quantity: 1 })}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-white rounded-lg active:scale-95 transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        removeFromCart(item._id, item.size, item.color);
                        setSelectedItems((prev) =>
                          prev.filter(
                            (k) =>
                              k !== `${item._id}-${item.size}-${item.color}`,
                          ),
                        );
                      }}
                      className="text-gray-300 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 sm:p-6 border-t bg-gray-50/50 pb-safe sm:pb-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <span className="font-bold text-gray-400 uppercase text-[10px] sm:text-xs tracking-widest">
              Tổng tiền
            </span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900">
              {totalPrice.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              if (!userInfo) {
                navigate("/login");
              } else {
                navigate("/checkout");
              }
            }}
            className={`w-full py-4 sm:py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg ${cart.length > 0 ? "bg-black text-white hover:bg-orange-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
            disabled={cart.length === 0}
          >
            Thanh Toán Ngay
          </button>
        </div>
          </div>

          <Footer />
          <BottomNav userInfo={userInfo} onLogout={logout} hideWhen={isMobileSearchOpen} />
          <BackToTop />
          <ChatWidget />
        </>
      )}
    </div>
  );
}

export default App;
