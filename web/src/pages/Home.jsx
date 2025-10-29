import React from "react";
import Header from "../components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-green-400 text-gray-900">
      {/* ✅ Header chung cho toàn bộ trang */}
      <Header />

      <main className="flex flex-col items-center justify-center h-[80vh] text-center">
        <h1 className="text-4xl font-bold mb-4">
          Trang chủ Pharma SupplyChain
        </h1>
        <p className="text-lg">
          Chào mừng bạn đến với hệ thống truy xuất nguồn gốc thuốc
        </p>
      </main>
    </div>
  );
}
