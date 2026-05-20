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
    <footer className="bg-zinc-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-12 px-6 mt-32 rounded-t-[3rem] lg:rounded-t-[4rem]">
      <div className="max-w-7xl mx-auto">
        {/* Mobile View - Collapsible Accordion */}
        <div className="lg:hidden">
          {/* Brand Section */}
          <div className="mb-6">
            <Link
              to="/"
              className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2 group"
            >
              <Flame
                className="text-orange-600 group-hover:rotate-12 transition-transform duration-500"
                size={28}
              />
              SneakerZone
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed mt-4">
              Cửa hàng giày sneaker hàng đầu Việt Nam. Chất lượng cao, giá cả phải chăng.
            </p>
            {/* Social icons - mobile */}
            <div className="flex space-x-3 mt-4">
              <a href="#" className="w-10 h-10 bg-zinc-800 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-zinc-800 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Collapsible Sections */}
          <div className="border-t border-zinc-800 -mx-6 px-6">
            {/* Liên Kết Nhanh */}
            <div className="border-b border-zinc-800">
              <button
                onClick={() => toggleSection("links")}
                className="flex items-center justify-between w-full py-4 active:bg-zinc-800"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider">Liên Kết Nhanh</h3>
                {expandedSections.links ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSections.links && (
                <ul className="space-y-3 pb-4 animate-in slide-in-from-top-2">
                  <li>
                    <Link to="/" className="text-zinc-400 hover:text-orange-600 transition-colors text-sm">
                      Trang Chủ
                    </Link>
                  </li>
                  <li>
                    <Link to="/products" className="text-zinc-400 hover:text-orange-600 transition-colors text-sm">
                      Sản Phẩm
                    </Link>
                  </li>
                  <li>
                    <Link to="/news" className="text-zinc-400 hover:text-orange-600 transition-colors text-sm">
                      Tin Tức
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-zinc-400 hover:text-orange-600 transition-colors text-sm">
                      Liên Hệ
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            {/* Hỗ Trợ Khách Hàng */}
            <div className="border-b border-zinc-800">
              <button
                onClick={() => toggleSection("support")}
                className="flex items-center justify-between w-full py-4 active:bg-zinc-800"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider">Hỗ Trợ</h3>
                {expandedSections.support ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSections.support && (
                <ul className="space-y-3 pb-4 animate-in slide-in-from-top-2">
                  <li>
                    <Link to="/profile" className="text-zinc-400 hover:text-orange-600 transition-colors text-sm">
                      Tài Khoản
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" className="text-zinc-400 hover:text-orange-600 transition-colors text-sm">
                      Đơn Hàng
                    </Link>
                  </li>
                  <li>
                    <Link to="/wishlist" className="text-zinc-400 hover:text-orange-600 transition-colors text-sm">
                      Yêu Thích
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-zinc-400 hover:text-orange-600 transition-colors text-sm">
                      Chính Sách Đổi Trả
                    </a>
                  </li>
                </ul>
              )}
            </div>

            {/* Liên Hệ */}
            <div className="border-b border-zinc-800">
              <button
                onClick={() => toggleSection("contact")}
                className="flex items-center justify-between w-full py-4 active:bg-zinc-800"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider">Liên Hệ</h3>
                {expandedSections.contact ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSections.contact && (
                <div className="space-y-4 pb-4 animate-in slide-in-from-top-2">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-400 text-sm">
                      4 ngõ 58/67 Thanh Bình, Mộ Lao, Hà Đông, Hà Nội
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-orange-600 flex-shrink-0" />
                    <a href="tel:+84988888888" className="text-zinc-400 text-sm hover:text-orange-600">
                      +84 988 888 888
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-orange-600 flex-shrink-0" />
                    <a href="mailto:support@sneakerzone.vn" className="text-zinc-400 text-sm hover:text-orange-600">
                      support@sneakerzone.vn
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
                className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2 group"
              >
                <Flame
                  className="text-orange-600 group-hover:rotate-12 transition-transform duration-500"
                  size={32}
                />
                SneakerZone
              </Link>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Cửa hàng giày sneaker hàng đầu Việt Nam. Chất lượng cao, giá cả phải chăng,
                trải nghiệm mua sắm tuyệt vời.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-zinc-800 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors">
                  <Facebook size={18} />
                </a>
                <a href="#" className="w-10 h-10 bg-zinc-800 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors">
                  <Instagram size={18} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold uppercase tracking-wider">Liên Kết Nhanh</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-zinc-400 hover:text-orange-600 transition-colors">
                    Trang Chủ
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-zinc-400 hover:text-orange-600 transition-colors">
                    Sản Phẩm
                  </Link>
                </li>
                <li>
                  <Link to="/news" className="text-zinc-400 hover:text-orange-600 transition-colors">
                    Tin Tức
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-zinc-400 hover:text-orange-600 transition-colors">
                    Liên Hệ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold uppercase tracking-wider">Hỗ Trợ Khách Hàng</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/profile" className="text-zinc-400 hover:text-orange-600 transition-colors">
                    Tài Khoản
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="text-zinc-400 hover:text-orange-600 transition-colors">
                    Đơn Hàng
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="text-zinc-400 hover:text-orange-600 transition-colors">
                    Yêu Thích
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-zinc-400 hover:text-orange-600 transition-colors">
                    Chính Sách Đổi Trả
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold uppercase tracking-wider">Liên Hệ</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-orange-600 flex-shrink-0" />
                  <span className="text-zinc-400 text-sm">
                    4 ngõ 58/67 Thanh Bình, Mộ Lao, Hà Đông, Hà Nội
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-orange-600 flex-shrink-0" />
                  <span className="text-zinc-400 text-sm">+84 988 888 888</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-orange-600 flex-shrink-0" />
                  <span className="text-zinc-400 text-sm">support@sneakerzone.vn</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-zinc-800 pt-6 lg:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-zinc-500 text-xs lg:text-sm">
              © 2026 SneakerZone Studio. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-4 lg:space-x-6 text-xs lg:text-sm">
              <a href="#" className="text-zinc-500 hover:text-orange-600 transition-colors">
                Điều Khoản
              </a>
              <a href="#" className="text-zinc-500 hover:text-orange-600 transition-colors">
                Bảo Mật
              </a>
              <a href="#" className="text-zinc-500 hover:text-orange-600 transition-colors">
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
