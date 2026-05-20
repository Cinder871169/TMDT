import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
import { Link } from "react-router-dom";
import { Tag, Sparkles } from "lucide-react";

export default function Vouchers() {
  const { userInfo } = useAuthStore();
  const [myVouchers, setMyVouchers] = useState([]);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVouchers();
  }, [userInfo]);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const availableRes = await axios.get(`${API_BASE}/api/vouchers/available`);
      
      let savedIds = [];
      if (userInfo) {
        const myRes = await axios.get(`${API_BASE}/api/vouchers/my`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setMyVouchers(myRes.data);
        savedIds = myRes.data.map(v => v._id);
      }
      
      setAvailableVouchers(availableRes.data.filter(v => !savedIds.includes(v._id)));
    } catch (err) {
      console.error("Lỗi tải mã giảm giá", err);
    } finally {
      setLoading(false);
    }
  };

  const saveVoucher = async (voucherId) => {
    if (!userInfo) {
      alert("Vui lòng đăng nhập để lưu mã giảm giá");
      return;
    }
    
    try {
      await axios.post(
        `${API_BASE}/api/vouchers/save`,
        { voucherId },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      loadVouchers();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi lưu mã");
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 text-center animate-pulse font-bold text-gray-500">
        Đang tải danh sách khuyến mãi...
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 flex items-center justify-center gap-3">
            <Tag className="w-10 h-10 text-orange-500" />
            Trung tâm Khuyến mãi
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Khám phá các mã giảm giá hấp dẫn đang diễn ra. Lưu mã ngay và sử dụng ở bước thanh toán để mua sắm tiết kiệm nhất!
          </p>
        </div>

        {/* Available Vouchers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-500" />
            Mã giảm giá đang hot
          </h2>
          
          {availableVouchers.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-gray-500">
              Hiện tại không có mã giảm giá nào mới. Vui lòng quay lại sau!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableVouchers.map(v => (
                <div key={v._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500 rounded-bl-full -mr-4 -mt-4 opacity-10 group-hover:scale-110 transition-transform duration-500"></div>
                  
                  <div className="flex justify-between items-start mb-4 relative">
                    <div className="bg-orange-50 text-orange-600 font-black text-xl px-4 py-2 rounded-2xl tracking-widest border border-orange-100 shadow-sm">
                      {v.code}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Hạn dùng</p>
                      <p className="text-sm font-semibold">{new Date(v.expiryDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mb-6 relative">
                    <p className="font-bold text-gray-800 text-lg">
                      Giảm {v.discountType === 'percent' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()}đ`}
                    </p>
                    <p className="text-sm text-gray-500">
                      Đơn tối thiểu {v.minOrderValue?.toLocaleString()}đ
                      {v.discountType === 'percent' && v.maxDiscount > 0 && ` - Giảm tối đa ${v.maxDiscount.toLocaleString()}đ`}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => saveVoucher(v._id)}
                    className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-orange-600 transition-colors shadow-lg shadow-black/10 hover:shadow-orange-500/20"
                  >
                    Lưu mã ngay
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Saved Vouchers (If logged in) */}
        {userInfo && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Tag className="w-6 h-6 text-black" />
              Kho Voucher của bạn
            </h2>
            
            {myVouchers.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-gray-500">
                Bạn chưa lưu mã giảm giá nào. Hãy lưu các mã bên trên nhé!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myVouchers.map(v => (
                  <div key={v._id} className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-bl-full -mr-8 -mt-8 opacity-5 group-hover:scale-110 transition-transform duration-500"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative">
                      <div className="bg-white/10 backdrop-blur-sm text-white font-black text-xl px-4 py-2 rounded-2xl tracking-widest border border-white/10">
                        {v.code}
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-6 relative">
                      <p className="font-bold text-orange-400 text-lg">
                        Giảm {v.discountType === 'percent' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()}đ`}
                      </p>
                      <p className="text-sm text-gray-400">
                        Đơn tối thiểu {v.minOrderValue?.toLocaleString()}đ
                      </p>
                    </div>
                    
                    <Link
                      to="/products"
                      className="block text-center w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-orange-500 hover:text-white transition-colors"
                    >
                      Dùng ngay
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {!userInfo && (
          <div className="mt-12 text-center bg-orange-50 rounded-3xl p-8 border border-orange-100">
            <p className="text-gray-800 font-semibold mb-4">Bạn có mã giảm giá của riêng mình?</p>
            <Link to="/login" className="inline-block px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
              Đăng nhập để xem kho Voucher
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
