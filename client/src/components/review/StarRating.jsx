import { useState } from "react";

const StarRating = ({ rating, setRating }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1 text-2xl">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={() => setRating && setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className={`cursor-pointer transition-colors duration-200 ${star <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
                        } hover:scale-110`}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;