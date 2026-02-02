"use client";

import { useState } from "react";

export default function AdminSubtitleUpload({
  movieId,
  onUploaded,
  seasonNumber,
  episodeNumber,
}) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  // Default values optimized for your workflow
  const [lang, setLang] = useState("mn");     // Mongolian first
  const [label, setLabel] = useState("Монгол");
  const [isDefault, setIsDefault] = useState(true); // make default subtitle by default
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!movieId) return null; // safety

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const token = typeof window !== "undefined"
        ? localStorage.getItem("adminToken")
        : null;

    if (!token) {
        setMessage("No admin token found. Please log in again.");
        return;
      }

    if (!file) {
      setMessage("Please choose a .vtt subtitle file.");
      return;
    }
    if (!API_BASE) {
      setMessage("API base URL not set.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("lang", lang);
      formData.append("label", label);
      formData.append("isDefault", isDefault ? "true" : "false");
      formData.append("subtitle", file); // must match upload.single("subtitle")

      // 🔹 NEW: tell backend which episode this subtitle belongs to (for series/anime)
      if (seasonNumber != null) {
        formData.append("seasonNumber", String(seasonNumber));
      }
      if (episodeNumber != null) {
        formData.append("episodeNumber", String(episodeNumber));
      }

      // 🔹 Decide endpoint: movie-level vs episode-level
      const isEpisodeUpload =
        seasonNumber != null && episodeNumber != null;

      const endpoint = isEpisodeUpload
        ? `${API_BASE}/api/movies/${movieId}/episode-subtitles`
        : `${API_BASE}/api/movies/${movieId}/subtitles`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ send admin token
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to upload subtitle");
      } else {
        setMessage("Subtitle uploaded ✅");
        if (onUploaded) {
          onUploaded(data.subtitles);
        }
        // reset file, but keep lang/label for next upload
        setFile(null);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error uploading subtitle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border border-gray-700 rounded-lg p-4 text-sm text-white">
      <h3 className="font-semibold mb-2">Upload Subtitles</h3>

      {/* ❌ no form here, just a div */}
      <div className="space-y-3">
        {/* your fields stay the same */}

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block mb-1 text-xs uppercase opacity-70">
              Language code
            </label>
            <select
              value={lang}
              onChange={(e) => {
                const val = e.target.value;
                setLang(val);

                if (val === "en") setLabel("English");
                else if (val === "mn") setLabel("Монгол");
                else setLabel("");
              }}
              className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-sm"
            >
              <option value="en">English (en)</option>
              <option value="mn">Mongolian (mn)</option>
              <option value="other">Other…</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block mb-1 text-xs uppercase opacity-70">
              Label shown in player
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="English / Монгол / Spanish..."
              className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="defaultSub"
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          <label htmlFor="defaultSub" className="text-xs">
            Make this the default subtitle
          </label>
        </div>

        <div>
          <label className="block mb-1 text-xs uppercase opacity-70">
            Subtitle file (.vtt)
          </label>
          <input
            type="file"
            accept=".vtt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-xs"
          />
        </div>

        {/* ✅ call handleSubmit manually */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-60 px-3 py-1.5 rounded text-sm"
        >
          {loading ? "Uploading..." : "Upload Subtitle"}
        </button>

        {message && (
          <p className="text-xs mt-1 opacity-80">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
