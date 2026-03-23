const express = require("express");
const router = express.Router();
const News = require("../models/News");
const { protect, admin } = require("../middleware/authMiddleware");

// @route   GET /api/news
router.get("/", async (req, res) => {
  try {
    const news = await News.find({ published: true }).sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

// @route   GET /api/news/:id
router.get("/:id", async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id);
    if (!newsItem || !newsItem.published) {
      return res.status(404).json({ message: "Bài viết không tồn tại" });
    }
    res.json(newsItem);
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

// @route   POST /api/news (Admin only)
router.post("/", protect, admin, async (req, res) => {
  try {
    const { title, content, image, author } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Tiêu đề và nội dung là bắt buộc" });
    }

    const news = await News.create({ title, content, image, author });
    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

// @route   PUT /api/news/:id (Admin only)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { title, content, image, author, published } = req.body;

    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      { title, content, image, author, published },
      { new: true },
    );

    if (!updatedNews) {
      return res.status(404).json({ message: "Bài viết không tồn tại" });
    }

    res.json(updatedNews);
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

// @route   DELETE /api/news/:id (Admin only)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ message: "Bài viết không tồn tại" });
    }
    res.json({ message: "Xóa bài viết thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

module.exports = router;
