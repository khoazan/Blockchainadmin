import React, { useRef, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom"; // 🧩 thêm useLocation
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Product from "./pages/Product";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import MyDrugs from "./pages/MyDrugs";
import DrugDetail from "./pages/DrugDetail";
import RevenueStats from "./pages/RevenueStats";
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
  const location = useLocation(); // ✅ thêm dòng này
  const [account, setAccount] = useState(null);
  const onConnectRef = useRef(() => {});

  // ✅ Kiểm tra nếu đang ở /login thì không hiển thị header
  const hideHeaderRoutes = ["/login"];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {/* Header chỉ hiển thị nếu không ở /login */}
      {!shouldHideHeader && (
        <Header account={account} onConnect={onConnectRef.current} />
      )}

      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route path="/login" element={<LoginRegisterPage />} />

          <Route
            path="/"
            element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />}
          />

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

          <Route path="/revenue" element={<RevenueStats />} />
        </Routes>
      </main>
    </>
  );
}
