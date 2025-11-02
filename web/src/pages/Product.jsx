import React, { useEffect, useState } from "react";
import MedicineCard from "../components/MedicineCard";
import { connectWallet, getContract } from "../utils/contract";
import { ethers } from "ethers";

export default function Product() {
  const [account, setAccount] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      setAccount(window.ethereum.selectedAddress);
    }
    fetchMedicines();
  }, []);
  async function onNextStage(id, newStage) {
    try {
      const provider = await connectWallet();
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const to = await signer.getAddress();

      // ⚙️ Gửi giao dịch lên blockchain qua MetaMask
      const tx = await contract.transferDrug(id, newStage, to);
      alert("⏳ Gửi giao dịch lên blockchain...");
      await tx.wait();

      alert("✅ Chuyển stage thành công!");
      await fetchMedicines(); // reload danh sách
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi chuyển stage: " + (err.message || err));
    }
  }

  async function fetchMedicines() {
    setLoading(true);
    try {
      const provider = await connectWallet();
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const [ids, names, batches, prices, stages, owners] =
        await contract.getAllDrugs();

      const allMedicines = ids.map((id, i) => ({
        id: id.toNumber(),
        name: names[i],
        batch: batches[i],
        price: ethers.utils.formatEther(prices[i]),
        stage: stages[i],
        owner: owners[i],
      }));

      setMedicines(allMedicines);
    } catch (err) {
      console.error("❌ Lỗi khi lấy thuốc:", err);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMedicine(e) {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const batch = e.target.batch.value.trim();
    const priceStr = e.target.price.value.trim();
    if (!name || !batch || !priceStr) return alert("Nhập đủ thông tin");

    try {
      const provider = await connectWallet();
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const priceWei = ethers.utils.parseEther(priceStr);

      const tx = await contract.addDrug(name, batch, priceWei);
      alert("Đang gửi giao dịch...");
      await tx.wait();
      const token = localStorage.getItem("access_token"); // token nhận được khi đăng nhập

      await fetch("http://127.0.0.1:8000/drugs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔥 Thêm dòng này
        },
        body: JSON.stringify({ name, batch, price: parseFloat(priceStr) }),
      });

      alert("✅ Thêm thuốc thành công!");
      e.target.reset();
      await fetchMedicines();
    } catch (err) {
      console.error(err);
      alert("❌ " + err.message);
    }
  }

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
      <main className="max-w-6xl mx-auto py-10 px-6">
        <form
          onSubmit={handleAddMedicine}
          className="bg-slate-800 p-6 rounded-2xl mb-6"
        >
          <h2 className="text-xl font-bold mb-4">➕ Thêm thuốc mới</h2>
          <input
            name="name"
            placeholder="Tên thuốc"
            className="w-full mb-3 px-3 py-2 rounded text-black"
          />
          <input
            name="batch"
            placeholder="Batch"
            className="w-full mb-3 px-3 py-2 rounded text-black"
          />
          <input
            name="price"
            placeholder="Giá (ETH)"
            className="w-full mb-3 px-3 py-2 rounded text-black"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg"
          >
            Thêm
          </button>
        </form>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Tìm thuốc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg text-black w-full"
          />
        </div>

        {loading ? (
          <div className="text-center text-gray-400">Đang tải...</div>
        ) : filteredMedicines.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map((m) => (
              <MedicineCard key={m.id} m={m} onNextStage={onNextStage} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">Không có thuốc nào.</div>
        )}
      </main>
    </div>
  );
}
