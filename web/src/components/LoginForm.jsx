// src/components/LoginForm.jsx (ĐÃ SỬA HOÀN CHỈNH)

import React, { useState } from 'react';

// ✅ Nhận props onBack và onForgotPassword mới
const LoginForm = ({ onSubmit, phone: initialPhone, onBack, onForgotPassword }) => {
    const [phone, setPhone] = useState(initialPhone || '');
    const [password, setPassword] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(password); 
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* TRƯỜNG INPUT SỐ ĐIỆN THOẠI (GIỮ NGUYÊN) */}
            <div>
                <label className="block text-sm font-medium text-gray-600">Số Điện Thoại</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Số điện thoại"
                    required
                    readOnly={!!initialPhone} 
                    className="mt-1 block w-full border border-gray-200 rounded-lg p-3 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
            </div>

            {/* TRƯỜNG INPUT MẬT KHẨU (GIỮ NGUYÊN) */}
            <div>
                <label className="block text-sm font-medium text-gray-600">Mật khẩu</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Nhập mật khẩu của bạn"
                    className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
            </div>
            
            <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-semibold rounded-lg shadow hover:from-emerald-700 hover:to-sky-700 transition duration-150"
            >
                Đăng Nhập
            </button>

            {/* PHẦN ĐIỀU HƯỚNG BỔ SUNG */}
            <div className="flex justify-between pt-2 text-sm">
                
                {/* NÚT QUÊN MẬT KHẨU */}
                <button 
                    type="button" 
                    onClick={onForgotPassword} 
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                    Quên mật khẩu?
                </button>

                {/* NÚT QUAY LẠI */}
                <button 
                    type="button" 
                    onClick={onBack} 
                    className="text-gray-500 hover:text-gray-700"
                >
                    &larr; Quay lại 
                </button>
            </div>
        </form>
    );
};

export default LoginForm;