import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Sparkles, Zap } from "lucide-react";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const slides = [
    {
      title: "Đón đầu trends giày thể thao 2026",
      subtitle: "Giảm giá mùa hè 30% + Freeship toàn quốc",
      description:
        "Bước vào bộ sưu tập mới nhất: từ sneakers đường phố đến performance shoes cao cấp.",
      cta: "Mua ngay",
      image: "/hero.jpg",
    },
    {
      title: "Bộ sưu tập Limited Edition",
      subtitle: "Chỉ còn 50 đôi cuối cùng",
      description:
        "Những mẫu giày exclusive chỉ có tại SneakerZone với thiết kế độc đáo.",
      cta: "Khám phá ngay",
      image: "/hero2.png",
    },
  ];

  useEffect(() => {
    setIsVisible(true);

    // Auto slide change
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const scrollToProducts = () => {
    const productsSection = document.getElementById("products-section");
    productsSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-[520px] sm:h-[600px] rounded-[3rem] overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-black text-white flex items-center justify-center mb-16">
      {/* Background Images */}
      {slides.map((slide, index) => (
        <img
          key={index}
          src={slide.image}
          className={`absolute inset-0 w-full h-full object-cover opacity-35 transform scale-110 transition-all duration-1000 ${
            index === currentSlide
              ? "opacity-35 scale-110"
              : "opacity-0 scale-100"
          }`}
          alt={`Hero ${index + 1}`}
        />
      ))}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-bounce">
        <Sparkles className="text-orange-400 w-8 h-8 opacity-60" />
      </div>
      <div className="absolute top-32 right-16 animate-pulse">
        <Zap className="text-yellow-400 w-6 h-6 opacity-60" />
      </div>
      <div className="absolute bottom-32 left-20 animate-bounce delay-1000">
        <Sparkles className="text-blue-400 w-6 h-6 opacity-60" />
      </div>

      {/* Main Content */}
      <div
        className={`relative text-center px-6 sm:px-12 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-orange-500 scale-125"
                  : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          <small
            className={`inline-block uppercase tracking-widest text-sm text-orange-300 mb-3 px-4 py-2 bg-orange-500/10 rounded-full border border-orange-500/20 transition-all duration-700 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {slides[currentSlide].subtitle}
          </small>

          <h1
            className={`text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-5 transition-all duration-700 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {slides[currentSlide].title}
          </h1>

          <p
            className={`text-base sm:text-lg text-slate-100 max-w-2xl mx-auto mb-8 transition-all duration-700 delay-500 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {slides[currentSlide].description}
          </p>

          <div
            className={`flex flex-col sm:flex-row justify-center gap-4 transition-all duration-700 delay-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <Link
              to="/products"
              className="group bg-orange-500 hover:bg-orange-400 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/40 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {slides[currentSlide].cta}
            </Link>
            <button
              onClick={scrollToProducts}
              className="border-2 border-white/60 hover:border-white text-white px-8 py-4 rounded-full font-bold transition-all duration-300 hover:bg-white hover:text-black hover:scale-105"
            >
              Xem bộ sưu tập
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <button
          onClick={scrollToProducts}
          className="text-white/60 hover:text-white transition-colors"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Custom animations */}
      <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float { animation: float 3s ease-in-out infinite; }
            `}</style>
    </section>
  );
}
