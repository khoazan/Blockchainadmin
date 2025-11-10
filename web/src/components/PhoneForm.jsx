// src/components/PhoneForm.jsx

import React, { useState } from 'react';

const PhoneForm = ({ onSubmit }) => {
    const [inputPhone, setInputPhone] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // Kiểm tra cơ bản SĐT
        if (inputPhone.length < 10 || inputPhone.length > 11) {
            alert("Số điện thoại không hợp lệ.");
            return;
        }
        onSubmit(inputPhone);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-600">Số Điện Thoại</label>
                <input
                    type="tel"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value.replace(/[^0-9]/g, ''))} // Chỉ cho phép nhập số
                    placeholder="Nhập số điện thoại"
                    required
                    className="mt-1 block w-full border border-gray-200 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400"
                />
            </div>
            
            <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-semibold rounded-lg shadow hover:from-emerald-700 hover:to-sky-700 transition duration-150"
            >
                Tiếp Tục
            </button>
        </form>
    );
};

export default PhoneForm;