const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Newsletter = require("../models/Newsletter");
const Contact = require("../models/Contact");
const Wishlist = require("../models/Wishlist");
const jwt = require("jsonwebtoken");
const { protect, admin } = require("../middleware/authMiddleware");

// Hàm tạo Token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @route   POST /api/users/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const userExists = await User.findOne({ email });

    if (userExists)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Không thể tạo tài khoản" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

// @route   POST /api/users/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
  }
});

// @route   PUT /api/users/profile
router.put("/profile", protect, async (req, res) => {
  const update = {};

  if (typeof req.body.name !== "undefined") update.name = req.body.name;
  if (typeof req.body.phone !== "undefined") update.phone = req.body.phone;
  if (typeof req.body.address !== "undefined")
    update.address = req.body.address;

  const updatedUser = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return res.status(404).json({ message: "Người dùng không tồn tại" });
  }

  return res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    phone: updatedUser.phone,
    address: updatedUser.address,
    token: generateToken(updatedUser._id),
  });
});

// @route   GET /api/users/profile
router.get("/profile", protect, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({ message: "Người dùng không tồn tại" });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    phone: user.phone,
    address: user.address,
  });
});

// @route   PUT /api/users/change-password
router.put("/change-password", protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "Người dùng không tồn tại" });
  }

  const { oldPassword, newPassword } = req.body;

  // Verify old password
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Nhập cả mật khẩu cũ và mới" });
  }

  const isPasswordCorrect = await user.matchPassword(oldPassword);
  if (!isPasswordCorrect) {
    return res.status(401).json({ message: "Mật khẩu cũ không đúng" });
  }

  // Update password (will be hashed by pre-save hook)
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  res.json({ message: "Mật khẩu được cập nhật thành công" });
});

// @route   POST /api/users/newsletter
router.post("/newsletter", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng nhập email" });
    }

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email đã đăng ký" });
    }

    const newsletter = await Newsletter.create({ email });
    res.status(201).json({ message: "Đăng ký newsletter thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

// @route   POST /api/users/contact
router.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const contact = await Contact.create({ name, email, subject, message });
    res.status(201).json({ message: "Gửi liên hệ thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

// @route   GET /api/users/contacts (Admin only)
router.get("/contacts", protect, admin, async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

// @route   POST /api/users/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng nhập email" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email không tồn tại trong hệ thống" });
    }

    // Generate reset token (simple implementation - in production use JWT or crypto)
    const resetToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Store reset token with expiry (1 hour)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // In a real app, send email with reset link
    // For demo, just return the token
    res.json({
      message: "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn",
      resetToken: resetToken, // Remove this in production
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

// @route   GET /api/users/wishlist
router.get("/wishlist", protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products",
    );
    if (!wishlist) {
      return res.json({ products: [] });
    }
    res.json({ products: wishlist.products });
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

// @route   POST /api/users/wishlist/:productId
router.post("/wishlist/:productId", protect, async (req, res) => {
  try {
    const productId = req.params.productId;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [productId],
      });
    } else {
      if (wishlist.products.includes(productId)) {
        return res
          .status(400)
          .json({ message: "Sản phẩm đã có trong wishlist" });
      }
      wishlist.products.push(productId);
      await wishlist.save();
    }

    await wishlist.populate("products");
    res.json({ message: "Đã thêm vào wishlist", products: wishlist.products });
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

// @route   DELETE /api/users/wishlist/:productId
router.delete("/wishlist/:productId", protect, async (req, res) => {
  try {
    const productId = req.params.productId;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist không tồn tại" });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId,
    );
    await wishlist.save();
    await wishlist.populate("products");

    res.json({ message: "Đã xóa khỏi wishlist", products: wishlist.products });
  } catch (error) {
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

module.exports = router;
