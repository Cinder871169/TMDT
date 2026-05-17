const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Contact = require("../../models/Contact");
const Newsletter = require("../../models/Newsletter");
const { requireAdmin } = require("../../middleware/requireAdmin");

// GET /api/admin/users - Get all users (admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi truy vấn người dùng" });
  }
});

// GET /api/admin/users/:id - Get single user (admin only)
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi truy vấn người dùng" });
  }
});

// PUT /api/admin/users/:id/role - Update user role (admin only)
router.put("/:id/role", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const { isAdmin } = req.body;

    if (typeof isAdmin !== "boolean") {
      return res.status(400).json({ message: "isAdmin phải là boolean" });
    }

    user.isAdmin = isAdmin;
    await user.save();

    res.json({
      message: "Cập nhật quyền thành công",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật quyền" });
  }
});

// DELETE /api/admin/users/:id - Delete user (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({ message: "Đã xóa người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa người dùng" });
  }
});

// GET /api/admin/users/stats/overview - Get user stats (admin only)
router.get("/stats/overview", requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const regularUsers = await User.countDocuments({ isAdmin: false });

    res.json({
      totalUsers,
      adminUsers,
      regularUsers,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi thống kê" });
  }
});

// GET /api/admin/contacts - Get all contacts (admin only)
router.get("/contacts", requireAdmin, async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi truy vấn liên hệ" });
  }
});

// DELETE /api/admin/contacts/:id - Delete contact (admin only)
router.delete("/contacts/:id", requireAdmin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Không tìm thấy liên hệ" });
    }

    res.json({ message: "Đã xóa liên hệ thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa liên hệ" });
  }
});

// GET /api/admin/newsletter - Get all newsletter subscribers (admin only)
router.get("/newsletter", requireAdmin, async (req, res) => {
  try {
    const subscribers = await Newsletter.find({}).sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi truy vấn newsletter" });
  }
});

// GET /api/admin/users/stats/dashboard - Get dashboard stats (admin only)
router.get("/stats/dashboard", requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Revenue from PAID orders only - or delivered orders
    const paidOrders = await Order.find({
      $or: [{ status: "Đã thanh toán" }, { status: "Đã giao" }],
    });
    const totalRevenue = paidOrders.reduce(
      (sum, o) => sum + (o.totalPrice || 0),
      0,
    );

    const pendingOrders = await Order.countDocuments({ status: "Chờ xử lý" });

    // Recent orders
    const recentOrders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(6);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Revenue by day (last 7 days) - only paid orders
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          $or: [{ status: "Đã thanh toán" }, { status: "Đã giao" }],
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Revenue by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          $or: [{ status: "Đã thanh toán" }, { status: "Đã giao" }],
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Revenue by year (last 5 years)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    const yearlyRevenue = await Order.aggregate([
      {
        $match: {
          $or: [{ status: "Đã thanh toán" }, { status: "Đã giao" }],
          createdAt: { $gte: fiveYearsAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Custom date range revenue (if provided)
    let customRevenue = [];
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day

      customRevenue = await Order.aggregate([
        {
          $match: {
            $or: [{ status: "Đã thanh toán" }, { status: "Đã giao" }],
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
    }

    // Calculate average order value
    const averageOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      pendingOrders,
      completedOrders: paidOrders.length,
      recentOrders,
      ordersByStatus,
      dailyRevenue,
      monthlyRevenue,
      yearlyRevenue,
      customRevenue,
      averageOrderValue,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res
      .status(500)
      .json({ message: "Lỗi thống kê dashboard", error: error.message });
  }
});

module.exports = router;
