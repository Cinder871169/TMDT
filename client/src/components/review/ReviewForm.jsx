import { useState } from "react";
import { useReviewStore } from "../../store/reviewStore";
import StarRating from "./StarRating";
import toast from "react-hot-toast";

const ReviewForm = ({ productId }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const { addReview } = useReviewStore();

    const handleSubmit = async () => {
        if (!rating) return toast.error("Chọn số sao");
        if (!comment.trim()) return toast.error("Nhập nội dung");

        setLoading(true);
        try {
            await addReview({ rating, comment: comment.trim(), productId });

            toast.success("Đã gửi đánh giá");

            setRating(0);
            setComment("");
        } catch (err) {
            toast.error(err.message || "Lỗi khi gửi đánh giá");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border mt-6">
            <h3 className="text-lg font-semibold mb-4">Viết đánh giá của bạn</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đánh giá:
                </label>
                <StarRating rating={rating} setRating={setRating} />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bình luận:
                </label>
                <textarea
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={loading}
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
            >
                {loading ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
        </div>
    );
};

export default ReviewForm;