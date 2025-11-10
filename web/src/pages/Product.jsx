import React, { useEffect, useState } from "react";
import MedicineCard from "../components/MedicineCard";
import { connectWallet, getContract } from "../utils/contract";
import { ethers } from "ethers";

export default function Product() {
  const [account, setAccount] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [localImagesById, setLocalImagesById] = useState({}); // id -> objectURL
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editTarget, setEditTarget] = useState(null); // {id,name,batch,price}
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);

  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      setAccount(window.ethereum.selectedAddress);
    }
    // Load saved local images mapping from localStorage
    try {
      const saved = localStorage.getItem("drug_images");
      if (saved) setLocalImagesById(JSON.parse(saved));
    } catch (_) {}
    fetchMedicines();
  }, []);

  // persist local images mapping
  useEffect(() => {
    try {
      localStorage.setItem("drug_images", JSON.stringify(localImagesById));
    } catch (_) {}
  }, [localImagesById]);
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

  async function tryUpdateBackend(id, payload) {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`http://127.0.0.1:8000/drugs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (_) {
      // bỏ qua nếu backend chưa hỗ trợ
    }
  }

  async function tryDeleteBackend(id) {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`http://127.0.0.1:8000/drugs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (_) {}
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
      return allMedicines;
    } catch (err) {
      console.error("❌ Lỗi khi lấy thuốc:", err);
      setMedicines([]);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMedicine(e) {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const batch = e.target.batch.value.trim();
    const priceStr = e.target.price.value.trim();
    const imageFile = e.target.image?.files?.[0] || null;
    const selectedPreviewUrl = imageFile
      ? URL.createObjectURL(imageFile)
      : null;
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
      setPreviewUrl(null);

      // Reload list rồi gán ảnh local cho thuốc mới nhất
      const list = await fetchMedicines();
      if (selectedPreviewUrl && list.length) {
        const newestId = Math.max(...list.map((m) => m.id));
        setLocalImagesById((prev) => ({
          ...prev,
          [newestId]: selectedPreviewUrl,
        }));
      }
    } catch (err) {
      console.error(err);
      alert("❌ " + err.message);
    }
  }

  function openEdit(m) {
    setEditTarget({ id: m.id, name: m.name, batch: m.batch, price: m.price });
    setEditPreviewUrl(localImagesById[m.id] || null);
  }

  async function saveEdit(e) {
    e.preventDefault();
    const form = e.target;
    const id = editTarget.id;
    const name = form.name.value.trim();
    const batch = form.batch.value.trim();
    const price = form.price.value.trim();
    const imageFile = form.image?.files?.[0] || null;

    try {
      // 👉 Gọi blockchain để update thuốc
      const provider = await connectWallet();
      const signer = provider.getSigner();
      const contract = getContract(signer);

      const priceWei = ethers.utils.parseEther(price);
      const tx = await contract.updateDrug(id, name, batch, priceWei);
      alert("⏳ Gửi giao dịch lên blockchain...");
      await tx.wait();
      alert("✅ Cập nhật thuốc trên blockchain thành công!");

      // 👉 Cập nhật backend (nếu có)
      await tryUpdateBackend(id, { name, batch, price: parseFloat(price) });

      // 👉 Cập nhật giao diện
      setMedicines((prev) =>
        prev.map((x) => (x.id === id ? { ...x, name, batch, price } : x))
      );
      setEditTarget(null);

      if (imageFile) {
        const url = URL.createObjectURL(imageFile);
        setLocalImagesById((prev) => ({ ...prev, [id]: url }));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi cập nhật thuốc: " + (err.message || err));
    }
  }

  async function handleDelete(m) {
    if (!confirm(`Xóa thuốc "${m.name}"?`)) return;
    setMedicines((prev) => prev.filter((x) => x.id !== m.id));
    await tryDeleteBackend(m.id);
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
          <div className="mb-4">
            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setPreviewUrl(f ? URL.createObjectURL(f) : null);
              }}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="preview"
                className="mt-3 h-24 w-24 object-cover rounded-lg border border-white/10"
              />
            )}
          </div>
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
              <MedicineCard
                key={m.id}
                m={{ ...m, image: localImagesById[m.id] || m.image }}
                onNextStage={onNextStage}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">Không có thuốc nào.</div>
        )}
        {/* Edit modal */}
        {editTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white text-slate-900 p-6">
              <h3 className="text-lg font-semibold mb-4">Sửa thuốc</h3>
              <form onSubmit={saveEdit} className="space-y-3">
                <input
                  name="name"
                  defaultValue={editTarget.name}
                  placeholder="Tên thuốc"
                  className="w-full px-3 py-2 rounded border"
                />
                <input
                  name="batch"
                  defaultValue={editTarget.batch}
                  placeholder="Batch"
                  className="w-full px-3 py-2 rounded border"
                />
                <input
                  name="price"
                  defaultValue={editTarget.price}
                  placeholder="Giá (ETH)"
                  className="w-full px-3 py-2 rounded border"
                />
                <div>
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setEditPreviewUrl(f ? URL.createObjectURL(f) : null);
                    }}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                  />
                  {editPreviewUrl && (
                    <img
                      src={editPreviewUrl}
                      alt="preview"
                      className="mt-3 h-24 w-24 object-cover rounded border"
                    />
                  )}
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditTarget(null)}
                    className="px-4 py-2 rounded bg-slate-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-indigo-600 text-white"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
