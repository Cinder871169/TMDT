import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down 300px
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <button
        onClick={scrollToTop}
        className={`fixed right-4 sm:right-6 bottom-20 sm:bottom-6 z-40 w-12 h-12 bg-white border border-gray-100 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-orange-50 hover:border-orange-200 hover:shadow-xl active:scale-95 ${isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        aria-label="Cuộn lên đầu trang"
        style={{
          bottom: isVisible ? "calc(80px + env(safe-area-inset-bottom, 8px))" : "24px",
        }}
      >
        <ChevronUp
          size={24}
          className="text-gray-600 hover:text-orange-600 transition-colors"
        />
      </button>

      <style>{`
        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Hide scrollbar but keep functionality on mobile */
        @media (max-width: 768px) {
          ::-webkit-scrollbar {
            width: 4px;
          }
          ::-webkit-scrollbar-thumb {
            background: #f97316;
            border-radius: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default BackToTop;
