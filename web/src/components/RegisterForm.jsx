// src/components/RegisterForm.jsx

import React, { useState } from 'react';

const RegisterForm = ({ onRegisterSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const backendUrl = 'http://localhost:5000/api/register'; 

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Đăng ký thành công! Vui lòng chuyển sang tab Đăng nhập.');
                onRegisterSuccess(); 
            } else {
                setError(data.detail || 'Đăng ký thất bại.'); // FastAPI dùng 'detail' cho lỗi
            }
        } catch (err) {
            setError('Lỗi kết nối Server.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Đăng Ký Tài Khoản Mới</h3>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            {/* TRƯỜNG INPUT EMAIL */}
            <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            
            {/* TRƯỜNG INPUT MẬT KHẨU */}
            <div>
                <label className="block text-sm font-medium text-gray-600">Mật khẩu</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            
            <button
                type="submit"
                className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"
            >
                Đăng Ký
            </button>
        </form>
    );
};

export default RegisterForm;