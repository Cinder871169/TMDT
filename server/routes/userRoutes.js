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
      points: updatedUser.points,
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
    points: user.points,
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

// @route   GET /api/users/auth/test-email
// @desc    Test email configuration (Brevo HTTP API or SMTP)
// @access  Public
router.get("/auth/test-email", async (req, res) => {
  try {
    // Check if using Brevo HTTP API
    if (process.env.BREVO_API_KEY) {
      const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.GMAIL_USER || "noreply@sneakerzone.com";
      const testRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: "SneakerZone", email: senderEmail },
          to: [{ email: senderEmail }], // Send test to self
          subject: "SneakerZone Email Test",
          htmlContent: "<p>Test email from SneakerZone API via Brevo</p>",
        }),
      });

      const data = await testRes.json();
      if (testRes.ok) {
        return res.json({
          success: true,
          mode: "Brevo HTTP API",
          message: "Email sent successfully via Brevo!",
          messageId: data.messageId,
        });
      } else {
        return res.status(500).json({
          success: false,
          mode: "Brevo HTTP API",
          message: "Brevo API call failed",
          error: data,
        });
      }
    }

    // Fallback: test SMTP
    const { createTransporter } = require("../services/emailService");
    const transporter = createTransporter();
    await transporter.verify();
    
    res.json({
      success: true,
      mode: "Gmail SMTP",
      message: "SMTP connection verified successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mode: process.env.BREVO_API_KEY ? "Brevo HTTP API" : "Gmail SMTP",
      message: "Email connection failed!",
      error: error.message,
    });
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
// ================= Social Login OAuth Endpoints =================

// @route   GET /api/users/auth/google
// @desc    Redirect to Google OAuth consent screen
// @access  Public
router.get("/auth/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h2>Chưa cấu hình Google Client ID!</h2>
        <p>Vui lòng cấu hình biến môi trường <code>GOOGLE_CLIENT_ID</code> trên máy chủ trước khi sử dụng tính năng này.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="color: orange; text-decoration: none; font-weight: bold;">Quay lại trang đăng nhập</a>
      </div>
    `);
  }
  const redirectUri = `${req.protocol}://${req.get("host")}/api/users/auth/google/callback`;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent("profile email")}`;
  res.redirect(authUrl);
});

// @route   GET /api/users/auth/google/callback
// @desc    Handle Google OAuth callback
// @access  Public
router.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_denied`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${req.protocol}://${req.get("host")}/api/users/auth/google/callback`;

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error("Google token exchange error:", tokenData);
      throw new Error(tokenData.error_description || "Token exchange failed");
    }

    const { access_token } = tokenData;

    // Fetch user info from Google
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const googleUser = await userInfoResponse.json();
    if (!userInfoResponse.ok) {
      console.error("Google userinfo fetch error:", googleUser);
      throw new Error("Failed to fetch Google user profile");
    }

    const { email, name } = googleUser;
    if (!email) {
      throw new Error("Không thể truy xuất địa chỉ email từ tài khoản Google của bạn");
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        isVerified: true
      });
    }

    const token = generateToken(user._id);
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      phone: user.phone || "",
      address: user.address || "",
      token
    };

    // Redirect to frontend with token and user info
    const clientRedirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
    res.redirect(clientRedirectUrl);
  } catch (error) {
    console.error("Google Auth error:", error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(error.message || "google_auth_failed")}`);
  }
});

// @route   GET /api/users/auth/facebook
// @desc    Redirect to Facebook OAuth consent screen
// @access  Public
router.get("/auth/facebook", (req, res) => {
  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    return res.send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h2>Chưa cấu hình Facebook App ID!</h2>
        <p>Vui lòng cấu hình biến môi trường <code>FACEBOOK_APP_ID</code> trên máy chủ trước khi sử dụng tính năng này.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="color: orange; text-decoration: none; font-weight: bold;">Quay lại trang đăng nhập</a>
      </div>
    `);
  }
  const redirectUri = `${req.protocol}://${req.get("host")}/api/users/auth/facebook/callback`;
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent("email,public_profile")}`;
  res.redirect(authUrl);
});

// @route   GET /api/users/auth/facebook/callback
// @desc    Handle Facebook OAuth callback
// @access  Public
router.get("/auth/facebook/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_denied`);
  }

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = `${req.protocol}://${req.get("host")}/api/users/auth/facebook/callback`;

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`);
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error("Facebook token exchange error:", tokenData);
      throw new Error(tokenData.error?.message || "Token exchange failed");
    }

    const { access_token } = tokenData;

    // Fetch user profile from Facebook
    const userInfoResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${access_token}`);
    const facebookUser = await userInfoResponse.json();
    if (!userInfoResponse.ok) {
      console.error("Facebook profile fetch error:", facebookUser);
      throw new Error("Failed to fetch Facebook user profile");
    }

    const { name, email } = facebookUser;
    
    // In case Facebook user does not share email, create a dummy or use facebook id as email placeholder
    const finalEmail = email || `${facebookUser.id}@facebook.com`;

    // Find or create user
    let user = await User.findOne({ email: finalEmail });
    if (!user) {
      user = await User.create({
        name: name || finalEmail.split("@")[0],
        email: finalEmail,
        isVerified: true
      });
    }

    const token = generateToken(user._id);
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      phone: user.phone || "",
      address: user.address || "",
      token
    };

    // Redirect to frontend with token and user info
    const clientRedirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
    res.redirect(clientRedirectUrl);
  } catch (error) {
    console.error("Facebook Auth error:", error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(error.message || "facebook_auth_failed")}`);
  }
});

module.exports = router;
