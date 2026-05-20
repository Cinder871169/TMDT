const nodemailer = require("nodemailer");
const dns = require("dns");

// Force Node.js to resolve DNS as IPv4 first.
dns.setDefaultResultOrder("ipv4first");

// ============================================================
// EMAIL SENDING STRATEGY:
// 1. If BREVO_API_KEY is set → use Brevo HTTP API (works on Render Free Tier, sends to ANY email)
// 2. Otherwise → use Gmail SMTP via Nodemailer (works on local / paid hosting)
// ============================================================

// --- Brevo (Sendinblue) HTTP API sender (bypasses SMTP port blocking) ---
const sendViaBrevo = async (to, subject, html) => {
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.GMAIL_USER || "noreply@sneakerzone.com";
  const senderName = process.env.BREVO_SENDER_NAME || "SneakerZone";

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Brevo API error: ${JSON.stringify(err)}`);
  }
  return true;
};

// --- Gmail SMTP sender (for local development) ---
const createTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      family: 4,
    });
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

const sendViaSmtp = async (to, subject, html) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"SneakerZone" <${process.env.GMAIL_USER || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
  return true;
};

// --- Unified email sender: picks the right method automatically ---
const sendEmail = async (to, subject, html) => {
  if (process.env.BREVO_API_KEY) {
    return sendViaBrevo(to, subject, html);
  }
  return sendViaSmtp(to, subject, html);
};

// Generate OTP (6 digits)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============================================================
// Email template functions (unchanged HTML templates)
// ============================================================

// Send OTP email for login
const sendLoginOTP = async (email, otp) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f97316;">
          <h1 style="color: #f97316; margin: 0;">SNEAKERZONE</h1>
        </div>
        <div style="padding: 30px 0;">
          <h2 style="color: #333; margin-bottom: 16px;">Xác thực đăng nhập</h2>
          <p style="color: #666; line-height: 1.6;">Chào bạn,</p>
          <p style="color: #666; line-height: 1.6;">Mã xác thực đăng nhập của bạn là:</p>
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; font-size: 32px; font-weight: bold; 
                      text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 8px; margin: 24px 0;">
            ${otp}
          </div>
          <p style="color: #666; line-height: 1.6;">Mã này có hiệu lực trong <strong>5 phút</strong>.</p>
          <p style="color: #666; line-height: 1.6;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
        </div>
        <div style="border-top: 1px solid #eee; padding-top: 20px; color: #999; font-size: 12px; text-align: center;">
          <p>© ${new Date().getFullYear()} SneakerZone. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    `;
    await sendEmail(email, "Mã đăng nhập SneakerZone", html);
    return true;
  } catch (error) {
    console.error("Error sending login OTP email:", error);
    return false;
  }
};

// Send OTP email for registration verification
const sendRegistrationOTP = async (email, otp) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f97316;">
          <h1 style="color: #f97316; margin: 0;">SNEAKERZONE</h1>
        </div>
        <div style="padding: 30px 0;">
          <h2 style="color: #333; margin-bottom: 16px;">Xác thực email</h2>
          <p style="color: #666; line-height: 1.6;">Cảm ơn bạn đã đăng ký!</p>
          <p style="color: #666; line-height: 1.6;">Để hoàn tất đăng ký, vui lòng nhập mã xác thực:</p>
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; font-size: 32px; font-weight: bold; 
                      text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 8px; margin: 24px 0;">
            ${otp}
          </div>
          <p style="color: #666; line-height: 1.6;">Mã này có hiệu lực trong <strong>5 phút</strong>.</p>
        </div>
        <div style="border-top: 1px solid #eee; padding-top: 20px; color: #999; font-size: 12px; text-align: center;">
          <p>© ${new Date().getFullYear()} SneakerZone. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    `;
    await sendEmail(email, "Xác thực email đăng ký SneakerZone", html);
    return true;
  } catch (error) {
    console.error("Error sending registration OTP email:", error);
    return false;
  }
};

// Send OTP email for password reset
const sendPasswordResetOTP = async (email, otp) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f97316;">
          <h1 style="color: #f97316; margin: 0;">SNEAKERZONE</h1>
        </div>
        <div style="padding: 30px 0;">
          <h2 style="color: #333; margin-bottom: 16px;">Đặt lại mật khẩu</h2>
          <p style="color: #666; line-height: 1.6;">Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p style="color: #666; line-height: 1.6;">Mã xác thực của bạn là:</p>
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; font-size: 32px; font-weight: bold; 
                      text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 8px; margin: 24px 0;">
            ${otp}
          </div>
          <p style="color: #666; line-height: 1.6;">Mã này có hiệu lực trong <strong>5 phút</strong>.</p>
          <p style="color: #dc2626; line-height: 1.6; background: #fef2f2; padding: 12px; border-radius: 8px;">
            <strong>Lưu ý:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và tài khoản của bạn vẫn an toàn.
          </p>
        </div>
        <div style="border-top: 1px solid #eee; padding-top: 20px; color: #999; font-size: 12px; text-align: center;">
          <p>© ${new Date().getFullYear()} SneakerZone. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    `;
    await sendEmail(email, "Đặt lại mật khẩu SneakerZone", html);
    return true;
  } catch (error) {
    console.error("Error sending password reset OTP email:", error);
    return false;
  }
};

// Send Order Confirmation Email
const sendOrderConfirmationEmail = async (email, order) => {
  try {
    const orderItemsHtml = order.orderItems.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 0;">
          <div style="font-weight: bold; color: #333;">${item.name}</div>
          <div style="color: #666; font-size: 13px;">Size: ${item.size} | Màu: ${item.color}</div>
        </td>
        <td style="padding: 12px 0; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right; font-weight: bold;">${(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
      </tr>
    `).join('');

    let paymentMethodText = "Thanh toán khi nhận hàng (COD)";
    if (order.paymentMethod === "vietqr") paymentMethodText = "Chuyển khoản mã QR (VietQR)";
    if (order.paymentMethod === "banking") paymentMethodText = "Chuyển khoản ngân hàng";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f97316;">
          <h1 style="color: #f97316; margin: 0;">SNEAKERZONE</h1>
        </div>
        <div style="padding: 30px 0;">
          <h2 style="color: #333; margin-top: 0;">Cảm ơn bạn đã đặt hàng!</h2>
          <p style="color: #666; line-height: 1.6;">Xin chào <strong>${order.name || order.shippingAddress?.fullName || 'bạn'}</strong>,</p>
          <p style="color: #666; line-height: 1.6;">Hệ thống đã ghi nhận đơn hàng của bạn thành công. Dưới đây là thông tin chi tiết đơn hàng:</p>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; color: #333;"><strong>Mã đơn hàng:</strong> #${order._id.toString().substring(0, 8).toUpperCase()}</p>
            <p style="margin: 0 0 8px 0; color: #333;"><strong>Địa chỉ giao hàng:</strong> ${order.address || (order.shippingAddress ? order.shippingAddress.address + ', ' + order.shippingAddress.ward : '')}</p>
            <p style="margin: 0 0 8px 0; color: #333;"><strong>Số điện thoại:</strong> ${order.phone || order.shippingAddress?.phone}</p>
            <p style="margin: 0; color: #333;"><strong>Phương thức thanh toán:</strong> ${paymentMethodText}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #eee; color: #666; text-align: left;">
                <th style="padding: 12px 0;">Sản phẩm</th>
                <th style="padding: 12px 0; text-align: center;">SL</th>
                <th style="padding: 12px 0; text-align: right;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 16px 0 8px 0; text-align: right; color: #666;">Tạm tính:</td>
                <td style="padding: 16px 0 8px 0; text-align: right; font-weight: bold;">${(order.totalPrice + order.discount - order.shippingFee).toLocaleString('vi-VN')}đ</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px 0; text-align: right; color: #666;">Phí vận chuyển:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${order.shippingFee.toLocaleString('vi-VN')}đ</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px 0; text-align: right; color: #666;">Giảm giá:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #16a34a;">-${(order.discount || 0).toLocaleString('vi-VN')}đ</td>
              </tr>
              <tr style="border-top: 2px solid #eee;">
                <td colspan="2" style="padding: 16px 0 0 0; text-align: right; font-weight: bold; color: #333; font-size: 16px;">TỔNG CỘNG:</td>
                <td style="padding: 16px 0 0 0; text-align: right; font-weight: bold; color: #f97316; font-size: 18px;">${order.totalPrice.toLocaleString('vi-VN')}đ</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div style="border-top: 1px solid #eee; padding-top: 20px; color: #999; font-size: 12px; text-align: center;">
          <p>Bạn có thể theo dõi trạng thái đơn hàng trên website của chúng tôi.</p>
          <p>© ${new Date().getFullYear()} SneakerZone. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    `;
    
    await sendEmail(email, `Xác nhận đơn hàng #${order._id.toString().substring(0, 8).toUpperCase()} - SneakerZone`, html);
    return true;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return false;
  }
};

// Send Order Status Update Email
const sendOrderStatusEmail = async (email, order) => {
  try {
    let statusText = "";
    let statusColor = "#333";
    let message = "";

    switch(order.status) {
      case "Đang đóng gói":
        statusText = "Đang đóng gói";
        statusColor = "#eab308";
        message = "Đơn hàng của bạn đang được đóng gói và chuẩn bị giao cho đơn vị vận chuyển.";
        break;
      case "Đang vận chuyển":
        statusText = "Đang vận chuyển";
        statusColor = "#3b82f6";
        message = "Đơn hàng của bạn đã được giao cho đơn vị vận chuyển và đang trên đường đến với bạn.";
        break;
      case "Đã giao":
        statusText = "Đã giao thành công";
        statusColor = "#22c55e";
        message = "Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua sắm tại SneakerZone!";
        break;
      case "Đã hủy":
        statusText = "Đã hủy";
        statusColor = "#ef4444";
        message = "Đơn hàng của bạn đã bị hủy. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ hotline.";
        break;
      default:
        statusText = order.status;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f97316;">
          <h1 style="color: #f97316; margin: 0;">SNEAKERZONE</h1>
        </div>
        <div style="padding: 30px 0;">
          <h2 style="color: #333; margin-bottom: 16px;">Cập nhật trạng thái đơn hàng</h2>
          <p style="color: #666; line-height: 1.6;">
            Chào <strong>${order.name}</strong>,
          </p>
          <p style="color: #666; line-height: 1.6;">
            Trạng thái đơn hàng <strong>#${order._id.toString().substring(0, 8).toUpperCase()}</strong> của bạn đã được cập nhật thành:
          </p>
          <div style="background: ${statusColor}15; color: ${statusColor}; font-size: 24px; font-weight: bold; 
                      text-align: center; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid ${statusColor}30;">
            ${statusText.toUpperCase()}
          </div>
          <p style="color: #666; line-height: 1.6;">
            ${message}
          </p>
        </div>
        <div style="border-top: 1px solid #eee; padding-top: 20px; color: #999; font-size: 12px; text-align: center;">
          <p>© ${new Date().getFullYear()} SneakerZone. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    `;

    await sendEmail(email, `Cập nhật đơn hàng #${order._id.toString().substring(0, 8).toUpperCase()} - SneakerZone`, html);
    return true;
  } catch (error) {
    console.error("Error sending order status email:", error);
    return false;
  }
};

module.exports = {
  createTransporter,
  generateOTP,
  sendLoginOTP,
  sendRegistrationOTP,
  sendPasswordResetOTP,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
};
