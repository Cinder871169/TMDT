const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Get product rich snippet data for SEO
router.get('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get reviews for this product
    const reviews = await Review.find({ product: id }).lean();
    
    // Calculate aggregate rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
    
    res.json({
      averageRating: parseFloat(averageRating),
      reviewCount: reviews.length,
      reviews: reviews.slice(0, 5).map(r => ({
        author: r.user?.name || 'Khách hàng',
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt
      }))
    });
  } catch (error) {
    console.error('Rich snippet error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
