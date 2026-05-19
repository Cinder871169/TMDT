import { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({ rating, setRating }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1.5 items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hover || rating);
        return (
          <button
            key={star}
            type="button"
            onClick={() => setRating && setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none transition-transform active:scale-95 duration-100"
          >
            <Star
              size={26}
              className={`transition-all duration-250 ${
                isActive
                  ? "fill-orange-500 text-orange-500 scale-110 drop-shadow-md"
                  : "text-gray-200 hover:text-gray-300"
              }`}
            />
          </button>
        );
      })}
      {rating > 0 && (
        <span className="text-xs font-bold text-orange-600 ml-2 animate-fade-in">
          {rating === 5 ? "Rất tốt 🏆" :
           rating === 4 ? "Tốt 👍" :
           rating === 3 ? "Bình thường 👌" :
           rating === 2 ? "Không tốt lắm 👎" :
                          "Rất tệ 😢"}
        </span>
      )}
    </div>
  );
}