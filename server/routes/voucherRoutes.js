const express = require("express");
const router = express.Router();
const Voucher = require("../models/Voucher");
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");

// @route   GET /api/vouchers/available
// @desc    Get all available active vouchers
// @access  Public
router.get("/available", async (req, res) => {
  try {
    const vouchers = await Voucher.find({
      isActive: true,
      expiryDate: { $gte: new Date() },
      $expr: {
        $or: [
          { $eq: ["$usageLimit", 0] },
          { $lt: ["$usedCount", "$usageLimit"] }
        ]
      }
    }).sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách mã giảm giá", error: error.message });
  }
});

// @route   GET /api/vouchers/my
// @desc    Get user's saved vouchers
// @access  Private
router.get("/my", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedVouchers");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    
    // Filter out expired or invalid vouchers
    const validVouchers = user.savedVouchers.filter(v => 
      v.isActive && 
      new Date(v.expiryDate) >= new Date() && 
      (v.usageLimit === 0 || v.usedCount < v.usageLimit)
    );

    res.json(validVouchers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy mã giảm giá của bạn", error: error.message });
  }
});

// @route   POST /api/vouchers/save
// @desc    Save a voucher to user's wallet
// @access  Private
router.post("/save", protect, async (req, res) => {
  try {
    const { voucherId } = req.body;
    
    const voucher = await Voucher.findById(voucherId);
    if (!voucher || !voucher.isActive || new Date(voucher.expiryDate) < new Date()) {
      return res.status(400).json({ message: "Mã giảm giá không hợp lệ hoặc đã hết hạn" });
    }

    const user = await User.findById(req.user._id);
    
    if (user.savedVouchers.includes(voucherId)) {
      return res.status(400).json({ message: "Bạn đã lưu mã giảm giá này rồi" });
    }

    user.savedVouchers.push(voucherId);
    await user.save();

    res.json({ message: "Đã lưu mã giảm giá thành công", savedVouchers: user.savedVouchers });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lưu mã giảm giá", error: error.message });
  }
});

// @route   POST /api/vouchers/apply
// @desc    User apply voucher code
// @access  Private
router.post("/apply", protect, async (req, res) => {
  const { code, orderValue } = req.body;

  if (!code || orderValue === undefined) {
    return res.status(400).json({ message: "Vui lòng cung cấp mã và giá trị đơn hàng" });
  }

  try {
    const voucher = await Voucher.findOne({ code: code.toUpperCase(), isActive: true });

    if (!voucher) {
      return res.status(404).json({ message: "Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa" });
    }

    if (new Date(voucher.expiryDate) < new Date()) {
      return res.status(400).json({ message: "Mã giảm giá đã hết hạn" });
    }

    if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng" });
    }

    if (orderValue < voucher.minOrderValue) {
      return res.status(400).json({ 
        message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString("vi-VN")}đ để áp dụng mã này` 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (voucher.discountType === "percent") {
      discountAmount = (orderValue * voucher.discountValue) / 100;
    } else if (voucher.discountType === "fixed") {
      discountAmount = voucher.discountValue;
    }

    // Cap at max discount if defined
    if (voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
      discountAmount = voucher.maxDiscount;
    }

    // Don't discount more than 90% of the order value (product price)
    const maxAllowedDiscount = orderValue * 0.9;
    if (discountAmount > maxAllowedDiscount) {
      discountAmount = maxAllowedDiscount;
    }

    res.json({
      _id: voucher._id,
      code: voucher.code,
      discountAmount,
      message: "Áp dụng mã giảm giá thành công",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ khi áp dụng mã", error: error.message });
  }
});

// @route   POST /api/vouchers
// @desc    Admin create voucher
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, expiryDate } = req.body;

    if (discountType === "percent" && (discountValue < 1 || discountValue > 90)) {
      return res.status(400).json({ message: "Phần trăm giảm giá phải nằm trong khoảng từ 1% đến 90%" });
    }

    const voucherExists = await Voucher.findOne({ code: code.toUpperCase() });
    if (voucherExists) {
      return res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
    }

    const voucher = await Voucher.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscount: maxDiscount || 0,
      usageLimit: usageLimit || 0,
      expiryDate,
    });

    res.status(201).json(voucher);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo mã giảm giá", error: error.message });
  }
});

// @route   GET /api/vouchers
// @desc    Admin get all vouchers
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách mã", error: error.message });
  }
});

// @route   PUT /api/vouchers/:id
// @desc    Admin update voucher
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (voucher) {
      const finalDiscountType = req.body.discountType || voucher.discountType;
      const finalDiscountValue = req.body.discountValue !== undefined ? req.body.discountValue : voucher.discountValue;
      if (finalDiscountType === "percent" && (finalDiscountValue < 1 || finalDiscountValue > 90)) {
        return res.status(400).json({ message: "Phần trăm giảm giá phải nằm trong khoảng từ 1% đến 90%" });
      }

      voucher.code = req.body.code ? req.body.code.toUpperCase() : voucher.code;
      voucher.discountType = finalDiscountType;
      voucher.discountValue = finalDiscountValue;
      voucher.minOrderValue = req.body.minOrderValue !== undefined ? req.body.minOrderValue : voucher.minOrderValue;
      voucher.maxDiscount = req.body.maxDiscount !== undefined ? req.body.maxDiscount : voucher.maxDiscount;
      voucher.usageLimit = req.body.usageLimit !== undefined ? req.body.usageLimit : voucher.usageLimit;
      voucher.expiryDate = req.body.expiryDate || voucher.expiryDate;
      voucher.isActive = req.body.isActive !== undefined ? req.body.isActive : voucher.isActive;

      const updatedVoucher = await voucher.save();
      res.json(updatedVoucher);
    } else {
      res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật mã", error: error.message });
  }
});

// @route   DELETE /api/vouchers/:id
// @desc    Admin delete voucher
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (voucher) {
      await voucher.deleteOne();
      res.json({ message: "Đã xóa mã giảm giá" });
    } else {
      res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa mã", error: error.message });
  }
});

module.exports = router;
