import React, { useEffect, useState } from "react";

import axios from "axios";

export default function RevenueStats() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        const res = await axios.get(
          `http://127.0.0.1:8000/api/revenue?month=${month}&year=${year}`
        );
        console.log("Revenue API data:", res.data);

        setTransactions(res.data.transactions || []);
        setTotal(res.data.total || 0);
      } catch (error) {
        console.error("Error fetching revenue:", error);
        setTransactions([]);
        setTotal(0);
      }
    };
    fetchRevenue();
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-6 rounded-2xl mt-8">
      <h2 className="text-2xl font-semibold mb-4">📊 Doanh thu tháng này</h2>
      <p className="text-lg mb-4">
        Tổng doanh thu: <b>{parseFloat(total).toPrecision(6)} ETH</b>
      </p>

      <table className="w-full text-sm text-left border-t border-gray-600">
        <thead>
          <tr className="border-b border-gray-500">
            <th className="py-2">Khách hàng</th>
            <th className="py-2">Tên thuốc</th>
            <th className="py-2">Ngày</th>
            <th className="py-2">Số tiền (ETH)</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-400">
                Chưa có giao dịch nào trong tháng này
              </td>
            </tr>
          ) : (
            transactions.map((tx, idx) => (
              <tr key={idx} className="border-b border-gray-700">
                <td className="py-2 font-mono text-xs">
                  {String(tx.customer || "Unknown").slice(0, 10)}...
                </td>
                <td className="py-2">{tx.medicine || "N/A"}</td>
                <td className="py-2">{tx.date || "N/A"}</td>
                <td className="py-2 font-semibold">
                  {Number(tx.price_eth || 0).toFixed(6)} ETH
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
