const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  // For Gmail, use OAuth2 or App Password
  // For testing, you can use Ethereal: https://ethereal.email/
  
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Default: use Gmail with App Password
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

// Generate OTP (6 digits)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email for login
const sendLoginOTP = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SneakerZone" <${process.env.GMAIL_USER || process.env.SMTP_USER}>`,
      to: email,
      subject: "Mã đăng nhập SneakerZone",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f97316;">
            <h1 style="color: #f97316; margin: 0;">SNEAKERZONE</h1>
          </div>
          <div style="padding: 30px 0;">
            <h2 style="color: #333; margin-bottom: 16px;">Xác thực đăng nhập</h2>
            <p style="color: #666; line-height: 1.6;">
              Chào bạn,
            </p>
            <p style="color: #666; line-height: 1.6;">
              Mã xác thực đăng nhập của bạn là:
            </p>
            <div style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; font-size: 32px; font-weight: bold; 
                        text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 8px; margin: 24px 0;">
              ${otp}
            </div>
            <p style="color: #666; line-height: 1.6;">
              Mã này có hiệu lực trong <strong>5 phút</strong>.
            </p>
            <p style="color: #666; line-height: 1.6;">
              Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
            </p>
          </div>
          <div style="border-top: 1px solid #eee; padding-top: 20px; color: #999; font-size: 12px; text-align: center;">
            <p>© ${new Date().getFullYear()} SneakerZone. Tất cả các quyền được bảo lưu.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending login OTP email:", error);
    return false;
  }
};

// Send OTP email for registration verification
const sendRegistrationOTP = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SneakerZone" <${process.env.GMAIL_USER || process.env.SMTP_USER}>`,
      to: email,
      subject: "Xác thực email đăng ký SneakerZone",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f97316;">
            <h1 style="color: #f97316; margin: 0;">SNEAKERZONE</h1>
          </div>
          <div style="padding: 30px 0;">
            <h2 style="color: #333; margin-bottom: 16px;">Xác thực email</h2>
            <p style="color: #666; line-height: 1.6;">
              Cảm ơn bạn đã đăng ký!
            </p>
            <p style="color: #666; line-height: 1.6;">
              Để hoàn tất đăng ký, vui lòng nhập mã xác thực:
            </p>
            <div style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; font-size: 32px; font-weight: bold; 
                        text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 8px; margin: 24px 0;">
              ${otp}
            </div>
            <p style="color: #666; line-height: 1.6;">
              Mã này có hiệu lực trong <strong>5 phút</strong>.
            </p>
          </div>
          <div style="border-top: 1px solid #eee; padding-top: 20px; color: #999; font-size: 12px; text-align: center;">
            <p>© ${new Date().getFullYear()} SneakerZone. Tất cả các quyền được bảo lưu.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending registration OTP email:", error);
    return false;
  }
};

// Send OTP email for password reset
const sendPasswordResetOTP = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SneakerZone" <${process.env.GMAIL_USER || process.env.SMTP_USER}>`,
      to: email,
      subject: "Đặt lại mật khẩu SneakerZone",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f97316;">
            <h1 style="color: #f97316; margin: 0;">SNEAKERZONE</h1>
          </div>
          <div style="padding: 30px 0;">
            <h2 style="color: #333; margin-bottom: 16px;">Đặt lại mật khẩu</h2>
            <p style="color: #666; line-height: 1.6;">
              Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
            </p>
            <p style="color: #666; line-height: 1.6;">
              Mã xác thực của bạn là:
            </p>
            <div style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; font-size: 32px; font-weight: bold; 
                        text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 8px; margin: 24px 0;">
              ${otp}
            </div>
            <p style="color: #666; line-height: 1.6;">
              Mã này có hiệu lực trong <strong>5 phút</strong>.
            </p>
            <p style="color: #dc2626; line-height: 1.6; background: #fef2f2; padding: 12px; border-radius: 8px;">
              <strong>Lưu ý:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và tài khoản của bạn vẫn an toàn.
            </p>
          </div>
          <div style="border-top: 1px solid #eee; padding-top: 20px; color: #999; font-size: 12px; text-align: center;">
            <p>© ${new Date().getFullYear()} SneakerZone. Tất cả các quyền được bảo lưu.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending password reset OTP email:", error);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendLoginOTP,
  sendRegistrationOTP,
  sendPasswordResetOTP,
};
