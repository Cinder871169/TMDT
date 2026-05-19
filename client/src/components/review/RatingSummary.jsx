import { useEffect } from "react";
import { useReviewStore } from "../../store/reviewStore";
import { Star, MessageSquare } from "lucide-react";

export default function RatingSummary({ productId }) {
  const { summary, fetchSummary } = useReviewStore();

  useEffect(() => {
    fetchSummary(productId);
  }, [productId, fetchSummary]);

  if (!summary) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 animate-pulse flex gap-4">
        <div className="w-24 h-24 bg-gray-100 rounded-2xl" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    );
  }

  const average = summary.average ? summary.average.toFixed(1) : "0.0";
  const total = summary.total || 0;
  const breakdown = summary.breakdown || {};

  // If there are no reviews yet
  if (total === 0) {
    return (
      <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 text-center">
        <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-gray-800 mb-1">Chưa có đánh giá nào</h4>
        <p className="text-xs text-gray-400">Hãy là người đầu tiên mua hàng và chia sẻ đánh giá về sản phẩm này!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        {/* Điểm trung bình */}
        <div className="text-center sm:border-r border-gray-100 sm:pr-8 flex-shrink-0">
          <div className="text-5xl font-black text-gray-900 tracking-tight mb-1">{average}</div>
          <div className="flex justify-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= Math.round(Number(average));
              return (
                <Star
                  key={star}
                  size={16}
                  className={active ? "fill-orange-500 text-orange-500" : "text-gray-200"}
                />
              );
            })}
          </div>
          <div className="text-xs text-gray-400 font-semibold">{total} nhận xét từ khách hàng</div>
        </div>

        {/* Cột breakdown */}
        <div className="flex-1 w-full space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[star] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs text-gray-500 font-semibold">
                <span className="w-3 text-right">{star}</span>
                <Star size={12} className="fill-orange-500 text-orange-500 flex-shrink-0" />
                <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-400">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}