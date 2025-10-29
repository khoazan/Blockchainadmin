import React, { useRef, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Product from "./pages/Product"; // ✅ dùng Product thay PharmaPage
import LoginRegisterPage from "./pages/LoginRegisterPage";
import MyDrugs from "./pages/MyDrugs";
import DrugDetail from "./pages/DrugDetail";
import { useAuth } from "./context/AuthContext";

function Home() {
  return (
    <div className="min-h-screen bg-green-300 flex flex-col items-center justify-center text-green-900">
      <h1 className="text-4xl font-bold mb-4">Trang chủ Pharma SupplyChain</h1>
      <p>Chào mừng bạn đến với hệ thống truy xuất nguồn gốc thuốc</p>
    </div>
  );
}

export default function App() {
  const { isLoggedIn } = useAuth();

  // 👇 Quản lý ví MetaMask
  const [account, setAccount] = useState(null);
  const onConnectRef = useRef(() => {});

  return (
    <>
      {/* Header hiển thị login / connect wallet */}
      <Header account={account} onConnect={onConnectRef.current} />

      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          {/* Trang đăng nhập / đăng ký */}
          <Route path="/login" element={<LoginRegisterPage />} />

          {/* Trang chủ */}
          <Route
            path="/"
            element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />}
          />

          {/* ✅ Trang quản lý thuốc chính (bảo vệ bằng login) */}
          <Route
            path="/product"
            element={
              <ProtectedRoute>
                <Product
                  renderProps={{
                    setAccount: setAccount,
                    onConnect: onConnectRef,
                  }}
                />
              </ProtectedRoute>
            }
          />

          {/* Các trang khác */}
          <Route
            path="/my-drugs"
            element={
              isLoggedIn ? <MyDrugs /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/drug/:id"
            element={
              isLoggedIn ? <DrugDetail /> : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </main>
    </>
  );
}
