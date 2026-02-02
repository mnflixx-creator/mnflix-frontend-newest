"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddMoviePage() {
  const router = useRouter();

  const GENRES = [
    "Action", "Comedy", "Drama", "Horror", "Sci-Fi",
    "Romance", "Kids", "Documentary", "Fantasy",
    "Thriller", "Animation", "Crime", "Adventure",
  ];

  const [imdbId, setImdbId] = useState(""); // ✅ NEW
  const [autoMsg, setAutoMsg] = useState(""); // ✅ NEW

  const [movie, setMovie] = useState({
    title: "",
    description: "",
    year: "",
    rating: 0,
    genres: [],
    player1: "",
    player2: "",
    player3: "",
    kidsOnly: false,
    isTrending: false,
    type: "",
  });

  // ✅ Series/Anime seasons structure:
  // [{ seasonNumber: 1, episodes: [{ episodeNumber: 1, player: "https://..." }] }]
  const [seasons, setSeasons] = useState([
    { seasonNumber: 1, episodes: [{ episodeNumber: 1, player: "" }] },
  ]);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const addSeason = () => {
    setSeasons((prev) => [
      ...prev,
      { seasonNumber: prev.length + 1, episodes: [{ episodeNumber: 1, player: "" }] },
    ]);
  };

  const removeSeason = (seasonIndex) => {
    setSeasons((prev) => prev.filter((_, i) => i !== seasonIndex));
  };

  const addEpisode = (seasonIndex) => {
    setSeasons((prev) => {
      const copy = [...prev];
      const season = copy[seasonIndex];
      const nextEpNum = (season.episodes?.length || 0) + 1;
      season.episodes = [...(season.episodes || []), { episodeNumber: nextEpNum, player: "" }];
      copy[seasonIndex] = { ...season };
      return copy;
    });
  };

  const removeEpisode = (seasonIndex, episodeIndex) => {
    setSeasons((prev) => {
      const copy = [...prev];
      const season = copy[seasonIndex];
      season.episodes = season.episodes.filter((_, i) => i !== episodeIndex);
      copy[seasonIndex] = { ...season };
      return copy;
    });
  };

  const updateSeasonNumber = (seasonIndex, value) => {
    setSeasons((prev) => {
      const copy = [...prev];
      copy[seasonIndex] = { ...copy[seasonIndex], seasonNumber: Number(value) || 1 };
      return copy;
    });
  };

  const updateEpisode = (seasonIndex, episodeIndex, field, value) => {
    setSeasons((prev) => {
      const copy = [...prev];
      const season = copy[seasonIndex];
      const episodes = [...(season.episodes || [])];
      const ep = { ...(episodes[episodeIndex] || { episodeNumber: episodeIndex + 1, player: "" }) };

      if (field === "episodeNumber") ep.episodeNumber = Number(value) || episodeIndex + 1;
      if (field === "player") ep.player = value;

      episodes[episodeIndex] = ep;
      copy[seasonIndex] = { ...season, episodes };
      return copy;
    });
  };

  // ✅ Genres toggle
  const toggleGenre = (g) => {
    setMovie((prev) => {
      const has = prev.genres.includes(g);
      return { ...prev, genres: has ? prev.genres.filter((x) => x !== g) : [...prev.genres, g] };
    });
  };

  // ✅ IMDB autofill (OMDb)
  const autofillFromImdb = async () => {
    setAutoMsg("");

    const key = process.env.NEXT_PUBLIC_OMDB_API_KEY;
    const tt = (imdbId || "").trim();

    if (!tt) return setAutoMsg("Enter IMDB code like tt3581920");
    if (!tt.startsWith("tt")) return setAutoMsg("IMDB code must start with tt...");
    if (!key) {
      return setAutoMsg("Missing NEXT_PUBLIC_OMDB_API_KEY in .env / Vercel env.");
    }

    try {
      const res = await fetch(`https://www.omdbapi.com/?i=${encodeURIComponent(tt)}&apikey=${encodeURIComponent(key)}&plot=full`);
      const data = await res.json();

      if (data.Response === "False") {
        return setAutoMsg(data.Error || "OMDb not found");
      }

      const year = (data.Year || "").split("–")[0]; // handles series like "2015–2019"
      const imdbRating = Number(data.imdbRating) || 0;
      const genres = (data.Genre || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // best-effort map to your GENRES list + keep others too
      const cleanedGenres = Array.from(new Set(genres.map((g) => g)));

      setMovie((prev) => ({
        ...prev,
        title: data.Title || prev.title,
        description: data.Plot && data.Plot !== "N/A" ? data.Plot : prev.description,
        year: year || prev.year,
        rating: imdbRating || prev.rating,
        genres: cleanedGenres.length ? cleanedGenres : prev.genres,
      }));

      // posters
      if (data.Poster && data.Poster !== "N/A") {
        setThumbnailUrl(data.Poster);
      }

      // ✅ Auto-generate player URL patterns (your vidsrc style)
      // If it's a movie => use /movie
      // If it's series => you will fill seasons/episodes, but we can pre-fill first episode link
      const isSeries = (data.Type || "").toLowerCase() === "series";
      setMovie((prev) => ({
        ...prev,
        type: isSeries ? (prev.type || "series") : (prev.type || "movie"),
        player1: !isSeries ? `https://vidsrcme.ru/embed/movie?imdb=${tt}` : prev.player1,
      }));

      if (isSeries) {
        setSeasons([
          {
            seasonNumber: 1,
            episodes: [
              { episodeNumber: 1, player: `https://vidsrcme.ru/embed/tv?imdb=${tt}&season=1&episode=1` },
            ],
          },
        ]);
      }

      setAutoMsg("✅ Autofilled from IMDB");
    } catch (e) {
      setAutoMsg("Autofill failed. Check your key or network.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("adminToken");
    const formData = new FormData();

    formData.append("title", movie.title);
    formData.append("description", movie.description);
    formData.append("year", String(movie.year || ""));
    formData.append("rating", String(movie.rating ?? 0));
    formData.append("genres", JSON.stringify(movie.genres));
    formData.append("kidsOnly", String(!!movie.kidsOnly));
    formData.append("isTrending", String(!!movie.isTrending));
    formData.append("type", movie.type);

    // ✅ Movie players only for movie
    if (movie.type === "movie") {
      formData.append("player1", movie.player1);
      formData.append("player2", movie.player2);
      formData.append("player3", movie.player3);
    } else {
      // ✅ Series/Anime seasons
      formData.append("seasons", JSON.stringify(seasons));
    }

    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
    if (bannerFile) formData.append("banner", bannerFile);
    if (thumbnailUrl) formData.append("thumbnailUrl", thumbnailUrl);
    if (bannerUrl) formData.append("bannerUrl", bannerUrl);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/add`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      alert("Movie added!");
      router.push("/admin/movies");
    } else {
      alert(data.message || "Error adding movie.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Add New Movie</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ✅ IMDB AUTO FILL */}
        <div className="border border-white/10 bg-black/30 rounded-xl p-4 space-y-3">
          <div className="font-bold">Auto-fill from IMDB (optional)</div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
            <input
              value={imdbId}
              onChange={(e) => setImdbId(e.target.value)}
              placeholder="tt3581920"
              className="w-full p-3 bg-black/40 border border-white/10 rounded"
            />
            <button
              type="button"
              onClick={autofillFromImdb}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded font-semibold"
            >
              Autofill
            </button>
          </div>
          {autoMsg && <div className="text-sm text-white/70">{autoMsg}</div>}
          <div className="text-xs text-white/60">
            Needs <span className="font-semibold">NEXT_PUBLIC_OMDB_API_KEY</span> in .env + Vercel env.
          </div>
        </div>

        {/* TITLE */}
        <div>
          <label className="block mb-1">Title</label>
          <input
            value={movie.title}
            onChange={(e) => setMovie({ ...movie, title: e.target.value })}
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            value={movie.description}
            onChange={(e) => setMovie({ ...movie, description: e.target.value })}
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
          />
        </div>

        {/* YEAR */}
        <div>
          <label className="block mb-1">Year</label>
          <input
            type="number"
            value={movie.year}
            onChange={(e) => setMovie({ ...movie, year: e.target.value })}
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
          />
        </div>

        {/* RATING */}
        <div>
          <label className="block mb-1">Rating (0 - 10)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
            value={movie.rating}
            onChange={(e) => setMovie({ ...movie, rating: Number(e.target.value) })}
          />
        </div>

        {/* ✅ GENRES (BACK) */}
        <div>
          <label className="block mb-2">Genres</label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => {
              const active = movie.genres.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-2 rounded-full text-sm border border-white/10 transition ${
                    active ? "bg-[#2EA8FF] text-white" : "bg-white/5 hover:bg-white/10 text-white/80"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
          <div className="text-xs text-white/60 mt-2">
            Selected: {movie.genres.length ? movie.genres.join(", ") : "None"}
          </div>
        </div>

        {/* TYPE */}
        <div>
          <label className="block mb-1">Type</label>
          <select
            value={movie.type}
            onChange={(e) => setMovie({ ...movie, type: e.target.value })}
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
            required
          >
            <option value="">Select type</option>
            <option value="movie">Movie</option>
            <option value="series">Series / K-Drama</option>
            <option value="anime">Anime (Series)</option>
            <option value="cdrama">Chinese Drama (C-Drama)</option>
          </select>
        </div>

        {/* PLAYER LINKS (ONLY FOR MOVIE) */}
        {movie.type === "movie" && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Player 1 URL</label>
              <input
                value={movie.player1}
                onChange={(e) => setMovie({ ...movie, player1: e.target.value })}
                placeholder="https://vidsrcme.ru/embed/movie?imdb=tt5433140"
                className="w-full p-3 bg-black/40 border border-white/10 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Player 2 URL</label>
              <input
                value={movie.player2}
                onChange={(e) => setMovie({ ...movie, player2: e.target.value })}
                placeholder="https://..."
                className="w-full p-3 bg-black/40 border border-white/10 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Player 3 URL</label>
              <input
                value={movie.player3}
                onChange={(e) => setMovie({ ...movie, player3: e.target.value })}
                placeholder="https://..."
                className="w-full p-3 bg-black/40 border border-white/10 rounded"
              />
            </div>
          </div>
        )}

        {/* SEASONS + EPISODES (ONLY FOR SERIES/ANIME) */}
        {movie.type && movie.type !== "movie" && (
          <div className="space-y-4 border border-white/10 bg-black/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Seasons & Episodes</h2>
              <button
                type="button"
                onClick={addSeason}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded"
              >
                + Add Season
              </button>
            </div>

            <p className="text-xs text-white/60">
              ✅ Paste ONLY the URL (iframe src), not the whole iframe tag.
            </p>

            {seasons.map((season, sIndex) => (
              <div key={sIndex} className="border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <label className="text-sm">Season #</label>
                    <input
                      type="number"
                      className="w-24 p-2 bg-black/40 border border-white/10 rounded"
                      value={season.seasonNumber}
                      onChange={(e) => updateSeasonNumber(sIndex, e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addEpisode(sIndex)}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded"
                    >
                      + Episode
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSeason(sIndex)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded"
                    >
                      Remove Season
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {(season.episodes || []).map((ep, eIndex) => (
                    <div
                      key={eIndex}
                      className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-3 items-start"
                    >
                      <div>
                        <label className="block text-sm mb-1">Episode #</label>
                        <input
                          type="number"
                          className="w-full p-2 bg-black/40 border border-white/10 rounded"
                          value={ep.episodeNumber}
                          onChange={(e) =>
                            updateEpisode(sIndex, eIndex, "episodeNumber", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm mb-1">Player URL</label>
                        <input
                          className="w-full p-2 bg-black/40 border border-white/10 rounded"
                          value={ep.player || ""}
                          onChange={(e) => updateEpisode(sIndex, eIndex, "player", e.target.value)}
                          placeholder="https://vidsrcme.ru/embed/tv?imdb=tt3581920&season=1&episode=1"
                        />
                      </div>

                      <div className="pt-6">
                        <button
                          type="button"
                          onClick={() => removeEpisode(sIndex, eIndex)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* THUMBNAIL URL */}
        <div>
          <label className="block mb-1">Thumbnail URL (TMDB/Poster)</label>
          <input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://image.tmdb.org/t/p/w500/xxxx.jpg"
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
          />
        </div>

        {/* BANNER URL */}
        <div>
          <label className="block mb-1">Banner URL (TMDB/Backdrop)</label>
          <input
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://image.tmdb.org/t/p/original/yyyy.jpg"
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-[#2EA8FF] hover:bg-[#4FB5FF] rounded font-semibold mt-4"
        >
          Add Movie
        </button>
      </form>
    </div>
  );
}
