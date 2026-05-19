const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');
const ChatSession = require('../models/ChatSession');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

// ✅ GET Chat History by sessionId
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const chatSession = await ChatSession.findOne({ sessionId });
    
    if (!chatSession) {
      return res.json([]);
    }

    // Filter out the initial developer prompt messages (index 0 and 1)
    // so the client only sees real conversations
    const userHistory = chatSession.history.slice(2).map((item, idx) => ({
      id: idx + 2,
      text: item.parts[0]?.text || "",
      isBot: item.role === "model",
      time: new Date(chatSession.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    res.json(userHistory);
  } catch (error) {
    console.error("Fetch chat history error:", error);
    res.status(500).json({ message: "Lỗi tải lịch sử chat" });
  }
});

// ✅ POST Send Chat Message
router.post('/', async (req, res) => {
  try {
    const { message, sessionId, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ reply: "Xin lỗi, tin nhắn trống!" });
    }

    // Fallback if API key is not configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      const lowerMessage = message.toLowerCase();
      let botReply = "Xin lỗi, tính năng AI hiện chưa được cấu hình API Key. Mình chỉ có thể trả lời theo kịch bản sẵn có. Bạn cần hỗ trợ về giá, size hay vận chuyển ạ?";

      if (lowerMessage.includes("size") || lowerMessage.includes("kích cỡ")) {
        botReply = "SneakerZone có đầy đủ các size từ 36 đến 44 nha bạn!";
      } else if (lowerMessage.includes("giá") || lowerMessage.includes("bao nhiêu")) {
        botReply = "Bạn có thể vào trang Sản phẩm để xem mức giá chi tiết nhé!";
      }
      
      return res.json({ reply: botReply });
    }

    const userSessionId = sessionId || 'default-session';
    
    // Find or create chat session in MongoDB
    let chatSession = await ChatSession.findOne({ sessionId: userSessionId });
    
    if (!chatSession) {
      // Fetch dynamic products from Database to feed to the model as context
      const products = await Product.find({}).select('name brand price countInStock sizes').limit(50);
      
      let productInfoStr = "Hiện tại cửa hàng không có sẵn dữ liệu sản phẩm.";
      if (products && products.length > 0) {
        productInfoStr = products.map(p => 
          `- ${p.name} (${p.brand}): Giá ${p.price.toLocaleString('vi-VN')}đ, Size: [${p.sizes.join(', ')}], Còn hàng: ${p.countInStock > 0 ? 'Có' : 'Hết'}`
        ).join('\n');
      }

      chatSession = new ChatSession({
        sessionId: userSessionId,
        user: userId || null,
        history: [
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
        ]
      });
      await chatSession.save();
    } else if (userId && !chatSession.user) {
      // Link user ID to session if they just logged in
      chatSession.user = userId;
      await chatSession.save();
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format history for GoogleGenerativeAI
    const formattedHistory = chatSession.history.map(item => ({
      role: item.role,
      parts: [{ text: item.parts[0].text }]
    }));

    // Create a chat session with history
    const chat = model.startChat({ history: formattedHistory });

    // Send the user message
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const replyText = response.text();

    // Push new conversation turn to MongoDB array
    chatSession.history.push({ role: "user", parts: [{ text: message }] });
    chatSession.history.push({ role: "model", parts: [{ text: replyText }] });
    await chatSession.save();

    res.json({ reply: replyText });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ reply: "Xin lỗi, mình đang gặp sự cố kết nối. Vui lòng thử lại sau hoặc liên hệ Hotline 0988 888 888 nhé!" });
  }
});

module.exports = router;
