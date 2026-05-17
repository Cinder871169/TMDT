const express = require("express");
const mongoose = require("mongoose");
const Review = require("../models/Review");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


// ✅ GET reviews theo product
router.get("/:productId", async (req, res) => {
    try {
        console.log("Getting reviews for product:", req.params.productId);
        const reviews = await Review.find({
            product: req.params.productId,
        })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        console.log("Found reviews:", reviews.length);
        res.json(reviews);
    } catch (err) {
        console.error("Error in get reviews:", err);
        // Fallback: get without populate
        try {
            const reviews = await Review.find({
                product: req.params.productId,
            }).sort({ createdAt: -1 });
            res.json(reviews);
        } catch (err2) {
            res.status(500).json({ message: err2.message });
        }
    }
});


// ✅ GET summary
router.get("/:productId/summary", async (req, res) => {
    try {
        console.log("Getting summary for product:", req.params.productId);
        const reviews = await Review.find({
            product: req.params.productId,
        });

        const total = reviews.length;

        const average =
            total === 0
                ? 0
                : reviews.reduce((acc, r) => acc + r.rating, 0) / total;

        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        reviews.forEach((r) => {
            breakdown[r.rating]++;
        });

        console.log("Summary:", { total, average, breakdown });
        res.json({ total, average, breakdown });
    } catch (err) {
        console.error("Error in summary:", err);
        res.status(500).json({ message: err.message });
    }
});


// ✅ POST review
router.post("/", protect, async (req, res) => {
    try {
        const { rating, comment, productId } = req.body;

        console.log("Creating review:", { rating, comment, productId, user: req.user._id });

        // Check productId is valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Product ID không hợp lệ" });
        }

        // ❗ check đã review chưa
        const existed = await Review.findOne({
            user: req.user._id,
            product: productId,
        });

        if (existed) {
            return res.status(400).json({ message: "Bạn đã đánh giá rồi" });
        }

        const review = await Review.create({
            user: req.user._id,
            product: productId,
            rating,
            comment,
        });

        try {
            const populated = await review.populate("user", "name");
            res.json(populated);
        } catch (popErr) {
            console.error("Populate error:", popErr);
            res.json(review);
        }
    } catch (err) {
        console.error("Error in create review:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;