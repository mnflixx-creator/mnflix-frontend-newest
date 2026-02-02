"use client";

import { useState } from "react";

export default function AdminEpisodeSubtitleUpload({
  movieId,
  season,
  episode,
  onUploaded,
}) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const [lang, setLang] = useState("mn");
  const [label, setLabel] = useState("Монгол");
  const [isDefault, setIsDefault] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleUpload = async () => {
    if (!file) return setMsg("Attach a .vtt file");

    const token = localStorage.getItem("adminToken");
    if (!token) return setMsg("Not logged in");

    const formData = new FormData();
    formData.append("subtitle", file);
    formData.append("lang", lang);
    formData.append("label", label);
    formData.append("isDefault", isDefault ? "true" : "false");

    setLoading(true);
    setMsg("");

    const res = await fetch(
      `${API_BASE}/api/movies/${movieId}/episodes/${season}/${episode}/subtitles`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    const data = await res.json();

    if (res.ok) {
      setMsg("Uploaded ✅");
      setFile(null);
      onUploaded && onUploaded(data.subtitles);
    } else {
      setMsg(data.message || "Failed");
    }

    setLoading(false);
  };

  return (
    <div className="border border-white/10 p-3 rounded text-sm mt-2">
      <div className="font-semibold">Subtitle (S{season}E{episode})</div>

      <div className="flex gap-2 mt-2">
        <select
          value={lang}
          onChange={(e) => {
            const v = e.target.value;
            setLang(v);
            if (v === "mn") setLabel("Монгол");
            if (v === "en") setLabel("English");
          }}
          className="bg-black/40 border border-white/10 rounded p-1"
        >
          <option value="mn">Mongolian</option>
          <option value="en">English</option>
        </select>

        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="flex-1 bg-black/40 border border-white/10 rounded p-1"
        />

        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
        <span>Default</span>
      </div>

      <input
        type="file"
        accept=".vtt"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mt-2 text-xs"
      />

      <button
        type="button"
        disabled={loading}
        onClick={handleUpload}
        className="mt-2 bg-red-600 px-3 py-1 rounded disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {msg && <p className="text-xs mt-1 opacity-70">{msg}</p>}
    </div>
  );
}
