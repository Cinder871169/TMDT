const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

// Store conversation history in memory for simple implementation
// In a real app, this should be stored in MongoDB or Redis per user
const chatHistories = new Map();

router.post('/', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ reply: "Xin lỗi, tin nhắn trống!" });
    }

    // Fallback if API key is not configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      // Simulate keyword matching as fallback
      const lowerMessage = message.toLowerCase();
      let botReply = "Xin lỗi, tính năng AI hiện chưa được cấu hình API Key. Mình chỉ có thể trả lời theo kịch bản sẵn có. Bạn cần hỗ trợ về giá, size hay vận chuyển ạ?";

      if (lowerMessage.includes("size") || lowerMessage.includes("kích cỡ")) {
        botReply = "SneakerZone có đầy đủ các size từ 36 đến 44 nha bạn!";
      } else if (lowerMessage.includes("giá") || lowerMessage.includes("bao nhiêu")) {
        botReply = "Bạn có thể vào trang Sản phẩm để xem mức giá chi tiết nhé!";
      }
      
      return res.json({ reply: botReply });
    }

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Initialize or get chat history
    const userSessionId = sessionId || 'default-session';
    if (!chatHistories.has(userSessionId)) {
      // Fetch dynamic products from Database
      const products = await Product.find({}).select('name brand price countInStock sizes').limit(50);
      
      let productInfoStr = "Hiện tại cửa hàng không có sẵn dữ liệu sản phẩm.";
      if (products && products.length > 0) {
        productInfoStr = products.map(p => 
          `- ${p.name} (${p.brand}): Giá ${p.price.toLocaleString('vi-VN')}đ, Size: [${p.sizes.join(', ')}], Còn hàng: ${p.countInStock > 0 ? 'Có' : 'Hết'}`
        ).join('\n');
      }

      chatHistories.set(userSessionId, [
        {
          role: "user",
          parts: [{ text: `Bạn là trợ lý ảo AI tên là 'SZ Assistant' của cửa hàng giày SneakerZone.
Quy định:
- Luôn thân thiện, xưng là 'mình', gọi khách là 'bạn'.
- Trả lời ngắn gọn, tối đa 3-4 câu.
- Dưới đây là danh sách sản phẩm THỰC TẾ của cửa hàng trong Database:
${productInfoStr}
- Nếu khách hỏi sản phẩm không có trong danh sách trên, hãy xin lỗi và báo là cửa hàng chưa nhập mẫu đó.`}]
        },
        {
          role: "model",
          parts: [{ text: "Vâng, mình đã hiểu. Mình sẽ sử dụng danh sách sản phẩm bạn vừa cung cấp để tư vấn chính xác cho khách hàng."}]
        }
      ]);
    }

    const history = chatHistories.get(userSessionId);

    // Create a chat session with history
    const chat = model.startChat({ history });

    // Send the user message
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const replyText = response.text();

    // Update history manually so it persists correctly (startChat handles this in memory, but we keep track)
    history.push({ role: "user", parts: [{ text: message }] });
    history.push({ role: "model", parts: [{ text: replyText }] });

    res.json({ reply: replyText });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ reply: "Xin lỗi, mình đang gặp sự cố kết nối. Vui lòng thử lại sau hoặc liên hệ Hotline 0988 888 888 nhé!" });
  }
});

module.exports = router;
