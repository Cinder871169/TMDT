import React, { useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

const ImageZoom = ({ images = [], activeIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(activeIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    resetZoom();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    resetZoom();
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    if (scale === 1) {
      setStartPos({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || scale !== 1) return;

    const diffX = e.touches[0].clientX - startPos.x;
    const diffY = e.touches[0].clientY - startPos.y;

    // Swipe left/right to change image
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const newScale = Math.min(Math.max(1, scale + delta), 3);
    setScale(newScale);
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  // Double tap to zoom
  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      resetZoom();
    }
  };

  // Pan when zoomed
  const handleMouseDown = (e) => {
    if (scale > 1) {
      e.preventDefault();
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (scale > 1 && startPos.x !== 0) {
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      });
    }
  };

  const handleMouseUp = () => {
    setStartPos({ x: 0, y: 0 });
  };

  if (images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm font-medium opacity-80">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors active:scale-95"
          aria-label="Đóng"
        >
          <X size={24} />
        </button>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden cursor-zoom-in"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={images[currentIndex]}
          alt={`Hình ảnh ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          }}
          draggable={false}
        />
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
        <ZoomIn size={16} className="text-white/80" />
        <span className="text-white/80 text-sm font-medium">
          {Math.round(scale * 100)}%
        </span>
        {scale > 1 && (
          <button
            onClick={resetZoom}
            className="text-white/60 hover:text-white text-sm ml-2"
          >
            Reset
          </button>
        )}
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors active:scale-95"
            aria-label="Hình trước"
          >
            <ChevronLeft size={28} className="text-white" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors active:scale-95"
            aria-label="Hình sau"
          >
            <ChevronRight size={28} className="text-white" />
          </button>
        </>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 p-4 overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                resetZoom();
              }}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                currentIndex === index
                  ? "border-orange-500 opacity-100"
                  : "border-white/20 opacity-50 hover:opacity-80"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .fixed.inset-0 {
            touch-action: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ImageZoom;
