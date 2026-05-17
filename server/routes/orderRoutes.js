const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const Voucher = require("../models/Voucher");
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");

// VietQR API configuration
const BANK_CONFIG = {
  bankId: "MB",
  accountNumber: "0384670742",
  accountName: "NGUYEN QUANG TU",
  bankName: "Ngân hàng TMCP Quân đội (MB Bank)",
};

const generateVietQR = (amount, orderId) => {
  const template = "compact2";
  const accountNumber = BANK_CONFIG.accountNumber;
  const accountName = BANK_CONFIG.accountName;
  const amountStr = Math.round(amount).toString();
  const orderIdShort = orderId.slice(-6).toUpperCase();
  const content = `TMDT${orderIdShort}`;
  
  return `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${accountNumber}-${template}.png?amount=${amountStr}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(accountName)}`;
};

const generateBankingContent = (orderId) => {
  const orderIdShort = orderId.slice(-6).toUpperCase();
  return `TMDT${orderIdShort}`;
};

const createOrder = async (orderItems, name, address, phone, note, paymentMethod, voucherCode, pointsUsed, userId) => {
  // Normalize items
  const normalized = orderItems.map((item) => {
    const productId = item?.product || item?._id;
    const quantity = Number(item?.quantity);
    const size = Number(item?.size);
    const color = item?.color;
    return { productId, quantity, size, color };
  });

  // Validate data
  if (normalized.some(x => !x.productId || !Number.isInteger(x.quantity) || x.quantity < 1 || !Number.isInteger(x.size) || !x.color)) {
    return { error: "Dữ liệu đơn hàng không hợp lệ" };
  }

  // Get products and check stock
  const productIds = [...new Set(normalized.map((x) => x.productId))];
  const products = await Product.find({ _id: { $in: productIds } }).select("_id name price sizes colors countInStock");

  if (!products || products.length !== productIds.length) {
    return { error: "Một hoặc nhiều sản phẩm không tồn tại" };
  }

  const productMap = new Map(products.map((p) => [String(p._id), p]));

  // Aggregate quantities per product to handle multiple variants of the same product
  const productQuantityMap = new Map();
  for (const item of normalized) {
    const pId = String(item.productId);
    productQuantityMap.set(pId, (productQuantityMap.get(pId) || 0) + item.quantity);
  }

  // Check stock for all accumulated product quantities
  for (const [pId, totalRequested] of productQuantityMap.entries()) {
    const product = productMap.get(pId);
    if (!product) {
      return { error: `Sản phẩm không tồn tại: ${pId}` };
    }
    
    if (product.countInStock < totalRequested) {
      return {
        error: `Sản phẩm "${product.name}" chỉ còn ${product.countInStock} trong kho (yêu cầu tổng cộng: ${totalRequested})`,
        insufficientStock: true,
        productId: String(product._id),
        available: product.countInStock,
        requested: totalRequested
      };
    }
  }

  // Build order items and prepare stock updates
  const finalOrderItems = [];
  const stockUpdates = [];

  // Create atomic stock deduction updates
  for (const [pId, totalRequested] of productQuantityMap.entries()) {
    stockUpdates.push({
      updateOne: {
        filter: { _id: pId, countInStock: { $gte: totalRequested } },
        update: { $inc: { countInStock: -totalRequested } }
      }
    });
  }

  for (const { productId, quantity, size, color } of normalized) {
    const product = productMap.get(String(productId));
    
    const hasSize = Array.isArray(product.sizes) && product.sizes.map(s => Number(s)).includes(Number(size));
    let hasColor = false;
    let itemImage = null;
    
    if (Array.isArray(product.colors)) {
      for (const c of product.colors) {
        if (typeof c === "string" && c === color) {
          hasColor = true;
          break;
        }
        if (typeof c === "object" && c.name === color) {
          hasColor = true;
          itemImage = c.images && c.images.length > 0 ? c.images[0] : null;
          break;
        }
      }
    }

    if (!hasSize || !hasColor) {
      return { error: `Sản phẩm "${product.name}" không có biến thể (size/màu) phù hợp` };
    }

    finalOrderItems.push({
      product: product._id,
      name: product.name,
      image: itemImage || product.image || "",
      price: product.price,
      quantity,
      size,
      color,
    });
  }

  // Execute stock updates atomically
  const bulkResult = await Product.bulkWrite(stockUpdates);
  if (bulkResult.modifiedCount !== stockUpdates.length) {
    return { error: "Không đủ tồn kho hoặc có lỗi đồng bộ, vui lòng thử lại sau" };
  }

  // Calculate totals
  const subtotal = finalOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 2000000 ? 0 : 30000;
  
  let discountAmount = 0;
  let appliedVoucher = null;

  if (voucherCode) {
    const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase(), isActive: true });
    if (voucher && new Date(voucher.expiryDate) >= new Date() && (voucher.usageLimit === 0 || voucher.usedCount < voucher.usageLimit) && subtotal >= voucher.minOrderValue) {
      if (voucher.discountType === "percent") {
        discountAmount = (subtotal * voucher.discountValue) / 100;
        if (voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
          discountAmount = voucher.maxDiscount;
        }
      } else if (voucher.discountType === "fixed") {
        discountAmount = voucher.discountValue;
      }
      
      if (discountAmount > subtotal) discountAmount = subtotal;
      appliedVoucher = voucher;
    }
  }

  // Handle Points
  let pointsDiscount = 0;
  let actualPointsUsed = 0;
  const user = await User.findById(userId);

  if (pointsUsed > 0 && user) {
    actualPointsUsed = Math.min(pointsUsed, user.points);
    pointsDiscount = actualPointsUsed; // 1 point = 1 VND
    
    // Total discount cannot exceed subtotal + shipping
    if (discountAmount + pointsDiscount > subtotal + shippingFee) {
      pointsDiscount = subtotal + shippingFee - discountAmount;
      actualPointsUsed = pointsDiscount;
    }
  }

  const totalPrice = subtotal + shippingFee - discountAmount - pointsDiscount;

  // Earn points (e.g. 1% of subtotal)
  const pointsEarned = Math.floor(subtotal * 0.01);

  // Create order
  const orderData = {
    user: userId,
    orderItems: finalOrderItems,
    totalPrice,
    shippingFee,
    discount: discountAmount,
    voucherCode: appliedVoucher ? appliedVoucher.code : "",
    pointsUsed: actualPointsUsed,
    pointsDiscount,
    pointsEarned,
    pointsAwarded: false,
    name,
    address,
    phone,
    note,
    paymentMethod: paymentMethod || "vietqr",
  };

  const createdOrder = await Order.create(orderData);

  // If voucher applied, increment usage count
  if (appliedVoucher) {
    appliedVoucher.usedCount += 1;
    await appliedVoucher.save();
  }

  if (actualPointsUsed > 0 && user) {
    user.points -= actualPointsUsed;
    await user.save();
  }

  // Generate payment info
  const transferContent = generateBankingContent(String(createdOrder._id));
  const qrCodeUrl = paymentMethod === "vietqr" ? generateVietQR(totalPrice, String(createdOrder._id)) : null;

  createdOrder.paymentInfo = {
    bankName: BANK_CONFIG.bankName,
    accountNumber: BANK_CONFIG.accountNumber,
    accountName: BANK_CONFIG.accountName,
    transferContent,
  };
  await createdOrder.save();

  return {
    order: createdOrder,
    qrCodeUrl,
    paymentDetails: {
      bankName: BANK_CONFIG.bankName,
      accountNumber: BANK_CONFIG.accountNumber,
      accountName: BANK_CONFIG.accountName,
      amount: totalPrice,
      transferContent,
    }
  };
};

// @route   POST /api/orders
// @desc    Tạo đơn hàng mới
router.post("/", protect, async (req, res) => {
  const { orderItems, name, address, phone, note, paymentMethod, voucherCode, pointsUsed } = req.body;

  console.log("=== CREATE ORDER DEBUG ===");
  console.log("orderItems:", orderItems);
  console.log("name:", name);
  console.log("address:", address);
  console.log("phone:", phone);
  console.log("note:", note);
  console.log("paymentMethod:", paymentMethod);

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống" });
  }

  if (!name || !address || !phone) {
    return res.status(400).json({ message: "Thiếu thông tin giao hàng" });
  }

  const validPaymentMethod = paymentMethod || "vietqr";
  if (!["vietqr", "banking"].includes(validPaymentMethod)) {
    return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });
  }

  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống" });
  }

  try {
    const result = await createOrder(orderItems, name, address, phone, note, validPaymentMethod, voucherCode, pointsUsed || 0, req.user._id);

    if (result.error) {
      return res.status(400).json({
        message: result.error,
        insufficientStock: result.insufficientStock,
        productId: result.productId,
        available: result.available,
        requested: result.requested
      });
    }

    console.log("Order created successfully:", result.order._id);

    return res.status(201).json({
      message: "Tạo đơn hàng thành công",
      qrCodeUrl: result.qrCodeUrl,
      order: result.order,
      paymentDetails: result.paymentDetails,
    });
  } catch (error) {
    console.error("=== CREATE ORDER ERROR ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      message: "Lỗi server khi tạo đơn hàng",
      error: error.message 
    });
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
// @desc    Người dùng xác nhận đã thanh toán
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

    // Kiểm tra đơn hàng có ở trạng thái hợp lệ để thanh toán không
    if (order.paymentStatus === "Đã thanh toán") {
      return res.status(400).json({ message: "Đơn hàng đã được thanh toán trước đó" });
    }

    if (order.status === "Đã hủy") {
      return res.status(400).json({ message: "Không thể thanh toán đơn đã hủy" });
    }

    order.paymentStatus = "Đã thanh toán";
    order.status = "Đã xác nhận";
    order.paidAt = new Date();
    const updatedOrder = await order.save();

    return res.json({
      message: "Xác nhận thanh toán thành công",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// @route   PUT /api/orders/:id/pay/banking
// @desc    Xác nhận thanh toán chuyển khoản (cập nhật thông tin)
router.put("/:id/pay/banking", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    if (order.paymentStatus === "Đã thanh toán") {
      return res.status(400).json({ message: "Đơn hàng đã được thanh toán" });
    }

    // Cập nhật thông tin thanh toán banking
    order.paymentMethod = "banking";
    order.paymentInfo = {
      bankName: order.paymentInfo?.bankName || BANK_CONFIG.bankName,
      accountNumber: order.paymentInfo?.accountNumber || BANK_CONFIG.accountNumber,
      accountName: order.paymentInfo?.accountName || BANK_CONFIG.accountName,
      transferContent: generateBankingContent(String(order._id)),
    };
    
    await order.save();

    return res.json({
      message: "Đã cập nhật phương thức thanh toán",
      paymentDetails: order.paymentInfo,
    });
  } catch (error) {
    console.error("Banking payment update error:", error);
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

    // Refund stock when order is cancelled
    const stockUpdates = order.orderItems.map(item => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { countInStock: item.quantity } }
      }
    }));

    await Product.bulkWrite(stockUpdates);

    order.status = "Đã hủy";
    const updatedOrder = await order.save();

    return res.json(updatedOrder);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// Admin: Cancel order and refund stock
router.put("/:id/admin-cancel", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Only allow cancel for non-delivered orders
    if (["Đã giao", "Đang giao"].includes(order.status)) {
      return res.status(400).json({ message: "Không thể hủy đơn đã giao hoặc đang giao" });
    }

    // Refund stock if order was paid or confirmed
    if (["Đã xác nhận", "Đang giao hàng"].includes(order.status) || order.paymentStatus === "Đã thanh toán") {
      const stockUpdates = order.orderItems.map(item => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { countInStock: item.quantity } }
        }
      }));
      await Product.bulkWrite(stockUpdates);
    }

    order.status = "Đã hủy";
    order.paymentStatus = "Đã hoàn tiền";
    const updatedOrder = await order.save();

    return res.json(updatedOrder);
  } catch (error) {
    console.error("Admin cancel order error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
