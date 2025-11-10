// src/pages/LoginRegisterPage.jsx (ĐÃ SỬA VÀ HOÀN CHỈNH)
import { Buffer } from "buffer";
window.Buffer = Buffer;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import PhoneForm from "../components/PhoneForm";
import OTPForm from "../components/OTPForm";
import SetPasswordForm from "../components/SetPasswordForm";
import LoginForm from "../components/LoginForm";

// 🚀 IMPORT ICON TỪ REACT ICONS
import { IoArrowBackCircleOutline } from "react-icons/io5";

const AuthFlowPage = () => {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [otpDisplay, setOtpDisplay] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const BASE_URL = "http://127.0.0.1:8000/api/auth";

  // --- Hàm xử lý Quên Mật khẩu (Chuyển về Step 0) ---
  const handleForgotPassword = () => {
    setMessage(
      "Vui lòng nhập lại số điện thoại để bắt đầu khôi phục mật khẩu."
    );
    setStep(0);
  };

  // --- Xử lý Logic API (handlePhoneSubmit) ---
  const handlePhoneSubmit = async (inputPhone) => {
    setMessage("");
    setPhone(inputPhone);

    try {
      const response = await fetch(`${BASE_URL}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: inputPhone }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.action === "VERIFY_OTP") {
          setOtpDisplay(data.otp_displayed);
          setStep(1);
        } else if (data.action === "LOGIN") {
          // ✅ DÒNG ĐÃ SỬA: KHÔNG GỌI setMessage(data.message)
          setStep(3); // Chuyển thẳng sang form Đăng nhập
        }
      } else {
        setMessage(data.detail || "Lỗi xử lý SĐT. Vui lòng kiểm tra lại.");
      }
    } catch (err) {
      setMessage("Lỗi kết nối Server. Vui lòng đảm bảo Backend đang chạy.");
    }
  };

  // --- Xử lý Bước 2: Nhập OTP (GIỮ NGUYÊN) ---
  const handleOTPSubmit = async (otpCode) => {
    setMessage("");
    try {
      const response = await fetch(`${BASE_URL}/verify_otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp_code: otpCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setTempToken(data.temp_token);
        setStep(2);
      } else {
        setMessage(data.detail || "Mã OTP không đúng.");
        if (data.detail && data.detail.includes("quá 3 lần")) {
          setStep(0);
        }
      }
    } catch (err) {
      setMessage("Lỗi kết nối Server.");
    }
  };

  // --- Xử lý Bước 3: Tạo Mật khẩu (GIỮ NGUYÊN) ---
  const handlePasswordSubmit = async (password) => {
    setMessage("");
    try {
      const response = await fetch(`${BASE_URL}/set_password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          password,
          temp_token: tempToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Đăng ký thành công! Vui lòng Đăng nhập.");
        setStep(3);
      } else {
        setMessage(data.detail || "Lỗi tạo mật khẩu.");
      }
    } catch (err) {
      setMessage("Lỗi kết nối Server.");
    }
  };

  // --- Xử lý Bước 4: Đăng nhập (SĐT và Mật khẩu) (GIỮ NGUYÊN) ---
  const handleLoginSubmit = async (password) => {
    setMessage("");
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/login",

        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        login(data.access_token);
        navigate("/");
      } else {
        setMessage(
          data.detail || "Đăng nhập thất bại. Kiểm tra SĐT và mật khẩu."
        );
      }
    } catch (err) {
      setMessage("Lỗi kết nối Server.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <PhoneForm onSubmit={handlePhoneSubmit} />;
      case 1:
        return (
          <OTPForm
            onSubmit={handleOTPSubmit}
            phone={phone}
            otpDisplay={otpDisplay}
            onResend={() => {
              setMessage("Yêu cầu mã mới. Vui lòng nhập lại số điện thoại.");
              setStep(0);
            }}
          />
        );
      case 2:
        return <SetPasswordForm onSubmit={handlePasswordSubmit} />;
      case 3:
        return (
          <LoginForm
            onSubmit={handleLoginSubmit}
            phone={phone}
            onBack={() => setStep(0)}
            onForgotPassword={handleForgotPassword}
          />
        );
      default:
        return <PhoneForm onSubmit={handlePhoneSubmit} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 flex items-start sm:items-center justify-center py-10">
      <div className="max-w-md w-full mx-auto p-8 bg-white/95 backdrop-blur rounded-2xl border border-emerald-50 shadow-xl shadow-emerald-100/60 relative">
        {/* 1. NÚT QUAY LẠI (ICON) */}
        {step > 0 && step !== 3 && (
          <button
            onClick={() => setStep(0)}
            className="absolute top-8 left-8 text-gray-500 hover:text-gray-700 transition duration-150 p-1"
          >
            <IoArrowBackCircleOutline className="h-8 w-8" />
          </button>
        )}

        {/* 2. TIÊU ĐỀ */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold tracking-tight text-gray-800">
            {step === 3 ? "Đăng Nhập Tài Khoản" : "Xác Thực Tài Khoản"}
          </h2>
          <p className="mt-1 text-xs text-gray-500">Nhanh chóng và an toàn</p>
        </div>

        {/* 3. MESSAGE BOX */}
        {message && (
          <div className="p-3 mb-4 text-sm rounded-lg bg-amber-50 text-amber-800 border border-amber-100">
            {message}
          </div>
        )}

        {/* 4. RENDER FORM */}
        {renderStep()}
      </div>
    </div>
  );
};

export default AuthFlowPage;
