import { useState, useEffect } from "react";
import { useReviewStore } from "../../store/reviewStore";
import { useAuthStore } from "../../store/useAuthStore";
import StarRating from "./StarRating";
import toast from "react-hot-toast";
import { AlertCircle, CheckCircle2, Lock, MessageSquarePlus } from "lucide-react";

export default function ReviewForm({ productId }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { userInfo } = useAuthStore();
  const { eligibility, fetchEligibility, addReview } = useReviewStore();

  useEffect(() => {
    if (userInfo && productId) {
      fetchEligibility(productId);
    }
  }, [productId, userInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error("Vui lòng chọn số sao đánh giá!");
    if (!comment.trim()) return toast.error("Vui lòng viết bình luận!");

    setSubmitting(true);
    try {
      await addReview({ rating, comment: comment.trim(), productId });
      toast.success("Đánh giá của bạn đã được gửi thành công!");
      setRating(0);
      setComment("");
    } catch (err) {
      toast.error(err.message || "Lỗi khi gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  // State 1: Chưa đăng nhập
  if (!userInfo) {
    return (
      <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 text-center mt-6">
        <Lock className="w-8 h-8 text-orange-500 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-gray-800 mb-1">Đăng nhập để đánh giá</h4>
        <p className="text-xs text-gray-500 mb-3">Chỉ những khách hàng đã mua sản phẩm này mới có thể viết đánh giá.</p>
        <a
          href="/login"
          className="inline-flex items-center justify-center bg-black hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all duration-200"
        >
          Đăng nhập ngay
        </a>
      </div>
    );
  }

  // State 2: Đang tải trạng thái xác thực
  if (eligibility === null) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-6 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/4 mb-3" />
        <div className="h-24 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  // State 3: Đã mua nhưng đã đánh giá rồi
  if (eligibility.hasReviewed) {
    return (
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 text-center mt-6 flex flex-col items-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
        <h4 className="text-sm font-bold text-gray-800 mb-1">Cảm ơn bạn đã phản hồi!</h4>
        <p className="text-xs text-gray-500">Bạn đã gửi đánh giá cho sản phẩm này rồi. Đóng góp của bạn giúp ích rất nhiều cho cộng đồng!</p>
      </div>
    );
  }

  // State 4: Chưa mua sản phẩm này hoặc đơn hàng chưa hoàn thành
  if (!eligibility.hasPurchased) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center mt-6">
        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-gray-800 mb-1">Chưa thể đánh giá</h4>
        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
          Bạn chỉ có thể đánh giá sản phẩm này sau khi đơn hàng của bạn được cập nhật trạng thái <strong className="text-orange-600">"Đã giao hàng"</strong> thành công.
        </p>
      </div>
    );
  }

  // State 5: Có thể đánh giá!
  return (
    <div className="bg-white rounded-2xl border border-orange-100/50 shadow-sm shadow-orange-500/5 p-5 lg:p-6 mt-6">
      <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
        <MessageSquarePlus className="w-4 h-4 text-orange-500" /> Viết đánh giá của bạn
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Chọn số sao */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Đánh giá chất lượng sản phẩm
          </label>
          <StarRating rating={rating} setRating={setRating} />
        </div>

        {/* Nội dung bình luận */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Chia sẻ trải nghiệm chi tiết
          </label>
          <textarea
            className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all resize-none min-h-[90px] placeholder-gray-400"
            placeholder="Giày có vừa chân không? Chất liệu thế nào? Hãy viết một vài câu chia sẻ thực tế nhé..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="bg-black hover:bg-orange-500 disabled:bg-gray-400 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all duration-200 shadow-md active:scale-98 flex items-center justify-center gap-2"
        >
          {submitting ? "Đang gửi..." : "Gửi đánh giá thực tế"}
        </button>
      </form>
    </div>
  );
}