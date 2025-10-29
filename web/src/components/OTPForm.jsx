// src/components/OTPForm.jsx (Đã sửa lỗi cú pháp JSX dòng 43)

import React, { useState } from "react";

const OTPForm = ({ onSubmit, phone, otpDisplay, onResend }) => {
  const [otp, setOtp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      alert("Vui lòng nhập đủ 6 chữ số.");
      return;
    }

    onSubmit(otp);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. MÃ RANDOM CHO DEVELOPER */}
      <div className="p-3 bg-red-100 text-red-700 font-bold text-center rounded-md text-sm">
        MÃ XÁC THỰC : {otpDisplay}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2 sr-only">
          Nhập Mã Xác Thực
        </label>

        {/* 3. Ô NHẬP (ĐÃ VIẾT LẠI CÁC THUỘC TÍNH ĐỂ KHẮC PHỤC LỖI CÚ PHÁP) */}
        <input
          type="text"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
          }
          placeholder="Nhập mã xác thực của bạn"
          maxLength="6"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-4 text-center text-2xl tracking-widest focus:ring-blue-500"
        />
      </div>

      {/* 4. NÚT XÁC NHẬN */}
      <button
        type="submit"
        className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-150"
      >
        Xác Nhận
      </button>

      {/* 5. DÒNG YÊU CẦU MÃ MỚI */}
      <button
        type="button"
        onClick={onResend}
        className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition duration-150"
      >
        Yêu cầu Mã mới
      </button>
    </form>
  );
};

export default OTPForm;
