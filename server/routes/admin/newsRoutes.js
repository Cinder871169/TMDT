const express = require("express");
const router = express.Router();
const News = require("../../models/News");
const { requireAdmin } = require("../../middleware/requireAdmin");
const upload = require("../../middleware/uploadMiddleware");

// GET /api/admin/news - Get all news (admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const news = await News.find({}).sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: "Lỗi truy vấn bài viết" });
  }
});

// GET /api/admin/news/:id - Get single news (admin only)
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    res.json(news);
  } catch (error) {
    res.status(500).json({ message: "Lỗi truy vấn bài viết" });
  }
});

// POST /api/admin/news - Create news with image upload (admin only)
router.post("/", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, content, author, published } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Thiếu tiêu đề hoặc nội dung" });
    }

    // Get image URL from Cloudinary if uploaded, or from body
    const imageUrl = req.file ? req.file.path : req.body.image || "";

    const news = new News({
      title,
      content,
      image: imageUrl,
      author: author || "Admin",
      published: published !== undefined ? published : true,
    });

    const createdNews = await news.save();
    res.status(201).json(createdNews);
  } catch (error) {
    res.status(400).json({ message: "Lỗi tạo bài viết", error: error.message });
  }
});

// PUT /api/admin/news/:id - Update news with image upload (admin only)
router.put("/:id", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    const { title, content, author, published } = req.body;

    if (title !== undefined) news.title = title;
    if (content !== undefined) news.content = content;
    if (author !== undefined) news.author = author;
    if (published !== undefined) news.published = published;
    
    // Update image if new file uploaded, otherwise keep existing
    if (req.file) {
      news.image = req.file.path;
    } else if (req.body.image !== undefined) {
      news.image = req.body.image;
    }

    const updatedNews = await news.save();
    res.json(updatedNews);
  } catch (error) {
    res.status(400).json({ message: "Lỗi cập nhật bài viết", error: error.message });
  }
});

// DELETE /api/admin/news/:id - Delete news (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);

    if (!news) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    res.json({ message: "Đã xóa bài viết thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa bài viết" });
  }
});

module.exports = router;