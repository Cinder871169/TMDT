import { useEffect } from "react";
import { useReviewStore } from "../../store/reviewStore";

const ReviewList = ({ productId }) => {
    const { reviews, fetchReviews, loading } = useReviewStore();

    useEffect(() => {
        fetchReviews(productId);
    }, [productId, fetchReviews]);

    if (loading) {
        return (
            <div className="mt-6">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                                <div className="h-4 bg-gray-300 rounded w-24"></div>
                            </div>
                            <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="mt-6 text-center py-8 text-gray-500">
                Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm!
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Đánh giá từ khách hàng ({reviews.length})</h3>
            {reviews.map((r) => (
                <div key={r._id} className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                                {(r.user?.name || "User").charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">
                                    {r.user?.name || "Người dùng ẩn danh"}
                                </span>
                                <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} className={star <= r.rating ? "text-yellow-400" : "text-gray-300"}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-700 mb-2">{r.comment}</p>
                            <p className="text-sm text-gray-500">
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : ""
                                }
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;