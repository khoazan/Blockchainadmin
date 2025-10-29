import React from "react";
import { Link } from "react-router-dom";

export default function MedicineCard({ m, onNextStage, showNextStage = true }) {
  const stages = ["Manufactured", "Distributed", "InPharmacy", "Sold"];

  const stageColors = [
    "bg-blue-100 text-blue-700",
    "bg-yellow-100 text-yellow-700",
    "bg-purple-100 text-purple-700",
    "bg-green-100 text-green-700",
  ];

  const stageEmoji = ["🏭", "🚚", "🏬", "👤"];

  return (
    <div className="rounded-2xl bg-white shadow-lg p-5 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 ease-out flex flex-col justify-between min-h-[300px]">
      {/* 🖼️ Ảnh thuốc (fallback nếu không có) */}
      <img
        src={
          m.image
            ? `http://127.0.0.1:8000${m.image}`
            : `https://source.unsplash.com/400x250/?medicine,${m.name}`
        }
        alt={m.name}
        className="w-full h-40 object-cover rounded-xl mb-3"
      />

      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-1 truncate">
            {m.name}
          </h2>
          <p className="text-sm text-gray-500">Batch: {m.batch}</p>
          <p className="text-sm text-gray-500 break-words max-w-[30rem]">
            Owner: {m.owner}
          </p>
        </div>

        <div className="flex-shrink-0 text-right">
          <div
            className={`inline-block px-3 py-1 text-sm rounded-full font-semibold ${
              stageColors[m.stage]
            }`}
          >
            <span className="mr-2">{stageEmoji[m.stage]}</span>
            {stages[m.stage] ?? "Unknown"}
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 my-4"></div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">ID: {m.id}</span>

        <div className="flex items-center gap-2">
          {/* 🔗 Nút xem chi tiết */}
          <Link
            to={`/drug/${m.id}`}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded-lg transition"
          >
            View Details
          </Link>

          {/* ✅ Nút Next Stage (ẩn nếu showNextStage = false) */}
          {showNextStage && (
            <button
              onClick={() => {
                const currentStage =
                  typeof m.stage === "number"
                    ? m.stage
                    : stages.indexOf(m.stage);
                const nextStage = Math.min(currentStage + 1, stages.length - 1);
                onNextStage(m.id, nextStage);
              }}
              disabled={m.stage === stages.length - 1}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                m.stage === stages.length - 1
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {m.stage === stages.length - 1 ? "Completed" : "Next Stage"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
