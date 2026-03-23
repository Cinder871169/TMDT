const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ⚠️ Lấy user từ DB (chuẩn)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          message: "Token không hợp lệ hoặc người dùng không tồn tại",
        });
      }

      return next(); // ✅ phải return

    } catch (error) {
      return res.status(401).json({
        message: "Token không hợp lệ",
      });
    }
  }

  return res.status(401).json({
    message: "Bạn chưa đăng nhập!",
  });
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next(); // ✅
  } else {
    return res.status(401).json({
      message: "Bạn không có quyền truy cập vào khu vực Admin",
    });
  }
};

module.exports = { protect, admin };