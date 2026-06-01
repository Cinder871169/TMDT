import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

const footerLinks = {
  shop: [
    { label: "Trang chủ", to: "/" },
    { label: "Sản phẩm", to: "/products" },
    { label: "Tin tức", to: "/news" },
    { label: "Khuyến mãi", to: "/vouchers" },
  ],
  account: [
    { label: "Tài khoản", to: "/profile" },
    { label: "Đơn hàng", to: "/orders" },
    { label: "Yêu thích", to: "/wishlist" },
    { label: "Liên hệ", to: "/contact" },
  ],
};


const brandTags = ["Nike", "Adidas", "Jordan", "Puma"];

const Footer = () => {
  return (
    <footer className="mt-28 border-t border-orange-100 bg-[#fffaf6]">

      <div className="bg-[#17120f] text-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-6 py-12 md:grid-cols-2 lg:grid-cols-12 lg:px-12 lg:py-16">
          <div className="lg:col-span-4">
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-2xl font-black uppercase tracking-tight"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-500 text-sm text-white shadow-[0_12px_30px_rgba(249,115,22,0.35)]">
                SZ
              </span>
              SneakerZone
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-400">
              Cửa hàng sneaker chính hãng với danh mục Nike, Adidas, Jordan và
              các dòng giày thể thao được chọn lọc cho nhu cầu đi học, đi làm và
              luyện tập hằng ngày.
            </p>

            <div className="mt-6 grid max-w-sm grid-cols-2 gap-2 text-xs font-bold text-zinc-300">
              {brandTags.map((brand) => (
                <span
                  key={brand}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2"
                >
                  {brand}
                </span>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-zinc-300 transition-colors hover:border-orange-500 hover:bg-orange-500 hover:text-white"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-zinc-300 transition-colors hover:border-orange-500 hover:bg-orange-500 hover:text-white"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <nav className="lg:col-span-2">
            <h3 className="text-xs font-black uppercase tracking-[0.18em] !text-white">
              Mua sắm
            </h3>
            <ul className="mt-5 space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm font-semibold text-zinc-300 transition-colors hover:text-orange-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="lg:col-span-2">
            <h3 className="text-xs font-black uppercase tracking-[0.18em] !text-white">
              Hỗ trợ
            </h3>
            <ul className="mt-5 space-y-3">
              {footerLinks.account.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm font-semibold text-zinc-300 transition-colors hover:text-orange-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <h3 className="text-xs font-black uppercase tracking-[0.18em] !text-white">
              Liên hệ
            </h3>
            <div className="mt-5 space-y-3 text-sm text-zinc-300">
              <div className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-orange-300" />
                <span>4 ngõ 58/67 Thanh Bình, Mộ Lao, Hà Đông, Hà Nội</span>
              </div>
              <a
                href="tel:+84988888888"
                className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 transition-colors hover:border-orange-400 hover:text-orange-300"
              >
                <Phone size={18} className="shrink-0 text-orange-300" />
                <span>+84 988 888 888</span>
              </a>
              <a
                href="mailto:support@sneakerzone.online"
                className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 transition-colors hover:border-orange-400 hover:text-orange-300"
              >
                <Mail size={18} className="shrink-0 text-orange-300" />
                <span>support@sneakerzone.online</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/15">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-6 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between lg:px-12">
            <p>© 2026 SneakerZone. Tất cả quyền được bảo lưu.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a href="#" className="transition-colors hover:text-orange-300">
                Điều khoản
              </a>
              <a href="#" className="transition-colors hover:text-orange-300">
                Bảo mật
              </a>
              <a href="#" className="transition-colors hover:text-orange-300">
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
