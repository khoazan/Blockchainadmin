
// src/components/SetPasswordForm.jsx (Đã sửa lỗi Export/Syntax)

import React, { useState } from 'react';

const SetPasswordForm = ({ onSubmit }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (password.length < 6) {
            alert("Mật khẩu phải tối thiểu 6 ký tự.");
            return;
        }
        if (password !== confirmPassword) {
            alert("Mật khẩu xác nhận không khớp.");
            return;
        }
        onSubmit(password);
    };

    return (
        // ✅ Bọc trong React.Fragment để đảm bảo cú pháp JSX
        <React.Fragment> 
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">Tạo Mật Khẩu</h3>
                
                <div>
                    <label className="block text-sm font-medium text-gray-600">Mật Khẩu Mới</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Mật khẩu tối thiểu 6 ký tự"
                        className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-600">Xác Nhận Mật Khẩu</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
                
                <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-semibold rounded-lg shadow hover:from-emerald-700 hover:to-sky-700 transition duration-150"
                >
                    Hoàn Tất Đăng Ký
                </button>
            </form>
        </React.Fragment>
    );
};

export default SetPasswordForm;
