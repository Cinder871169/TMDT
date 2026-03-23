const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

// @route   POST /api/orders
// @desc    Tạo đơn hàng mới
router.post("/", protect, async (req, res) => {
  const { orderItems, address, phone, city } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống" });
  }

  if (!address || !phone || !city) {
    return res.status(400).json({ message: "Thiếu thông tin giao hàng" });
  }

  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống" });
  }

  try {
    // Chuẩn hóa và validate payload từ client
    const normalized = orderItems.map((item) => {
      const productId = item?.product || item?._id;
      const quantity = Number(item?.quantity);
      const size = Number(item?.size);
      const color = item?.color;
      return { productId, quantity, size, color };
    });

    if (
      normalized.some(
        (x) =>
          !x.productId ||
          !Number.isInteger(x.quantity) ||
          x.quantity < 1 ||
          !Number.isInteger(x.size) ||
          !x.color,
      )
    ) {
      return res.status(400).json({ message: "Dữ liệu đơn hàng không hợp lệ" });
    }

    const productIds = [...new Set(normalized.map((x) => x.productId))];
    const products = await Product.find({ _id: { $in: productIds } }).select(
      "name image price sizes colors"
    );

    if (!products || products.length !== productIds.length) {
      return res.status(400).json({ message: "Một hoặc nhiều sản phẩm không tồn tại" });
    }

    const productMap = new Map(products.map((p) => [String(p._id), p]));

    // Tính lại totalPrice và build orderItems theo dữ liệu DB để chống gian lận giá
    const finalOrderItems = normalized.map(({ productId, quantity, size, color }) => {
      const product = productMap.get(String(productId));
      if (!product) return null;

      const normalizedSize = Number(size);
      const normalizedColor = String(color);

      const hasSize =
        Array.isArray(product.sizes) &&
        product.sizes.map((s) => Number(s)).includes(normalizedSize);
      const hasColor =
        Array.isArray(product.colors) && product.colors.includes(normalizedColor);

      if (!hasSize || !hasColor) return null;

      return {
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
        size: normalizedSize,
        color: normalizedColor,
      };
    });

    if (finalOrderItems.some((x) => !x)) {
      return res
        .status(400)
        .json({ message: "Dữ liệu biến thể (size/màu) không hợp lệ" });
    }

    const totalPrice = finalOrderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const createdOrder = await Order.create({
      user: req.user._id,
      orderItems: finalOrderItems,
      totalPrice,
      address,
      phone,
      city,
    });

    const qrCodeUrl = "https://img.vietqr.io/image/MB-123456789-compact2.png";

    return res.status(201).json({
      message: "Tạo đơn hàng thành công",
      qrCodeUrl,
      order: createdOrder,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server khi tạo đơn hàng" });
  }
});

router.get("/myorders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy đơn hàng" });
  }
});

// @route   GET /api/orders/:id
// @desc    Lấy chi tiết 1 đơn hàng của user (admin xem được tất cả)
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const isOwner = String(order.user) === String(req.user._id);
    const canView = isOwner || req.user.isAdmin;

    if (!canView) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server khi lấy chi tiết đơn hàng" });
  }
});

// @route   GET /api/orders (Lấy toàn bộ đơn hàng của tất cả khách)
router.get("/", protect, admin, async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json(orders);
});

router.put("/:id/status", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// @route   PUT /api/orders/:id/pay
// @desc    Người dùng đánh dấu đơn hàng đã thanh toán (demo)
router.put("/:id/pay", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Chỉ cho phép chủ đơn cập nhật trạng thái
    if (String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    order.status = req.body.status || "Đã thanh toán";
    const updatedOrder = await order.save();

    return res.json(updatedOrder);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Người dùng hủy đơn (chỉ khi chưa thanh toán)
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Chỉ chủ đơn được hủy
    if (String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    // Policy demo: chỉ cho hủy khi đơn đang ở trạng thái "Chờ xử lý"
    // (tránh trường hợp admin đổi sang "Đang giao"/"Đã giao" mà vẫn bị user hủy)
    if (order.status !== "Chờ xử lý") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể hủy đơn khi trạng thái là 'Chờ xử lý'" });
    }

    order.status = "Đã hủy";
    const updatedOrder = await order.save();

    return res.json(updatedOrder);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
