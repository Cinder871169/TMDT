const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const upload = require("../middleware/uploadMiddleware");

router.get("/", async (req, res) => {
  const { keyword, brand } = req.query;

  // Tạo điều kiện tìm kiếm linh hoạt
  let query = {};
  if (keyword) {
    query.name = { $regex: keyword, $options: "i" }; // Tìm không phân biệt hoa thường
  }
  if (brand && brand !== "Tất cả") {
    query.brand = brand;
  }

  try {
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi truy vấn sản phẩm" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Không tìm thấy đôi giày này" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

const { protect, admin } = require("../middleware/authMiddleware");

// @route   DELETE /api/products/:id (Xóa giày)
router.delete("/:id", protect, admin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa sản phẩm thành công" });
});

// @route   POST /api/products (Thêm giày mới)
router.post("/", protect, admin, upload.single("image"), async (req, res) => {
  try {
    const { name, price, brand, description, sizes, colors } = req.body;
    const image = req.file ? req.file.path : ""; // Lấy link ảnh từ Cloudinary trả về

    const product = new Product({
      name,
      price,
      image,
      brand,
      description,
      sizes: sizes.split(","), // Frontend gửi chuỗi thì split ở đây
      colors: colors.split(","),
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: "Lỗi tải ảnh hoặc dữ liệu" });
  }
});

// @route   PUT /api/products/:id (Cập nhật thông tin giày)
router.put("/:id", protect, admin, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const { name, price, brand, description, sizes, colors } = req.body;

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (brand !== undefined) product.brand = brand;
    if (description !== undefined) product.description = description;
    if (sizes !== undefined)
      product.sizes = typeof sizes === "string" ? sizes.split(",") : sizes;
    if (colors !== undefined)
      product.colors = typeof colors === "string" ? colors.split(",") : colors;

    if (req.file) {
      product.image = req.file.path;
    }

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Lỗi cập nhật sản phẩm", error: error.message });
  }
});

module.exports = router;
