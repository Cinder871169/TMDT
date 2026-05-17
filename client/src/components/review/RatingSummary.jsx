import { useEffect } from "react";
import { useReviewStore } from "../../store/reviewStore";

const RatingSummary = ({ productId }) => {
    const { summary, fetchSummary } = useReviewStore();

    useEffect(() => {
        fetchSummary(productId);
    }, [productId, fetchSummary]);

    if (!summary) return null;

    const average = summary?.average ? summary.average.toFixed(1) : "0.0";
    const total = summary.total || 0;
    const breakdown = summary.breakdown || {};

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500">{average}</div>
                    <div className="flex justify-center mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="text-yellow-400 text-lg">
                                ★
                            </span>
                        ))}
                    </div>
                    <div className="text-sm text-gray-600">{total} đánh giá</div>
                </div>
                <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = breakdown[star] || 0;
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        return (
                            <div key={star} className="flex items-center gap-2 mb-1">
                                <span className="text-sm w-3">{star}</span>
                                <span className="text-yellow-400">★</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-600 w-6">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RatingSummary;