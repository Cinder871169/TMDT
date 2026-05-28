import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Mail, Phone, MapPin, Facebook, Instagram, ChevronDown, ChevronUp } from "lucide-react";

const Footer = () => {
  const [expandedSections, setExpandedSections] = useState({
    links: false,
    support: false,
    contact: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <footer className="bg-gradient-to-b from-[#111215] to-[#08090a] text-zinc-100 pt-16 pb-24 lg:pt-24 lg:pb-12 px-6 mt-32 rounded-t-[3rem] lg:rounded-t-[4rem] border-t border-white/[0.03]">
      <div className="max-w-7xl mx-auto">
        {/* Mobile View - Collapsible Accordion */}
        <div className="lg:hidden">
          {/* Brand Section */}
          <div className="mb-6">
            <Link
              to="/"
              className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2 group text-white"
            >
              <Flame
                className="text-orange-500 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500"
                size={28}
              />
              SneakerZone
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed mt-4">
              Cửa hàng giày sneaker hàng đầu Việt Nam. Chất lượng cao, giá cả phải chăng.
            </p>
            {/* Social icons - mobile */}
            <div className="flex space-x-3 mt-4">
              <a href="#" className="w-10 h-10 bg-white/5 hover:bg-orange-500 hover:shadow-[0_0_12px_rgba(249,115,22,0.4)] text-zinc-300 hover:text-white rounded-full flex items-center justify-center transition-all duration-300">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 hover:bg-orange-500 hover:shadow-[0_0_12px_rgba(249,115,22,0.4)] text-zinc-300 hover:text-white rounded-full flex items-center justify-center transition-all duration-300">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Collapsible Sections */}
          <div className="border-t border-white/[0.05] -mx-6 px-6">
            {/* Liên Kết Nhanh */}
            <div className="border-b border-white/[0.05]">
              <button
                onClick={() => toggleSection("links")}
                className="flex items-center justify-between w-full py-4 active:bg-white/5"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">Liên Kết Nhanh</h3>
                {expandedSections.links ? <ChevronUp size={20} className="text-orange-500" /> : <ChevronDown size={20} className="text-zinc-400" />}
              </button>
              {expandedSections.links && (
                <ul className="space-y-3 pb-4 animate-in slide-in-from-top-2">
                  <li>
                    <Link to="/" className="text-zinc-400 hover:text-orange-400 transition-colors text-sm">
                      Trang Chủ
                    </Link>
                  </li>
                  <li>
                    <Link to="/products" className="text-zinc-400 hover:text-orange-400 transition-colors text-sm">
                      Sản Phẩm
                    </Link>
                  </li>
                  <li>
                    <Link to="/news" className="text-zinc-400 hover:text-orange-400 transition-colors text-sm">
                      Tin Tức
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-zinc-400 hover:text-orange-400 transition-colors text-sm">
                      Liên Hệ
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            {/* Hỗ Trợ Khách Hàng */}
            <div className="border-b border-white/[0.05]">
              <button
                onClick={() => toggleSection("support")}
                className="flex items-center justify-between w-full py-4 active:bg-white/5"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">Hỗ Trợ</h3>
                {expandedSections.support ? <ChevronUp size={20} className="text-orange-500" /> : <ChevronDown size={20} className="text-zinc-400" />}
              </button>
              {expandedSections.support && (
                <ul className="space-y-3 pb-4 animate-in slide-in-from-top-2">
                  <li>
                    <Link to="/profile" className="text-zinc-400 hover:text-orange-400 transition-colors text-sm">
                      Tài Khoản
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" className="text-zinc-400 hover:text-orange-400 transition-colors text-sm">
                      Đơn Hàng
                    </Link>
                  </li>
                  <li>
                    <Link to="/wishlist" className="text-zinc-400 hover:text-orange-400 transition-colors text-sm">
                      Yêu Thích
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-zinc-400 hover:text-orange-400 transition-colors text-sm">
                      Chính Sách Đổi Trả
                    </a>
                  </li>
                </ul>
              )}
            </div>

            {/* Liên Hệ */}
            <div className="border-b border-white/[0.05]">
              <button
                onClick={() => toggleSection("contact")}
                className="flex items-center justify-between w-full py-4 active:bg-white/5"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">Liên Hệ</h3>
                {expandedSections.contact ? <ChevronUp size={20} className="text-orange-500" /> : <ChevronDown size={20} className="text-zinc-400" />}
              </button>
              {expandedSections.contact && (
                <div className="space-y-4 pb-4 animate-in slide-in-from-top-2">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-400 text-sm">
                      4 ngõ 58/67 Thanh Bình, Mộ Lao, Hà Đông, Hà Nội
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-orange-500 flex-shrink-0" />
                    <a href="tel:+84988888888" className="text-zinc-400 text-sm hover:text-orange-400">
                      +84 988 888 888
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-orange-500 flex-shrink-0" />
                    <a href="mailto:support@sneakerzone.online" className="text-zinc-400 text-sm hover:text-orange-400">
                      support@sneakerzone.online
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop View - Full Grid Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="space-y-6">
              <Link
                to="/"
                className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2 group text-white"
              >
                <Flame
                  className="text-orange-500 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500"
                  size={32}
                />
                SneakerZone
              </Link>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Cửa hàng giày sneaker hàng đầu Việt Nam. Chất lượng cao, giá cả phải chăng,
                trải nghiệm mua sắm tuyệt vời.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.45)] text-zinc-300 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <Facebook size={18} />
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.45)] text-zinc-300 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <Instagram size={18} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-base font-bold uppercase tracking-wider text-white">Liên Kết Nhanh</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-zinc-400 hover:text-orange-400 hover:translate-x-1 inline-block transition-all duration-200">
                    Trang Chủ
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-zinc-400 hover:text-orange-400 hover:translate-x-1 inline-block transition-all duration-200">
                    Sản Phẩm
                  </Link>
                </li>
                <li>
                  <Link to="/news" className="text-zinc-400 hover:text-orange-400 hover:translate-x-1 inline-block transition-all duration-200">
                    Tin Tức
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-zinc-400 hover:text-orange-400 hover:translate-x-1 inline-block transition-all duration-200">
                    Liên Hệ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="space-y-6">
              <h3 className="text-base font-bold uppercase tracking-wider text-white">Hỗ Trợ Khách Hàng</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/profile" className="text-zinc-400 hover:text-orange-400 hover:translate-x-1 inline-block transition-all duration-200">
                    Tài Khoản
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="text-zinc-400 hover:text-orange-400 hover:translate-x-1 inline-block transition-all duration-200">
                    Đơn Hàng
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="text-zinc-400 hover:text-orange-400 hover:translate-x-1 inline-block transition-all duration-200">
                    Yêu Thích
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-zinc-400 hover:text-orange-400 hover:translate-x-1 inline-block transition-all duration-200">
                    Chính Sách Đổi Trả
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-base font-bold uppercase tracking-wider text-white">Liên Hệ</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 group/contact">
                  <MapPin size={18} className="text-orange-500 group-hover/contact:text-orange-400 transition-colors flex-shrink-0" />
                  <span className="text-zinc-400 text-sm group-hover/contact:text-zinc-200 transition-colors">
                    4 ngõ 58/67 Thanh Bình, Mộ Lao, Hà Đông, Hà Nội
                  </span>
                </div>
                <div className="flex items-center gap-3 group/contact">
                  <Phone size={18} className="text-orange-500 group-hover/contact:text-orange-400 transition-colors flex-shrink-0" />
                  <span className="text-zinc-400 text-sm group-hover/contact:text-zinc-200 transition-colors">+84 988 888 888</span>
                </div>
                <div className="flex items-center gap-3 group/contact">
                  <Mail size={18} className="text-orange-500 group-hover/contact:text-orange-400 transition-colors flex-shrink-0" />
                  <span className="text-zinc-400 text-sm group-hover/contact:text-zinc-200 transition-colors">support@sneakerzone.online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/[0.05] pt-6 lg:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-zinc-500 text-xs lg:text-sm">
              © 2026 SneakerZone Studio. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-4 lg:space-x-6 text-xs lg:text-sm">
              <a href="#" className="text-zinc-500 hover:text-orange-400 transition-colors">
                Điều Khoản
              </a>
              <a href="#" className="text-zinc-500 hover:text-orange-400 transition-colors">
                Bảo Mật
              </a>
              <a href="#" className="text-zinc-500 hover:text-orange-400 transition-colors">
                Cookie
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
