const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (
        decoded.instanceId &&
        process.INSTANCE_ID &&
        decoded.instanceId !== process.INSTANCE_ID
      ) {
        return res
          .status(401)
          .json({ message: "Phiên đã hết hạn, vui lòng đăng nhập lại." });
      }

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          message: "Token không hợp lệ hoặc người dùng không tồn tại",
        });
      }

      if (!req.user.isAdmin) {
        return res.status(403).json({
          message: "Bạn không có quyền truy cập khu vực quản trị",
        });
      }

      return next();
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

module.exports = { requireAdmin };
