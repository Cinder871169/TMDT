import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import {
  ShoppingCart,
  Star,
  Flame,
  X,
  Plus,
  Minus,
  Trash2,
  User,
  LogOut,
  Package,
  Settings,
  Search,
  CheckCircle,
  ShoppingBag,
  Heart,
} from "lucide-react";

import { useCartStore } from "./store/useCartStore";
import { useAuthStore } from "./store/useAuthStore";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Order";
import OrderDetail from "./pages/OrderDetail";
import OrderSuccess from "./pages/OrderSuccess";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminStats from "./pages/admin/AdminStats";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminNews from "./pages/admin/AdminNews";
import Checkout from "./pages/Checkout";
import Products from "./pages/Products";
import News from "./pages/News";
import Contact from "./pages/Contact";
import BlogDetail from "./pages/BlogDetails";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Sidebar from "./components/Sidebar";
import Newsletter from "./components/Newsletter";
import Hero from "./components/HeroBanner";
import ProductCard from "./components/ProductCard";
import Categories from "./components/Categories";
import Trending from "./components/Trending";

const ProductSkeleton = () => (
  <div className="flex flex-col animate-pulse bg-white p-4 rounded-[2rem]">
    <div className="h-64 rounded-2xl bg-gray-100 mb-6"></div>
    <div className="space-y-3">
      <div className="h-5 bg-gray-100 rounded-lg w-3/4"></div>
      <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
    </div>
  </div>
);

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword] = useState("");
  const [brand, setBrand] = useState("Tất cả");
  const [priceRange, setPriceRange] = useState(10000000);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(
          `/api/products?keyword=${keyword}&brand=${brand}`,
        );
        const filtered = data.filter((p) => p.price <= priceRange);
        setProducts(filtered);
        setTimeout(() => setLoading(false), 500);
      } catch {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, brand, priceRange]);

  return (
    <main className="max-w-[1440px] mx-auto px-6 py-10">
      <Hero />
      <Categories />
      <Trending />
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3">
          <div className="sticky top-28">
            <Sidebar
              brand={brand}
              setBrand={setBrand}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </div>
        </div>
        <div className="lg:col-span-9">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading
              ? [...Array(6)].map((_, i) => <ProductSkeleton key={i} />)
              : products.map((shoe) => (
                  <ProductCard key={shoe._id} product={shoe} />
                ))}
          </div>
          <Newsletter />
        </div>
      </div>
    </main>
  );
}

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { userInfo, logout } = useAuthStore();
  const navigate = useNavigate();
  const { cart, addToCart, decreaseQuantity, removeFromCart, hydrateCart } =
    useCartStore();

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
    <div className="min-h-screen bg-[#fcfcfc] font-sans text-gray-900 flex flex-col">
      <Toaster position="bottom-right" />

      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-sm py-6 px-12 flex justify-between items-center sticky top-0 z-40 border-b border-gray-100/50">
        <Link
          to="/"
          className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2 group"
        >
          <Flame
            className="text-orange-600 group-hover:rotate-12 transition-transform duration-500"
            size={32}
          />{" "}
          SneakerZone
        </Link>
        <div className="hidden md:flex items-center gap-10 text-sm font-bold uppercase">
          <Link to="/" className="hover:text-orange-600 transition-colors">
            Trang chủ
          </Link>

          <Link
            to="/products"
            className="hover:text-orange-600 transition-colors"
          >
            Sản phẩm
          </Link>

          <Link to="/news" className="hover:text-orange-600 transition-colors">
            Tin tức
          </Link>

          <Link
            to="/contact"
            className="hover:text-orange-600 transition-colors"
          >
            Liên hệ
          </Link>
        </div>
        <div className="flex items-center gap-10">
          {userInfo ? (
            <div className="group relative py-2">
              <div className="flex items-center gap-3 cursor-pointer font-black text-[10px] uppercase tracking-[0.2em] bg-zinc-950 text-white px-7 py-3 rounded-full">
                <User size={14} /> {userInfo.name}
              </div>
              <div className="hidden group-hover:block absolute top-full right-0 pt-3 w-64 animate-in fade-in slide-in-from-top-2">
                <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-2xl p-2">
                  {userInfo && !userInfo.isAdmin && (
                    <Link
                      to="/profile"
                      className="flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase hover:bg-gray-50 rounded-2xl"
                    >
                      <User size={18} className="text-orange-500" /> Profile
                    </Link>
                  )}
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
                  {userInfo && userInfo.isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 rounded-2xl text-blue-600 transition-colors"
                    >
                      <Settings size={18} /> Quản trị hệ thống
                    </Link>
                  )}
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
              className="text-[10px] font-black uppercase hover:text-orange-600"
            >
              Đăng nhập
            </Link>
          )}

          {/* NÚT GIỎ HÀNG - QUAN TRỌNG NHẤT */}
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

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/news" element={<News />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminStats />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="news" element={<AdminNews />} />
          </Route>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>
      </div>

      {/* --- GIỎ HÀNG TRƯỢT (CART DRAWER) --- */}
      {/* Overlay: Nền đen mờ khi mở giỏ hàng */}
      <div
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-500 ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Drawer: Phần nội dung trượt ra */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[70] shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <ShoppingCart size={28} /> GIỎ HÀNG
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-200 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {cart.length === 0 ? (
            <div className="text-center py-20 opacity-20">
              <ShoppingCart size={80} className="mx-auto mb-6" />
              <p className="font-black uppercase text-xs tracking-widest">
                Giỏ hàng trống
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item._id}-${item.size}-${item.color}`}
                className="flex gap-6 group border-b border-gray-50 pb-8 last:border-0"
              >
                <img
                  src={item.image}
                  alt=""
                  className="w-24 h-24 bg-gray-50 rounded-3xl object-cover border border-gray-100"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm mb-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500">Size: {item.size}</p>

                  <p className="text-xs text-gray-500">Color: {item.color}</p>
                  <p className="text-orange-600 font-black mb-4">
                    {item.price.toLocaleString("vi-VN")}đ
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center bg-gray-50 rounded-xl p-1">
                      <button
                        onClick={() =>
                          decreaseQuantity(item._id, item.size, item.color)
                        }
                        className="p-1.5 hover:bg-white rounded-lg"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-5 text-xs font-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="p-1.5 hover:bg-white rounded-lg"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        removeFromCart(item._id, item.size, item.color)
                      }
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-10 border-t bg-gray-50/50">
          <div className="flex justify-between items-center mb-8">
            <span className="font-bold text-gray-400 uppercase text-xs tracking-widest">
              Tổng tiền
            </span>
            <span className="text-3xl font-black text-gray-900">
              {totalPrice.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <button
            onClick={() => {
              if (!userInfo) {
                navigate("/login");
              } else {
                navigate("/checkout");
              }
            }}
            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl ${cart.length > 0 ? "bg-black text-white hover:bg-orange-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
            disabled={cart.length === 0}
          >
            Thanh Toán Ngay
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-zinc-950 text-white pt-24 pb-12 px-12 mt-32 rounded-t-[4rem]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-black uppercase italic">
            SneakerZone
          </div>
          <p className="text-[10px] text-zinc-700 font-black uppercase">
            © 2026 SneakerZone Studio.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
