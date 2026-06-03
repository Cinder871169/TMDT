const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const Voucher = require("../models/Voucher");
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");
const { sendOrderConfirmationEmail } = require("../services/emailService");
const { PayOS } = require("@payos/node");

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID || "demo_client_id",
  apiKey: process.env.PAYOS_API_KEY || "demo_api_key",
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || "demo_checksum_key"
});

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

// @route   POST /api/orders
// @desc    Tạo đơn hàng mới (yêu cầu đăng nhập)
router.post("/", protect, async (req, res) => {
  const { orderItems, name, address, phone, note, paymentMethod, voucherCode, pointsUsed } = req.body;

  console.log("=== CREATE ORDER DEBUG ===");
  console.log("orderItems:", orderItems);
  console.log("name:", name);
  console.log("address:", address);
  console.log("phone:", phone);
  console.log("paymentMethod:", paymentMethod);
  console.log("user:", req.user._id);

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống" });
  }

  if (!name || !address || !phone) {
    return res.status(400).json({ message: "Thiếu thông tin giao hàng" });
  }

  if (!/^[0-9]{10,11}$/.test(phone.replace(/\s/g, ""))) {
    return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
  }

  const validPaymentMethod = paymentMethod || "vietqr";
  const validPaymentMethods = ["vietqr", "banking", "cod"];
  if (!validPaymentMethods.includes(validPaymentMethod)) {
    return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });
  }

  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống" });
  }

  try {
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
      return res.status(400).json({ error: "Dữ liệu đơn hàng không hợp lệ" });
    }

    // Get products and check stock
    const productIds = [...new Set(normalized.map((x) => x.productId))];
    const products = await Product.find({ _id: { $in: productIds } }).select("_id name price sizes colors countInStock");

    if (!products || products.length !== productIds.length) {
      return res.status(400).json({ error: "Một hoặc nhiều sản phẩm không tồn tại" });
    }

    const productMap = new Map(products.map((p) => [String(p._id), p]));

    // Aggregate quantities per product
    const productQuantityMap = new Map();
    for (const item of normalized) {
      const pId = String(item.productId);
      productQuantityMap.set(pId, (productQuantityMap.get(pId) || 0) + item.quantity);
    }

    // Check stock
    for (const [pId, totalRequested] of productQuantityMap.entries()) {
      const product = productMap.get(pId);
      if (!product) {
        return res.status(400).json({ error: `Sản phẩm không tồn tại: ${pId}` });
      }
      
      if (product.countInStock < totalRequested) {
        return res.status(400).json({
          error: `Sản phẩm "${product.name}" chỉ còn ${product.countInStock} trong kho`,
          insufficientStock: true,
          productId: String(product._id),
          available: product.countInStock,
          requested: totalRequested
        });
      }
    }

    // Build order items and prepare stock updates
    const finalOrderItems = [];
    const stockUpdates = [];

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
        return res.status(400).json({ error: `Sản phẩm "${product.name}" không có biến thể phù hợp` });
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
      return res.status(400).json({ error: "Không đủ tồn kho, vui lòng thử lại sau" });
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
        } else if (voucher.discountType === "fixed") {
          discountAmount = voucher.discountValue;
        }
        
        // Cap at max discount if defined
        if (voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
          discountAmount = voucher.maxDiscount;
        }
        
        if (discountAmount > subtotal) discountAmount = subtotal;
        appliedVoucher = voucher;
      }
    }

    // Handle Points
    let pointsDiscount = 0;
    let actualPointsUsed = 0;
    const user = await User.findById(req.user._id);

    if (pointsUsed > 0 && user) {
      actualPointsUsed = Math.min(pointsUsed, user.points);
      pointsDiscount = actualPointsUsed;
      
      if (discountAmount + pointsDiscount > subtotal + shippingFee) {
        pointsDiscount = subtotal + shippingFee - discountAmount;
        actualPointsUsed = pointsDiscount;
      }
    }

    const totalPrice = subtotal + shippingFee - discountAmount - pointsDiscount;
    const pointsEarned = Math.floor(subtotal * 0.01);

    // Create order
    const order = await Order.create({
      user: req.user._id,
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
      paymentMethod: validPaymentMethod,
      paymentStatus: "Chưa thanh toán",
    });

    // Update voucher usage
    if (appliedVoucher) {
      appliedVoucher.usedCount += 1;
      await appliedVoucher.save();
    }

    // Deduct points
    if (actualPointsUsed > 0 && user) {
      user.points -= actualPointsUsed;
      await user.save();
    }

    // Generate payment info
    let qrCodeUrl = null;
    let paymentDetails = null;
    let paymentUrl = null;

    if (validPaymentMethod === "vietqr") {
      let orderCode;
      let isUnique = false;
      while (!isUnique) {
        orderCode = Math.floor(10000000 + Math.random() * 90000000); // 8-digit unique integer
        const existing = await Order.findOne({ orderCode });
        if (!existing) {
          isUnique = true;
        }
      }

      const description = `Thanh toan don ${orderCode}`;
      const origin = req.headers.origin || "http://localhost:5173";
      const cancelUrl = `${origin}/checkout/payment-cancel?orderId=${order._id}`;
      const returnUrl = `${origin}/checkout/payment-success?orderId=${order._id}`;

      const paymentData = {
        orderCode,
        amount: Math.round(totalPrice),
        description: description.substring(0, 25),
        cancelUrl,
        returnUrl,
        buyerName: name,
        buyerPhone: phone,
      };

      try {
        console.log("Creating PayOS payment link with payload:", paymentData);
        const paymentLinkRes = await payos.paymentRequests.create(paymentData);
        
        paymentUrl = paymentLinkRes.checkoutUrl;
        
        order.orderCode = orderCode;
        order.paymentInfo = {
          bankName: paymentLinkRes.bin || "VietinBank",
          accountNumber: paymentLinkRes.accountNumber || "",
          accountName: paymentLinkRes.accountName || "",
          transferContent: paymentLinkRes.description || "",
          checkoutUrl: paymentLinkRes.checkoutUrl,
          paymentLinkId: paymentLinkRes.paymentLinkId,
          qrCode: paymentLinkRes.qrCode || ""
        };
        await order.save();
      } catch (err) {
        console.error("PayOS createPaymentLink error:", err);
        console.log("Falling back to static VietQR...");
        const transferContent = generateBankingContent(String(order._id));
        qrCodeUrl = generateVietQR(totalPrice, String(order._id));
        order.orderCode = orderCode;
        order.paymentInfo = {
          bankName: BANK_CONFIG.bankName,
          accountNumber: BANK_CONFIG.accountNumber,
          accountName: BANK_CONFIG.accountName,
          transferContent,
          checkoutUrl: qrCodeUrl,
          qrCode: qrCodeUrl
        };
        await order.save();
      }
      paymentDetails = order.paymentInfo;
    } else if (validPaymentMethod === "banking") {
      const transferContent = generateBankingContent(String(order._id));
      paymentDetails = {
        bankName: BANK_CONFIG.bankName,
        accountNumber: BANK_CONFIG.accountNumber,
        accountName: BANK_CONFIG.accountName,
        amount: totalPrice,
        transferContent,
      };
      order.paymentInfo = paymentDetails;
      await order.save();
    }

    console.log("Order created successfully:", order._id);

    // Only send confirmation email immediately for COD
    // For banking/vietqr, it will be sent after payment confirmation
    if (validPaymentMethod === "cod") {
      if (user && user.email) {
        sendOrderConfirmationEmail(user.email, order).catch(err => console.error("Email confirmation error:", err));
      } else if (order.isGuestOrder && order.guestEmail) {
        sendOrderConfirmationEmail(order.guestEmail, order).catch(err => console.error("Email confirmation error:", err));
      }
    }

    return res.status(201).json({
      message: "Tạo đơn hàng thành công",
      qrCodeUrl: qrCodeUrl || paymentUrl,
      paymentUrl: paymentUrl,
      order,
      paymentDetails,
    });
  } catch (error) {
    console.error("=== CREATE ORDER ERROR ===");
    console.error("Error:", error);
    return res.status(500).json({ 
      message: "Lỗi server khi tạo đơn hàng",
      error: error.message 
    });
  }
});

// @route   GET /api/orders/myorders
// @desc    Lấy danh sách đơn hàng của user đang đăng nhập
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
// @desc    Lấy chi tiết 1 đơn hàng
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const isOwner = order.user ? String(order.user) === String(req.user._id) : false;
    const canView = isOwner || req.user.isAdmin;

    if (!canView) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server khi lấy chi tiết đơn hàng" });
  }
});

// @route   GET /api/orders (Lấy toàn bộ đơn hàng)
router.get("/", protect, admin, async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email phone")
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @route   PUT /api/orders/:id/status
// @desc    Admin cập nhật trạng thái đơn hàng
router.put("/:id/status", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Thiếu trạng thái" });
    }

    const oldStatus = order.status;

    // Hoàn tồn kho nếu hủy đơn
    if (status === "Đã hủy" && order.status !== "Đã hủy") {
      const stockUpdates = order.orderItems.map(item => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { countInStock: item.quantity } }
        }
      }));
      if (stockUpdates.length > 0) {
        await Product.bulkWrite(stockUpdates);
      }
    }

    // Hoàn điểm nếu hủy đơn
    if (status === "Đã hủy" && order.pointsUsed > 0 && order.user) {
      await User.findByIdAndUpdate(order.user, {
        $inc: { points: order.pointsUsed }
      });
    }

    // Cộng điểm nếu giao hàng thành công
    if ((status === "Đã giao" || status === "Đã giao hàng") && !order.pointsAwarded && order.pointsEarned > 0 && order.user) {
      await User.findByIdAndUpdate(order.user, {
        $inc: { points: order.pointsEarned }
      });
      order.pointsAwarded = true;
    }

    order.status = status;
    
    // COD: tự động đánh dấu thanh toán khi giao thành công
    if (order.paymentMethod === "cod" && (status === "Đã giao" || status === "Đã giao hàng")) {
      order.paymentStatus = "Đã thanh toán";
      order.paidAt = new Date();
    }
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
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

    if (order.user && String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    if (order.paymentStatus === "Đã thanh toán") {
      return res.status(400).json({ message: "Đơn hàng đã được thanh toán trước đó" });
    }

    if (order.status === "Đã hủy") {
      return res.status(400).json({ message: "Không thể thanh toán đơn đã hủy" });
    }

    order.paymentStatus = "Đã thanh toán";
    order.status = "Đã xác nhận";
    order.paidAt = new Date();
    
    // Cộng điểm khi thanh toán thành công
    if (order.pointsEarned > 0 && !order.pointsAwarded && order.user) {
      await User.findByIdAndUpdate(order.user, {
        $inc: { points: order.pointsEarned }
      });
      order.pointsAwarded = true;
    }
    
    const updatedOrder = await order.save();

    // Send confirmation email after payment is successful
    const populatedOrder = await Order.findById(updatedOrder._id).populate("user", "email name");
    if (populatedOrder && populatedOrder.user && populatedOrder.user.email) {
      sendOrderConfirmationEmail(populatedOrder.user.email, populatedOrder).catch(err => console.error("Email confirmation error:", err));
    } else if (populatedOrder.isGuestOrder && populatedOrder.guestEmail) {
      sendOrderConfirmationEmail(populatedOrder.guestEmail, populatedOrder).catch(err => console.error("Email confirmation error:", err));
    }

    return res.json({
      message: "Xác nhận thanh toán thành công",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Người dùng hủy đơn
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.user && String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    if (order.status !== "Chờ xử lý") {
      return res.status(400).json({ message: "Chỉ có thể hủy đơn khi trạng thái là 'Chờ xử lý'" });
    }

    // Hoàn tồn kho
    const stockUpdates = order.orderItems.map(item => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { countInStock: item.quantity } }
      }
    }));
    await Product.bulkWrite(stockUpdates);

    // Hoàn điểm đã dùng
    if (order.pointsUsed > 0 && order.user) {
      await User.findByIdAndUpdate(order.user, {
        $inc: { points: order.pointsUsed }
      });
    }

    order.status = "Đã hủy";
    const updatedOrder = await order.save();

    return res.json(updatedOrder);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// @route   PUT /api/orders/:id/confirm-receipt
// @desc    Người dùng xác nhận đã nhận hàng
router.put("/:id/confirm-receipt", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.user && String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    if (order.status !== "Đang giao" && order.status !== "Đang giao hàng") {
      return res.status(400).json({ message: "Chỉ có thể xác nhận đã nhận khi đơn hàng đang được giao" });
    }

    order.status = "Đã giao";
    
    // Nếu là COD thì tự động chuyển trạng thái thanh toán thành Đã thanh toán
    if (order.paymentMethod === "cod") {
      order.paymentStatus = "Đã thanh toán";
    }

    // Tích điểm cho người dùng nếu chưa được cộng điểm
    if (!order.pointsAwarded && order.pointsEarned > 0) {
      await User.findByIdAndUpdate(order.user, {
        $inc: { points: order.pointsEarned }
      });
      order.pointsAwarded = true;
    }

    const updatedOrder = await order.save();

    // Gửi email thông báo đơn hàng đã hoàn thành
    const populatedOrder = await Order.findById(updatedOrder._id).populate("user", "email name");
    if (populatedOrder && populatedOrder.user && populatedOrder.user.email) {
      const { sendOrderStatusEmail } = require("../services/emailService");
      sendOrderStatusEmail(populatedOrder.user.email, populatedOrder).catch(err => console.error("Email status error:", err));
    }

    return res.json(populatedOrder);
  } catch (error) {
    console.error("Confirm receipt error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// Admin: Cancel order and refund
router.put("/:id/admin-cancel", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (["Đã giao", "Đang giao"].includes(order.status)) {
      return res.status(400).json({ message: "Không thể hủy đơn đã giao hoặc đang giao" });
    }

    // Hoàn tồn kho nếu chưa hủy
    if (order.status !== "Đã hủy") {
      const stockUpdates = order.orderItems.map(item => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { countInStock: item.quantity } }
        }
      }));
      await Product.bulkWrite(stockUpdates);
    }

    // Hoàn điểm
    if (order.pointsUsed > 0 && order.user) {
      await User.findByIdAndUpdate(order.user, {
        $inc: { points: order.pointsUsed }
      });
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

// DELETE order
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Hoàn tồn kho nếu chưa hủy
    if (order.status !== "Đã hủy") {
      const stockUpdates = order.orderItems.map(item => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { countInStock: item.quantity } }
        }
      }));
      if (stockUpdates.length > 0) {
        await Product.bulkWrite(stockUpdates);
      }
    }

    await order.deleteOne();
    res.json({ message: "Đã xóa đơn hàng thành công" });
  } catch (error) {
    console.error("Lỗi xóa đơn hàng:", error);
    return res.status(500).json({ message: "Lỗi xóa đơn hàng" });
  }
});

// @route   POST /api/orders/:id/payment-link
// @desc    Tạo link thanh toán PayOS mới cho đơn hàng chưa thanh toán
// @access  Private
router.post("/:id/payment-link", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (String(order.user) !== String(req.user._id)) {
      return res.status(401).json({ message: "Không có quyền truy cập đơn hàng này" });
    }

    if (order.paymentStatus === "Đã thanh toán") {
      return res.status(400).json({ message: "Đơn hàng đã được thanh toán" });
    }

    if (order.paymentMethod !== "vietqr") {
      return res.status(400).json({ message: "Đơn hàng không sử dụng phương thức chuyển khoản QR" });
    }

    // Generate or retrieve orderCode
    let orderCode = order.orderCode;
    if (!orderCode) {
      let isUnique = false;
      while (!isUnique) {
        orderCode = Math.floor(10000000 + Math.random() * 90000000);
        const existing = await Order.findOne({ orderCode });
        if (!existing) {
          isUnique = true;
        }
      }
      order.orderCode = orderCode;
    }

    const description = `Thanh toan don ${orderCode}`;
    const origin = req.headers.origin || "http://localhost:5173";
    const cancelUrl = `${origin}/checkout/payment-cancel?orderId=${order._id}`;
    const returnUrl = `${origin}/checkout/payment-success?orderId=${order._id}`;

    const paymentData = {
      orderCode,
      amount: Math.round(order.totalPrice),
      description: description.substring(0, 25),
      cancelUrl,
      returnUrl,
      buyerName: order.name,
      buyerPhone: order.phone,
    };

    try {
      console.log("Re-creating PayOS payment link for order:", order._id);
      const paymentLinkRes = await payos.paymentRequests.create(paymentData);

      order.paymentInfo = {
        bankName: paymentLinkRes.bin || "VietinBank",
        accountNumber: paymentLinkRes.accountNumber || "",
        accountName: paymentLinkRes.accountName || "",
        transferContent: paymentLinkRes.description || "",
        checkoutUrl: paymentLinkRes.checkoutUrl,
        paymentLinkId: paymentLinkRes.paymentLinkId,
        qrCode: paymentLinkRes.qrCode || ""
      };
      await order.save();

      return res.json({ paymentUrl: paymentLinkRes.checkoutUrl });
    } catch (err) {
      console.error("PayOS re-creation payment link error:", err);
      // Fallback
      const transferContent = generateBankingContent(String(order._id));
      const qrCodeUrl = generateVietQR(order.totalPrice, String(order._id));
      
      order.paymentInfo = {
        bankName: BANK_CONFIG.bankName,
        accountNumber: BANK_CONFIG.accountNumber,
        accountName: BANK_CONFIG.accountName,
        transferContent,
        checkoutUrl: qrCodeUrl,
        qrCode: qrCodeUrl
      };
      await order.save();
      return res.json({ paymentUrl: qrCodeUrl });
    }
  } catch (error) {
    console.error("Error creating payment link:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi tạo liên kết thanh toán", error: error.message });
  }
});

// @route   GET /api/orders/:id/verify-payos
// @desc    Đối soát trạng thái thanh toán trực tiếp với PayOS và cập nhật đơn hàng
// @access  Private
router.get("/:id/verify-payos", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (String(order.user) !== String(req.user._id)) {
      return res.status(401).json({ message: "Không có quyền truy cập đơn hàng này" });
    }

    if (order.paymentStatus === "Đã thanh toán") {
      return res.json({ success: true, paymentStatus: "Đã thanh toán", message: "Đơn hàng đã được thanh toán" });
    }

    if (order.paymentMethod !== "vietqr") {
      return res.status(400).json({ message: "Đơn hàng không áp dụng chuyển khoản QR" });
    }

    if (!order.orderCode) {
      return res.json({ success: false, paymentStatus: "Chưa thanh toán", message: "Đơn hàng chưa được khởi tạo thanh toán PayOS" });
    }

    try {
      console.log(`Verifying PayOS payment for orderCode: ${order.orderCode}`);
      const paymentLinkInfo = await payos.paymentRequests.get(order.orderCode);
      console.log("PayOS status result:", paymentLinkInfo.status);

      if (paymentLinkInfo.status === "PAID") {
        order.paymentStatus = "Đã thanh toán";
        order.paidAt = new Date();
        
        // Award points if not awarded yet
        if (!order.pointsAwarded) {
          const user = await User.findById(order.user);
          if (user) {
            user.points += order.pointsEarned || 0;
            await user.save();
            order.pointsAwarded = true;
          }
        }
        await order.save();

        // Send email confirmation
        try {
          const user = await User.findById(order.user);
          if (user && user.email) {
            sendOrderConfirmationEmail(user.email, order).catch(err => console.error("Email verification confirmation error:", err));
          } else if (order.isGuestOrder && order.guestEmail) {
            sendOrderConfirmationEmail(order.guestEmail, order).catch(err => console.error("Email verification confirmation error:", err));
          }
        } catch (mailErr) {
          console.error("Mail send error in verify-payos:", mailErr);
        }

        return res.json({ success: true, paymentStatus: "Đã thanh toán", message: "Thanh toán thành công" });
      } else {
        return res.json({ success: false, paymentStatus: "Chưa thanh toán", message: `Thanh toán chưa hoàn tất. Trạng thái: ${paymentLinkInfo.status}` });
      }
    } catch (err) {
      console.error("PayOS verification query failed:", err.message);
      return res.json({ success: false, paymentStatus: "Chưa thanh toán", message: "Không thể đối soát với cổng PayOS tại thời điểm này" });
    }
  } catch (error) {
    console.error("Verify PayOS endpoint error:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi đối soát thanh toán", error: error.message });
  }
});

// @route   POST /api/orders/payos-webhook
// @desc    Nhận Webhook cập nhật trạng thái thanh toán thời gian thực từ PayOS
// @access  Public
router.post("/payos-webhook", async (req, res) => {
  try {
    console.log("=== RECEIVED PAYOS WEBHOOK ===");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    let webhookData;
    try {
      webhookData = payos.webhooks.verify(req.body);
      console.log("Verified PayOS Webhook Data:", webhookData);
    } catch (verErr) {
      console.error("Webhook signature verification failed:", verErr.message);
      return res.status(400).json({ error: "Invalid signature verification" });
    }

    const { orderCode, amount } = webhookData.data;

    // Find the order
    const order = await Order.findOne({ orderCode });
    if (!order) {
      console.warn(`Order not found for orderCode: ${orderCode}`);
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.paymentStatus !== "Đã thanh toán") {
      order.paymentStatus = "Đã thanh toán";
      order.paidAt = new Date();

      // Award points if not awarded yet
      if (!order.pointsAwarded) {
        const user = await User.findById(order.user);
        if (user) {
          user.points += order.pointsEarned || 0;
          await user.save();
          order.pointsAwarded = true;
        }
      }
      await order.save();

      // Send email confirmation
      try {
        const user = await User.findById(order.user);
        if (user && user.email) {
          sendOrderConfirmationEmail(user.email, order).catch(err => console.error("Email Webhook confirmation error:", err));
        } else if (order.isGuestOrder && order.guestEmail) {
          sendOrderConfirmationEmail(order.guestEmail, order).catch(err => console.error("Email Webhook confirmation error:", err));
        }
      } catch (mailErr) {
        console.error("Mail send error in webhook:", mailErr);
      }

      console.log(`Order ${order._id} updated to Paid successfully via Webhook`);
    }

    return res.json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    console.error("PayOS Webhook handler error:", error);
    res.status(500).json({ message: "Lỗi xử lý webhook", error: error.message });
  }
});

module.exports = router;
