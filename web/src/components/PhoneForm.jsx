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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            
            <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-150"
            >
                Tiếp Tục
            </button>
        </form>
    );
};

export default PhoneForm;