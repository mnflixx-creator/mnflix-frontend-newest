
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminSubtitleUpload from "@/components/AdminSubtitleUpload";

export default function EditMoviePage() {
  const router = useRouter();
  const params = useParams();
  const movieId = params.id;

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const [seasons, setSeasons] = useState([]);

  // ✅ for series/anime builder (optional)
  const [imdbId, setImdbId] = useState("");
  const [providerUrl, setProviderUrl] = useState("");

  const defaultEpisodeUrl = (imdb, seasonNumber, episodeNumber) => {
    if (!imdb) return "";
    return `https://vidsrcme.ru/embed/tv?imdb=${imdb}&season=${seasonNumber}&episode=${episodeNumber}`;
  };

  // ✅ LOAD MOVIE FROM BACKEND (you lost this in your last paste)
  useEffect(() => {
    async function loadMovie() {
      try {
        const res = await fetch(`${API_BASE}/api/movies/${movieId}`);

        const data = await res.json();

        setMovie({
          _id: data._id, // keep the id
          title: data.title ?? "",
          description: data.description ?? "",
          year: data.year ?? "",
          rating: data.rating ?? 0,
          genres: Array.isArray(data.genres) ? data.genres : [],
          player1: data.player1 ?? "",
          player2: data.player2 ?? "",
          player3: data.player3 ?? "",
          kidsOnly: data.kidsOnly ?? false,
          isTrending: data.isTrending ?? false,
          thumbnail: data.thumbnail ?? "",
          banner: data.banner ?? "",
          type: data.type ?? "movie",
          subtitles: Array.isArray(data.subtitles) ? data.subtitles : [], // movie-level
        });

        setSeasons(Array.isArray(data.seasons) ? data.seasons : []);
        setImdbId(data.imdbId ?? "");
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setLoading(false);
      }
    }

    loadMovie();
  }, [movieId, API_BASE]);

  // 🔴 REMOVE THIS – it was causing errors (zData, setProviderSubs, etc.)
  // // extract subtitles from provider
  // const firstServer = zData?.streams?.[0];
  // const zSubs = Array.isArray(firstServer?.subtitles) ? firstServer.subtitles : [];
  // setProviderSubs(zSubs);

  const imgSrc = (p) => {
    if (!p) return "";
    if (p.startsWith("http")) return p;
    return `${API_BASE}${p}`;
  };

  const addSeason = () => {
    const nextSeasonNumber = (seasons?.length || 0) + 1;
    setSeasons((prev) => [
      ...(prev || []),
      {
        seasonNumber: nextSeasonNumber,
        episodes: [
          {
            episodeNumber: 1,
            player: defaultEpisodeUrl(imdbId, nextSeasonNumber, 1),
          },
        ],
      },
    ]);
  };

  const removeSeason = (seasonIndex) => {
    setSeasons((prev) => prev.filter((_, i) => i !== seasonIndex));
  };

  const addEpisode = (seasonIndex) => {
    setSeasons((prev) => {
      const copy = [...prev];
      const season = copy[seasonIndex];
      const nextEpNumber = (season.episodes?.length || 0) + 1;
      season.episodes = [
        ...(season.episodes || []),
        {
          episodeNumber: nextEpNumber,
          player: defaultEpisodeUrl(
            imdbId,
            season.seasonNumber,
            nextEpNumber
          ),
        },
      ];
      copy[seasonIndex] = { ...season };
      return copy;
    });
  };

  const removeEpisode = (seasonIndex, epIndex) => {
    setSeasons((prev) => {
      const copy = [...prev];
      const season = copy[seasonIndex];
      season.episodes = (season.episodes || []).filter((_, i) => i !== epIndex);
      copy[seasonIndex] = { ...season };
      return copy;
    });
  };

  const updateSeasonNumber = (seasonIndex, value) => {
    const sn = Number(value || 0);
    setSeasons((prev) => {
      const copy = [...prev];
      const season = copy[seasonIndex];
      const episodes = (season.episodes || []).map((ep) => ({
        ...ep,
        player: defaultEpisodeUrl(imdbId, sn, ep.episodeNumber) || ep.player,
      }));
      copy[seasonIndex] = { ...season, seasonNumber: sn, episodes };
      return copy;
    });
  };

  const updateEpisodeNumber = (seasonIndex, epIndex, value) => {
    const epNum = Number(value || 0);
    setSeasons((prev) => {
      const copy = [...prev];
      const season = copy[seasonIndex];
      const episodes = [...(season.episodes || [])];
      episodes[epIndex] = {
        ...episodes[epIndex],
        episodeNumber: epNum,
        player:
          defaultEpisodeUrl(imdbId, season.seasonNumber, epNum) ||
          episodes[epIndex].player,
      };
      copy[seasonIndex] = { ...season, episodes };
      return copy;
    });
  };

  const updateEpisodePlayer = (seasonIndex, epIndex, value) => {
    setSeasons((prev) => {
      const copy = [...prev];
      const season = copy[seasonIndex];
      const episodes = [...(season.episodes || [])];
      episodes[epIndex] = { ...episodes[epIndex], player: value };
      copy[seasonIndex] = { ...season, episodes };
      return copy;
    });
  };

  const rebuildUrls = () => {
    setSeasons((prev) =>
      (prev || []).map((s) => ({
        ...s,
        episodes: (s.episodes || []).map((ep) => ({
          ...ep,
          player:
            defaultEpisodeUrl(imdbId, s.seasonNumber, ep.episodeNumber) ||
            ep.player,
        })),
      }))
    );
  };

  // 🟥 MOVIE-LEVEL SUBTITLE DELETE
  const handleDeleteSubtitle = async (index) => {
    if (!movie?._id) return;

    const token = localStorage.getItem("adminToken");
    if (!token) {
      alert("Missing admin token");
      return;
    }

    if (!confirm("Delete this subtitle?")) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/movies/${movie._id}/subtitles/${index}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Delete subtitle failed:", data);
        alert(data.message || "Failed to delete subtitle");
        return;
      }

      if (Array.isArray(data.subtitles)) {
        setMovie((prev) =>
          prev ? { ...prev, subtitles: data.subtitles } : prev
        );
      } else {
        setMovie((prev) =>
          prev
            ? {
                ...prev,
                subtitles: (prev.subtitles || []).filter(
                  (_, i) => i !== index
                ),
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Delete subtitle error:", err);
      alert("Network error while deleting subtitle");
    }
  };

  // 🟦 EPISODE-LEVEL SUBTITLE DELETE
  const handleDeleteEpisodeSubtitle = async (
    seasonNumber,
    episodeNumber,
    subIndex
  ) => {
    if (!movie?._id) return;

    const token = localStorage.getItem("adminToken");
    if (!token) {
      alert("Missing admin token");
      return;
    }

    if (!confirm("Delete this episode subtitle?")) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/movies/${movie._id}/episode-subtitles`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seasonNumber,
            episodeNumber,
            subIndex,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Delete episode subtitle failed:", data);
        alert(data.message || "Failed to delete episode subtitle");
        return;
      }

      const newSubs = Array.isArray(data.subtitles) ? data.subtitles : [];

      setSeasons((prev) =>
        (prev || []).map((s) => {
          if (Number(s.seasonNumber) !== Number(seasonNumber)) return s;
          return {
            ...s,
            episodes: (s.episodes || []).map((ep) => {
              if (Number(ep.episodeNumber) !== Number(episodeNumber)) return ep;
              return {
                ...ep,
                subtitles: newSubs,
              };
            }),
          };
        })
      );
    } catch (err) {
      console.error("Delete episode subtitle error:", err);
      alert("Network error while deleting episode subtitle");
    }
  };

  // ⬇️ IMPORTANT: nothing else BEFORE this line
  if (loading || !movie)
    return <p className="text-gray-300">Loading movie…</p>;

  // SAVE
  const saveChanges = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("adminToken");
    const formData = new FormData();

    formData.append("title", movie.title);
    formData.append("description", movie.description);
    formData.append("year", movie.year);
    formData.append("rating", movie.rating);
    formData.append("genres", JSON.stringify(movie.genres));
    formData.append("player1", movie.player1);
    formData.append("player2", movie.player2);
    formData.append("player3", movie.player3);
    formData.append("kidsOnly", movie.kidsOnly);
    formData.append("isTrending", movie.isTrending);

    formData.append("thumbnailUrl", thumbnailUrl || "");
    formData.append("bannerUrl", bannerUrl || "");

    if (movie.type !== "movie") {
      formData.append("seasons", JSON.stringify(seasons));
      formData.append("imdbId", imdbId || "");
    }

    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
    if (bannerFile) formData.append("banner", bannerFile);

    const res = await fetch(`${API_BASE}/api/admin/movies/${movieId}/edit`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      alert("Movie updated!");
      router.push("/admin/movies");
    } else {
      alert(data.message || "Update failed");
    }
  };

  const generateAutoMn = async () => {
    if (!movie?._id) {
      alert("Movie not loaded yet");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      alert("No admin token");
      return;
    }

    if (!providerUrl.trim()) {
      alert("Please paste the English provider subtitle URL first.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/subtitles/auto-mn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          movieId: movie._id,
          providerUrl: providerUrl.trim(),
          providerLang: "en",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("auto-mn failed:", data);
        alert(data.message || "Translation error");
        return;
      }

      alert("Монгол хадмал үүсгэлээ! 🎉");

      if (data.subtitle) {
        setMovie((prev) =>
          prev
            ? {
                ...prev,
                subtitles: [...(prev.subtitles || []), data.subtitle],
              }
            : prev
        );
      }
    } catch (e) {
      console.error("auto-mn error:", e);
      alert("Network error while auto translating");
    }
  };

  const deleteMovie = async () => {
    if (!confirm("Delete this movie?")) return;

    const res = await fetch(`${API_BASE}/api/movies/${movieId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
    });

    if (res.ok) {
      alert("Movie deleted");
      router.push("/admin/movies");
    } else {
      alert("Delete failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit</h1>
        <button
          onClick={deleteMovie}
          className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold"
        >
          Delete
        </button>
      </div>

      <form onSubmit={saveChanges} className="space-y-6">
        {/* TITLE */}
        <div>
          <label className="block mb-1">Title</label>
          <input
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
            value={movie.title}
            onChange={(e) => setMovie({ ...movie, title: e.target.value })}
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
            value={movie.description}
            onChange={(e) =>
              setMovie({ ...movie, description: e.target.value })
            }
          />
        </div>

        {/* YEAR */}
        <div>
          <label className="block mb-1">Year</label>
          <input
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
            value={movie.year}
            onChange={(e) => setMovie({ ...movie, year: e.target.value })}
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
            onChange={(e) =>
              setMovie({ ...movie, rating: Number(e.target.value) })
            }
          />
        </div>

        {/* TYPE */}
        <div>
          <label className="block mb-1">Type</label>
          <div className="w-full p-3 bg-black/40 border border-white/10 rounded opacity-80">
            {movie.type}
          </div>
        </div>

        {/* PLAYER LINKS (ONLY FOR MOVIE) */}
        {movie.type === "movie" && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Player 1 URL</label>
              <input
                value={movie.player1}
                onChange={(e) =>
                  setMovie({ ...movie, player1: e.target.value })
                }
                placeholder="https://vidsrcme.ru/embed/movie?imdb=tt5433140"
                className="w-full p-3 bg-black/40 border border-white/10 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Player 2 URL</label>
              <input
                value={movie.player2}
                onChange={(e) =>
                  setMovie({ ...movie, player2: e.target.value })
                }
                placeholder="https://..."
                className="w-full p-3 bg-black/40 border border-white/10 rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Player 3 URL</label>
              <input
                value={movie.player3}
                onChange={(e) =>
                  setMovie({ ...movie, player3: e.target.value })
                }
                placeholder="https://..."
                className="w-full p-3 bg-black/40 border border-white/10 rounded"
              />
            </div>

            {/* Subtitle upload box */}
            <AdminSubtitleUpload
              movieId={movie._id}
              onUploaded={(subs) =>
                setMovie((prev) => ({ ...prev, subtitles: subs }))
              }
            />

            {/* Provider subtitle URL (English) */}
            <div className="mt-4 space-y-1">
              <label className="block text-xs uppercase opacity-70">
                Provider English subtitle URL
              </label>
              <input
                type="text"
                value={providerUrl}
                onChange={(e) => setProviderUrl(e.target.value)}
                placeholder="Paste English subtitle URL from provider (e.g. Nova)"
                className="w-full p-2 bg-black/40 border border-white/10 rounded text-xs"
              />
              <p className="text-[11px] text-white/50">
                Copy the English .vtt/.srt URL from your provider (Network tab) and paste it here.
              </p>
            </div>

            <button
              type="button"
              onClick={generateAutoMn}
              className="mt-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              🇲🇳 Auto translate (AI)
            </button>

            {/* Existing subtitles */}
            {Array.isArray(movie.subtitles) && movie.subtitles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-semibold text-white/80">
                  Existing subtitles
                </h4>

                {movie.subtitles.map((sub, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-black/40 border border-white/10 rounded px-3 py-2 text-xs"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {sub.label || sub.lang || `Subtitle ${index + 1}`}
                      </span>
                      <span className="text-[11px] text-white/60">
                        lang: {sub.lang || "n/a"}
                      </span>
                      <span className="text-[11px] text-white/40 truncate max-w-[260px]">
                        {sub.url}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSubtitle(index)}
                      className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-[11px] font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* THUMBNAIL */}
        <div className="space-y-2">
          <label className="block mb-1">Thumbnail</label>
          {movie.thumbnail ? (
            <img
              src={imgSrc(movie.thumbnail)}
              className="w-24 h-32 object-cover rounded border border-white/10"
            />
          ) : (
            <p className="text-xs text-gray-400">No thumbnail</p>
          )}
          <input
            type="file"
            onChange={(e) =>
              setThumbnailFile(e.target.files?.[0] || null)
            }
          />
          <input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="Optional: TMDB poster URL"
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
          />
        </div>

        {/* BANNER */}
        <div className="space-y-2">
          <label className="block mb-1">Banner</label>
          {movie.banner ? (
            <img
              src={imgSrc(movie.banner)}
              className="w-full h-40 object-cover rounded border border-white/10"
            />
          ) : (
            <p className="text-xs text-gray-400">No banner</p>
          )}
          <input
            type="file"
            onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
          />
          <input
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="Optional: TMDB backdrop URL"
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
          />
        </div>

        {/* SERIES/ANIME BUILDER */}
        {movie.type !== "movie" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
            <div>
              <label className="block mb-1">
                IMDB ID (auto episode links)
              </label>
              <input
                value={imdbId}
                onChange={(e) => setImdbId(e.target.value.trim())}
                placeholder="tt3581920"
                className="w-full p-3 bg-black/40 border border-white/10 rounded"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={addSeason}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded"
              >
                + Add Season
              </button>

              <button
                type="button"
                onClick={rebuildUrls}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded"
              >
                ↻ Rebuild URLs
              </button>
            </div>

            {seasons.length === 0 ? (
              <p className="text-sm text-gray-400">No seasons yet.</p>
            ) : (
              <div className="space-y-4">
                {seasons.map((s, si) => (
                  <div
                    key={si}
                    className="rounded-xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="font-bold">Season</div>
                        <input
                          type="number"
                          min="1"
                          value={s.seasonNumber}
                          onChange={(e) =>
                            updateSeasonNumber(si, e.target.value)
                          }
                          className="w-24 p-2 bg-black/40 border border-white/10 rounded"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => addEpisode(si)}
                          className="px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded"
                        >
                          + Episode
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSeason(si)}
                          className="px-3 py-2 bg-red-600/80 hover:bg-red-600 rounded"
                        >
                          Remove Season
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(s.episodes || []).map((ep, ei) => (
                        <div key={ei} className="space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_140px] gap-2 items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-300">
                                Episode
                              </span>
                              <input
                                type="number"
                                min="1"
                                value={ep.episodeNumber}
                                onChange={(e) =>
                                  updateEpisodeNumber(
                                    si,
                                    ei,
                                    e.target.value
                                  )
                                }
                                className="w-24 p-2 bg-black/40 border border-white/10 rounded"
                              />
                            </div>

                            <input
                              value={ep.player || ""}
                              onChange={(e) =>
                                updateEpisodePlayer(
                                  si,
                                  ei,
                                  e.target.value
                                )
                              }
                              placeholder="https://vidsrcme.ru/embed/tv?imdb=tt...&season=1&episode=1"
                              className="w-full p-2 bg-black/40 border border-white/10 rounded"
                            />

                            <button
                              type="button"
                              onClick={() => removeEpisode(si, ei)}
                              className="px-3 py-2 bg-red-600/80 hover:bg-red-600 rounded"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="md:pl-[120px] space-y-2">
                            <AdminSubtitleUpload
                              movieId={movie._id}
                              seasonNumber={s.seasonNumber}
                              episodeNumber={ep.episodeNumber}
                              onUploaded={(subs) => {
                                setSeasons((prev) => {
                                  const copy = [...prev];
                                  const season = { ...copy[si] };
                                  const episodes = [
                                    ...(season.episodes || []),
                                  ];
                                  const episode = {
                                    ...(episodes[ei] || {}),
                                  };

                                  episode.subtitles = subs;
                                  episodes[ei] = episode;
                                  season.episodes = episodes;
                                  copy[si] = season;
                                  return copy;
                                });
                              }}
                            />

                            {Array.isArray(ep.subtitles) &&
                              ep.subtitles.length > 0 && (
                                <div className="space-y-1">
                                  <h4 className="text-xs font-semibold text-white/70">
                                    Episode subtitles
                                  </h4>

                                  {ep.subtitles.map(
                                    (sub, subIndex) => (
                                      <div
                                        key={subIndex}
                                        className="flex items-center justify-between bg-black/40 border border-white/10 rounded px-3 py-2 text-[11px]"
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-semibold">
                                            {sub.label ||
                                              sub.lang ||
                                              `Subtitle ${
                                                subIndex + 1
                                              }`}
                                          </span>
                                          <span className="text-[10px] text-white/60">
                                            lang:{" "}
                                            {sub.lang || "n/a"}
                                          </span>
                                          <span className="text-[10px] text-white/40 truncate max-w-[220px]">
                                            {sub.url}
                                          </span>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDeleteEpisodeSubtitle(
                                              s.seasonNumber,
                                              ep.episodeNumber,
                                              subIndex
                                            )
                                          }
                                          className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-[10px] font-semibold"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          className="px-6 py-3 bg-[#2EA8FF] hover:bg-[#4FB5FF] rounded font-semibold"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
