import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract, connectWallet } from "../utils/contract";
import MedicineCard from "../components/MedicineCard";

export default function MyDrugs() {
  const [drugs, setDrugs] = useState([]);

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        // Kết nối ví
        const provider = await connectWallet();
        const signer = provider.getSigner();

        // Lấy contract
        const contract = getContract(signer);

        // Lấy địa chỉ ví hiện tại
        const myAddress = await signer.getAddress();
        console.log("Đang dùng ví:", myAddress);

        // Gọi hàm từ smart contract
        const data = await contract.getDrugsByOwner(myAddress);

        // Tách 4 mảng
        const ids = data[0];
        const names = data[1];
        const batches = data[2];
        const prices = data[3];
        const stages = data[4];

        const formatted = ids.map((id, i) => ({
          id: Number(id),
          name: names[i],
          batch: batches[i],
          price: ethers.utils.formatEther(prices[i]), // nếu lưu bằng parseEther
          stage: Number(stages[i]),
          owner: myAddress,
        }));

        setDrugs(formatted);
      } catch (error) {
        console.error("Error fetching drugs:", error);
      }
    };

    fetchDrugs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="p-6">
        <h2 className="text-2xl font-bold mb-4">My Drugs</h2>
        {drugs.length === 0 ? (
          <p>No drugs found.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {drugs.map((drug, index) => (
              <MedicineCard key={index} m={drug} showNextStage={false} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
