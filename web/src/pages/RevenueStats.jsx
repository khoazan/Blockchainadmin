import React, { useEffect, useState } from "react";

import axios from "axios";

export default function RevenueStats() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchRevenue = async () => {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      const res = await axios.get(
        `http://127.0.0.1:8000/api/revenue?month=${month}&year=${year}`
      );

      setTransactions(res.data.transactions);
      setTotal(res.data.total);
    };
    fetchRevenue();
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-6 rounded-2xl mt-8">
      <h2 className="text-2xl font-semibold mb-4">📊 Doanh thu tháng này</h2>
      <p className="text-lg mb-4">
        Tổng doanh thu: <b>{total.toFixed(3)} ETH</b>
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
          {transactions.map((tx, idx) => (
            <tr key={idx} className="border-b border-gray-700">
              <td>{tx.customer}</td>
              <td>{tx.medicine}</td>
              <td>{tx.date}</td>
              <td>{tx.price_eth}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
