import api from "./api";

const reviewApi = {
    getByProduct: (productId) => {
        return api.get(`/api/reviews/${productId}`);
    },

    getSummary: (productId) => {
        return api.get(`/api/reviews/${productId}/summary`);
    },

    create: (data) => {
        return api.post("/api/reviews", data);
    },

    checkEligibility: (productId) => {
        return api.get(`/api/reviews/${productId}/check-eligibility`);
    },
};

export default reviewApi;