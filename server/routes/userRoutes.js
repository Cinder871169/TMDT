const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Newsletter = require("../models/Newsletter");
const Contact = require("../models/Contact");
const Wishlist = require("../models/Wishlist");
const jwt = require("jsonwebtoken");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  generateOTP,
  sendLoginOTP,
  sendRegistrationOTP,
  sendPasswordResetOTP,
} = require("../services/emailService");
const {
  validate,
  registerSchema,
  sendOtpSchema,
  verifyOtpSchema,
  newsletterSchema,
  contactSchema,
  profileUpdateSchema,
  changePasswordSchema,
  loginSchema,
} = require("../middleware/validation");

// Email validation regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Hàm tạo Token JWT (bao gồm instanceId để invalidate sau restart)
const generateToken = (id) => {
  const payload = { id };
  if (process.INSTANCE_ID) payload.instanceId = process.INSTANCE_ID;
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @route   POST /api/users/register
router.post("/register", validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
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
router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      phone: user.phone,
      address: user.address,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
  }
});

// @route   PUT /api/users/profile
router.put(
  "/profile",
  protect,
  validate(profileUpdateSchema),
  async (req, res) => {
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
  },
);

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
router.put(
  "/change-password",
  protect,
  validate(changePasswordSchema),
  async (req, res) => {
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
  },
);

// @route   POST /api/users/newsletter
router.post("/newsletter", validate(newsletterSchema), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng nhập email" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
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
router.post("/contact", validate(contactSchema), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
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

// ==========================================
// OTP Authentication Routes
// ==========================================

// @route   POST /api/users/auth/send-otp
// @desc    Send OTP for login (email + password) or registration
// @access  Public
router.post("/auth/send-otp", validate(sendOtpSchema), async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng nhập email" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    const user = await User.findOne({ email });

    if (type === "login") {
      // Login with password + OTP
      if (!user) {
        return res.status(404).json({ message: "Tài khoản không tồn tại" });
      }

      // Generate OTP
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await user.save({ validateBeforeSave: false });

      // Send email
      const sent = await sendLoginOTP(email, otp);
      if (!sent) {
        return res
          .status(500)
          .json({ message: "Không thể gửi mã OTP. Vui lòng thử lại." });
      }

      res.json({ message: "Mã OTP đã được gửi đến email của bạn", email });
    } else if (type === "register") {
      // Registration - check if email exists
      if (user) {
        return res.status(400).json({ message: "Email đã được sử dụng" });
      }

      // Generate OTP
      const otp = generateOTP();
      const tempUser = new User({
        email,
        name: "TempUser",
        password: "temp",
        isVerified: false,
        otp,
        otpExpires: new Date(Date.now() + 5 * 60 * 1000),
      });
      await tempUser.save({ validateBeforeSave: false });

      // Send email
      const sent = await sendRegistrationOTP(email, otp);
      if (!sent) {
        return res
          .status(500)
          .json({ message: "Không thể gửi mã OTP. Vui lòng thử lại." });
      }

      res.json({ message: "Mã OTP đã được gửi đến email của bạn", email });
    } else {
      return res.status(400).json({ message: "Loại xác thực không hợp lệ" });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

// @route   POST /api/users/auth/verify-otp
// @desc    Verify OTP and complete login/register/forgot-password
// @access  Public
router.post("/auth/verify-otp", validate(verifyOtpSchema), async (req, res) => {
  try {
    const { email, otp, type, name, password } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Vui lòng nhập mã OTP" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Mã OTP không đúng" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;

    if (type === "login") {
      // Login - just verify OTP and return token
      user.save({ validateBeforeSave: false });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        phone: user.phone,
        address: user.address,
        token: generateToken(user._id),
      });
    } else if (type === "register") {
      // Complete registration
      if (!name || !password) {
        return res
          .status(400)
          .json({ message: "Vui lòng nhập đầy đủ thông tin" });
      }

      user.name = name;
      user.password = password;
      user.isVerified = true;
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        phone: user.phone,
        address: user.address,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: "Loại xác thực không hợp lệ" });
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

// @route   POST /api/users/auth/forgot-password/send-otp
// @desc    Send OTP for password reset
// @access  Public
router.post("/auth/forgot-password/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng nhập email" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: "Nếu email tồn tại, mã OTP đã được gửi" });
    }

    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // Send email
    const sent = await sendPasswordResetOTP(email, otp);
    if (!sent) {
      return res
        .status(500)
        .json({ message: "Không thể gửi mã OTP. Vui lòng thử lại." });
    }

    res.json({ message: "Mã OTP đã được gửi đến email của bạn", email });
  } catch (error) {
    console.error("Forgot password send OTP error:", error);
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

// @route   POST /api/users/auth/forgot-password/reset
// @desc    Reset password with OTP
// @access  Public
router.post("/auth/forgot-password/reset", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Mã OTP không đúng" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    // Update password
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Mật khẩu đã được đặt lại thành công" });
  } catch (error) {
    console.error("Forgot password reset error:", error);
    res.status(500).json({ message: error.message || "Lỗi máy chủ" });
  }
});

module.exports = router;
