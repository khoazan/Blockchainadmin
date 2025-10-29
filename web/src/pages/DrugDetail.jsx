import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function DrugDetail() {
  const { id } = useParams();
  const [drug, setDrug] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/drugs/${id}`)
      .then((res) => res.json())
      .then((data) => setDrug(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!drug) return <div className="text-white p-6">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">{drug.name}</h1>
      <p>Batch: {drug.batch}</p>
      <p>Owner: {drug.owner}</p>
      <p>Price: {drug.price}</p>
      <p>Stage: {drug.stage}</p>
    </div>
  );
}
