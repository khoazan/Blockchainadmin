import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ethers } from "ethers";

export default function Header() {
  const location = useLocation();
  const [account, setAccount] = useState(null);

  // Hàm kết nối ví MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Lỗi khi kết nối ví:", error);
      }
    } else {
      alert("Vui lòng cài đặt MetaMask!");
    }
  };

  // Theo dõi sự thay đổi tài khoản trong MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });
    }
  }, []);

  return (
    <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg">
      <h1 className="font-bold text-xl">Pharma SupplyChain DApp</h1>

      <nav className="space-x-4">
        <Link
          to="/"
          className={`hover:underline ${
            location.pathname === "/" ? "text-green-400 font-semibold" : ""
          }`}
        >
          Trang chủ
        </Link>
        <Link
          to="/product"
          className={`hover:underline ${
            location.pathname === "/product"
              ? "text-green-400 font-semibold"
              : ""
          }`}
        >
          Sản phẩm
        </Link>
        <Link to="/my-drugs" className="text-white hover:text-green-300">
          💊 Thuốc của tôi
        </Link>
      </nav>

      <button
        onClick={connectWallet}
        className="bg-indigo-500 px-4 py-2 rounded-lg hover:bg-indigo-600"
      >
        {account
          ? `${account.slice(0, 6)}...${account.slice(-4)}`
          : "Kết nối ví"}
      </button>
    </header>
  );
}
