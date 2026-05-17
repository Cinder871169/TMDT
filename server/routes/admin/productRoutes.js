const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const upload = require("../../middleware/uploadMiddleware");
const { requireAdmin } = require("../../middleware/requireAdmin");

// GET /api/admin/products - Get all products (admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi truy vấn sản phẩm" });
  }
});

// GET /api/admin/products/:id - Get single product (admin only)
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// POST /api/admin/products - Create new product (admin only)
router.post("/", requireAdmin, upload.any(), async (req, res) => {
  try {
    const { name, price, brand, description, sizes, colors, countInStock, originalPrice, isOnSale } = req.body;

    console.log("POST /products - body:", req.body);
    console.log("POST /products - files:", req.files);

    if (!name || !price || !brand) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // Parse colors JSON
    let parsedColors = [];
    if (colors) {
      try {
        parsedColors = JSON.parse(colors);
      } catch (e) {
        return res.status(400).json({ message: "Định dạng màu sắc không hợp lệ" });
      }
    }

    // Group uploaded files by color index
    const files = req.files || [];
    const colorImages = {};

    files.forEach(file => {
      const match = file.fieldname.match(/^color_(\d+)_images$/);
      if (match) {
        const colorIndex = match[1];
        if (!colorImages[colorIndex]) {
          colorImages[colorIndex] = [];
        }
        colorImages[colorIndex].push(file.path);
      }
    });

    // Build colors array with images
    const colorsWithImages = parsedColors.map((color, index) => ({
      name: color.name,
      images: colorImages[index] || []
    }));

    const product = new Product({
      name,
      price: parseFloat(price),
      brand,
      description: description || "",
      sizes: sizes ? (typeof sizes === "string" ? sizes.split(",").map(s => s.trim()) : sizes) : [],
      colors: colorsWithImages,
      countInStock: countInStock ? parseInt(countInStock) : 0,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      isOnSale: isOnSale === 'true' || isOnSale === true,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ message: "Lỗi tạo sản phẩm", error: error.message });
  }
});

// PUT /api/admin/products/:id - Update product (admin only)
router.put("/:id", requireAdmin, upload.any(), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const { name, price, brand, description, sizes, colors, countInStock, originalPrice, isOnSale } = req.body;

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = parseFloat(price);
    if (brand !== undefined) product.brand = brand;
    if (description !== undefined) product.description = description;
    if (sizes !== undefined) {
      product.sizes = typeof sizes === "string" ? sizes.split(",").map(s => s.trim()) : sizes;
    }
    if (countInStock !== undefined) {
      product.countInStock = parseInt(countInStock);
    }
    if (originalPrice !== undefined) {
      product.originalPrice = originalPrice ? parseFloat(originalPrice) : undefined;
    }
    if (isOnSale !== undefined) {
      product.isOnSale = isOnSale === 'true' || isOnSale === true;
    }

    // Update colors if provided
    if (colors !== undefined) {
      try {
        const parsedColors = JSON.parse(colors);

        // Group uploaded files by color index
        const files = req.files || [];
        const colorImages = {};

        files.forEach(file => {
          const match = file.fieldname.match(/^color_(\d+)_images$/);
          if (match) {
            const colorIndex = match[1];
            if (!colorImages[colorIndex]) {
              colorImages[colorIndex] = [];
            }
            colorImages[colorIndex].push(file.path);
          }
        });

        // Update colors with images (keep existing images if no new files uploaded)
        product.colors = parsedColors.map((color, index) => ({
          name: color.name,
          images: colorImages[index] || product.colors[index]?.images || []
        }));
      } catch (e) {
        console.error("Error parsing colors:", e);
      }
    }

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Lỗi cập nhật sản phẩm", error: error.message });
  }
});

// DELETE /api/admin/products/:id - Delete product (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json({ message: "Đã xóa sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa sản phẩm" });
  }
});

// GET /api/admin/products/stats/overview - Get product stats (admin only)
router.get("/stats/overview", requireAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const onSaleProducts = await Product.countDocuments({ isOnSale: true });
    const brands = await Product.distinct("brand");

    res.json({
      totalProducts,
      onSaleProducts,
      uniqueBrands: brands.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi thống kê" });
  }
});

module.exports = router;
