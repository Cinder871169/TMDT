import { create } from "zustand";
import reviewApi from "../utils/reviewApi";

export const useReviewStore = create((set) => ({
    reviews: [],
    summary: null,
    eligibility: null,
    loading: false,

    fetchReviews: async (productId) => {
        set({ loading: true });
        try {
            const res = await reviewApi.getByProduct(productId);

            const reviews = Array.isArray(res.data)
                ? res.data
                : res.data.data || [];

            set({ reviews, loading: false });

        } catch (err) {
            console.error(err);
            set({ reviews: [], loading: false });
        }
    },


    fetchSummary: async (productId) => {
        try {
            const res = await reviewApi.getSummary(productId);
            set({
                summary: {
                    average: res.data.average || 0,
                    total: res.data.total || 0,
                    breakdown: res.data.breakdown || {},
                },
            });
        } catch (err) {
            console.error(err);
        }
    },

    fetchEligibility: async (productId) => {
        try {
            const res = await reviewApi.checkEligibility(productId);
            set({ eligibility: res.data });
        } catch (err) {
            console.error("Error fetching review eligibility:", err);
            set({ eligibility: { hasPurchased: false, hasReviewed: false, canReview: false } });
        }
    },

    addReview: async (data) => {
        try {
            const res = await reviewApi.create(data);

            console.log("API trả về:", res.data);

            const newReview = res.data.data || res.data;

            set((state) => ({
                reviews: [newReview, ...(state.reviews || [])],
                eligibility: {
                    hasPurchased: true,
                    hasReviewed: true,
                    canReview: false
                }
            }));

            // Cập nhật summary sau khi thêm review
            // Fetch lại summary
            const summaryRes = await reviewApi.getSummary(data.productId);
            set({
                summary: {
                    average: summaryRes.data.average || 0,
                    total: summaryRes.data.total || 0,
                    breakdown: summaryRes.data.breakdown || {},
                },
            });

        } catch (err) {
            console.error(err);
            // Hiển thị lỗi cho user
            const message = err.response?.data?.message || "Lỗi khi gửi đánh giá";
            throw new Error(message);
        }
    },
}));