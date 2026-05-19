import { useEffect } from "react";
import { useReviewStore } from "../../store/reviewStore";
import { Star, Award, Calendar } from "lucide-react";

export default function ReviewList({ productId }) {
  const { reviews, fetchReviews, loading } = useReviewStore();

  useEffect(() => {
    fetchReviews(productId);
  }, [productId, fetchReviews]);

  if (loading) {
    return (
      <div className="mt-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gray-100 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 bg-gray-100 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded w-16" />
              </div>
            </div>
            <div className="h-4 bg-gray-100 rounded w-full mb-1" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  // If there are no reviews, we return null because RatingSummary already shows "No reviews yet"
  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
        Nhận xét gần đây ({reviews.length})
      </h3>
      <div className="space-y-3">
        {reviews.map((r) => {
          const userName = r.user?.name || "Khách hàng SneakerZone";
          const firstChar = userName.charAt(0).toUpperCase();
          const reviewDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : "";

          return (
            <div key={r._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-orange-100/40">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-orange-500/10 flex-shrink-0">
                  {firstChar}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-gray-800">
                        {userName}
                      </span>
                      {/* Verified Badge */}
                      <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-100/50">
                        <Award size={10} className="fill-emerald-600/10" /> Đã mua hàng
                      </span>
                    </div>

                    {/* Date */}
                    {reviewDate && (
                      <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                        <Calendar size={10} /> {reviewDate}
                      </span>
                    )}
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={star <= r.rating ? "fill-orange-500 text-orange-500" : "text-gray-200"}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-gray-600 leading-relaxed break-words bg-gray-50 rounded-xl p-2.5 mt-1">
                    {r.comment}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}