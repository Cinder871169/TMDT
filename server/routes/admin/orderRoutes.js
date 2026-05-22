const express = require("express");
const router = express.Router();
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const User = require("../../models/User");
const { requireAdmin } = require("../../middleware/requireAdmin");
const { sendOrderStatusEmail } = require("../../services/emailService");

// GET /api/admin/orders - Get all orders (admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email phone address")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi truy vấn đơn hàng" });
  }
});

// GET /api/admin/orders/:id - Get single order (admin only)
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email phone address"
    );

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Lỗi truy vấn đơn hàng" });
  }
});

// PUT /api/admin/orders/:id/status - Update order status (admin only)
router.put("/:id/status", requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Thiếu trạng thái" });
    }

    if (status === "Đã giao" || status === "Đã giao hàng") {
      return res.status(400).json({ message: "Admin không thể cập nhật trực tiếp trạng thái Đã giao. Khách hàng phải tự xác nhận đã nhận hàng." });
    }

    // Bổ sung: Hoàn lại tồn kho nếu admin chuyển trạng thái sang "Đã hủy"
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

    // Bổ sung: Hoàn lại điểm nếu hủy đơn
    if (status === "Đã hủy" && order.status !== "Đã hủy") {
      if (order.pointsUsed > 0) {
        await User.findByIdAndUpdate(order.user, {
          $inc: { points: order.pointsUsed }
        });
      }
    }

    // Award points if delivered
    if ((status === "Đã giao hàng" || status === "Đã giao") && (order.status !== "Đã giao hàng" && order.status !== "Đã giao") && !order.pointsAwarded) {
      if (order.pointsEarned > 0) {
        await User.findByIdAndUpdate(order.user, {
          $inc: { points: order.pointsEarned }
        });
        order.pointsAwarded = true;
      }
    }

    order.status = status;
    const updatedOrder = await order.save();

    // Populate user to get email
    const populatedOrder = await Order.findById(updatedOrder._id).populate("user", "email name");
    if (populatedOrder && populatedOrder.user && populatedOrder.user.email) {
      sendOrderStatusEmail(populatedOrder.user.email, populatedOrder).catch(err => console.error("Email status error:", err));
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái:", error);
    res.status(500).json({ message: "Lỗi cập nhật trạng thái" });
  }
});

// GET /api/admin/orders/stats/overview - Get order stats (admin only)
router.get("/stats/overview", requireAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "Chờ xử lý" });
    const completedOrders = await Order.countDocuments({ status: "Đã giao" });
    const cancelledOrders = await Order.countDocuments({ status: "Đã hủy" });

    const orders = await Order.find({ status: "Đã giao" });
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi thống kê" });
  }
});

// DELETE /api/admin/orders/:id - Delete order (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Bổ sung: Hoàn tồn kho nếu đơn hàng chưa bị hủy trước khi xóa
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
    res.status(500).json({ message: "Lỗi xóa đơn hàng" });
  }
});

module.exports = router;
