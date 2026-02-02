"use client";

import { useState } from "react";

export default function AdminAnimeMalPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [malId, setMalId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔁 If your backend endpoint is different, just change this ONE line:
  const buildEndpoint = (id) =>
    `${API}/api/anime/mal-import/${id}`; // <- adjust if needed

  const handleImport = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!API) {
      setStatus("API URL тохируулагдаагүй байна (NEXT_PUBLIC_API_URL).");
      return;
    }

    const trimmed = malId.trim();
    if (!trimmed) {
      setStatus("MAL ID оруулна уу.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(buildEndpoint(trimmed), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus(
          data.message ||
            `Импорт амжилтгүй боллоо (status ${res.status}).`
        );
        return;
      }

      setStatus(
        data.message ||
          "Амжилттай импорт боллоо. Анимэ жагсаалтанд нэмэгдсэн байж магадгүй."
      );
      setMalId("");
    } catch (err) {
      console.error("MAL import error:", err);
      setStatus("Сервертэй холбогдох үед алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-10 py-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-4">
        Anime MAL Import (Admin)
      </h1>

      <p className="text-sm text-white/70 mb-6 max-w-xl">
        MyAnimeList{" "}
        <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">
          MAL ID
        </span>{" "}
        оруулаад импорт хийнэ. Жишээ нь:{" "}
        <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">
          5114
        </span>{" "}
        (Fullmetal Alchemist: Brotherhood)
      </p>

      <form
        onSubmit={handleImport}
        className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 space-y-4"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">
            MAL ID
          </label>
          <input
            type="text"
            value={malId}
            onChange={(e) => setMalId(e.target.value)}
            placeholder="5114, 9253, ..."
            className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/60 font-bold text-sm"
        >
          {loading ? "Импортолж байна..." : "MAL-ээс импорт хийх"}
        </button>

        {status && (
          <div className="mt-3 text-xs sm:text-sm text-white/80">
            {status}
          </div>
        )}
      </form>
    </div>
  );
}
