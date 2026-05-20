import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userInfo } = useAuthStore();
  const [sessionId, setSessionId] = useState("");
  
  // Update sessionId when user logs in or out
  useEffect(() => {
    if (userInfo?._id) {
      // User is logged in: use their unique user-based sessionId
      setSessionId(`user-session-${userInfo._id}`);
    } else {
      // Guest: use guest-based sessionId from localStorage
      let guestSid = localStorage.getItem("chatGuestSessionId");
      if (!guestSid) {
        guestSid = `guest-session-${Math.random().toString(36).substring(7)}`;
        localStorage.setItem("chatGuestSessionId", guestSid);
      }
      setSessionId(guestSid);
    }
  }, [userInfo]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! 👋 Mình là trợ lý ảo của SneakerZone. Mình có thể giúp gì cho bạn?",
      isBot: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch past chat history from MongoDB on mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chat/${sessionId}`);
        const data = await res.json();
        if (data && data.length > 0) {
          // Keep the initial welcome message, then append rest of history
          setMessages([
            {
              id: 1,
              text: "Xin chào! 👋 Mình là trợ lý ảo của SneakerZone. Mình có thể giúp gì cho bạn?",
              isBot: true,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            ...data
          ]);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    fetchChatHistory();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const newUserMsg = {
      id: Date.now(),
      text: userText,
      isBot: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Call backend API which uses Gemini AI and saves in MongoDB
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userText, 
          sessionId,
          userId: userInfo?._id || null
        })
      });

      const data = await response.json();
      
      const botResponse = {
        id: Date.now() + 1,
        text: data.reply || "Xin lỗi, hiện tại mình đang quá tải, vui lòng thử lại sau!",
        isBot: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        text: "Xin lỗi, tính năng AI đang gặp sự cố. Bạn vui lòng liên hệ hotline 0988 888 888 nhé!",
        isBot: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-50">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        } transition-all duration-300 bg-orange-600 hover:bg-orange-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/40`}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      <div
        className={`absolute bottom-0 right-0 w-[350px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot size={24} />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-orange-600 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-black tracking-wide text-sm">SZ Assistant</h3>
              <p className="text-xs text-white/80 font-medium">Trực tuyến</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="h-[350px] overflow-y-auto p-4 bg-gray-50/50 space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[80%] ${
                msg.isBot ? 'items-start' : 'items-end ml-auto'
              }`}
            >
              <div className="flex items-end gap-2 mb-1">
                {msg.isBot && (
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-orange-600" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-sm ${
                    msg.isBot
                      ? 'bg-white text-gray-700 border border-gray-100 rounded-bl-none shadow-sm'
                      : 'bg-orange-600 text-white rounded-br-none shadow-md shadow-orange-500/20'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
              <span className="text-[10px] text-gray-400 px-8">
                {msg.time}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-end gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-orange-600" />
              </div>
              <div className="bg-white p-3 rounded-2xl border border-gray-100 rounded-bl-none shadow-sm flex items-center gap-1.5 h-[42px]">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-orange-500 border-2 text-sm rounded-xl px-4 py-2.5 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-10 h-10 bg-orange-600 text-white flex items-center justify-center rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:hover:bg-orange-600 transition-colors"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
