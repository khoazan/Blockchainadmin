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
      <div className="p-3 bg-emerald-50 text-emerald-700 font-semibold text-center rounded-md text-sm border border-emerald-100">
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
          className="mt-1 block w-full border border-gray-200 rounded-lg p-4 text-center text-2xl tracking-widest shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400"
        />
      </div>

      {/* 4. NÚT XÁC NHẬN */}
      <button
        type="submit"
        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-semibold rounded-lg shadow hover:from-emerald-700 hover:to-sky-700 transition duration-150"
      >
        Xác Nhận
      </button>

      {/* 5. DÒNG YÊU CẦU MÃ MỚI */}
      <button
        type="button"
        onClick={onResend}
        className="w-full py-2 text-sm text-gray-500 hover:text-emerald-600 transition duration-150"
      >
        Yêu cầu Mã mới
      </button>
    </form>
  );
};

export default OTPForm;
