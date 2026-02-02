"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddMoviePage() {
  const router = useRouter();

  const [movie, setMovie] = useState({
    title: "",
    description: "",
    year: "",
    genres: [],
    player1: "",
    player2: "",
    player3: "",
    kidsOnly: false,
    isTrending: false,

    // ✅ NEW FIELD
    type: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const GENRES = [
    "Action",
    "Comedy",
    "Drama",
    "Horror",
    "Sci-Fi",
    "Romance",
    "Kids",
    "Documentary",
    "Fantasy",
    "Thriller",
    "Animation",
    "Crime",
    "Adventure",
  ];

  // ⭐ ADD MOVIE
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("adminToken");
    const formData = new FormData();

    formData.append("title", movie.title);
    formData.append("description", movie.description);
    formData.append("year", movie.year);
    formData.append("genres", JSON.stringify(movie.genres));
    formData.append("player1", movie.player1);
    formData.append("player2", movie.player2);
    formData.append("player3", movie.player3);
    formData.append("kidsOnly", movie.kidsOnly);
    formData.append("isTrending", movie.isTrending);

    // ✅ ADD TYPE FIELD
    formData.append("type", movie.type);

    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
    if (bannerFile) formData.append("banner", bannerFile);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/movies/add`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

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
        {/* TITLE */}
        <div>
          <label className="block mb-1">Title</label>
          <input
            value={movie.title}
            onChange={(e) =>
              setMovie({ ...movie, title: e.target.value })
            }
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            value={movie.description}
            onChange={(e) =>
              setMovie({ ...movie, description: e.target.value })
            }
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
          />
        </div>

        {/* YEAR */}
        <div>
          <label className="block mb-1">Year</label>
          <input
            type="number"
            value={movie.year}
            onChange={(e) =>
              setMovie({ ...movie, year: e.target.value })
            }
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
          />
        </div>

        {/* TYPE SELECTOR */}
        <div>
          <label className="block mb-1">Type</label>
          <select
            value={movie.type}
            onChange={(e) =>
              setMovie({ ...movie, type: e.target.value })
            }
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
            required
          >
            <option value="">Select type</option>
            <option value="movie">Movie</option>
            <option value="series">Series</option>
            <option value="anime">Anime</option>
          </select>
        </div>

        {/* MULTI GENRE SELECTOR */}
        <div>
          <label>Genres</label>

          <div className="flex flex-wrap gap-2 my-2">
            {movie.genres.map((g) => (
              <span
                key={g}
                className="px-3 py-1 bg-blue-600/30 border border-blue-400 rounded-full text-sm flex gap-2 items-center"
              >
                {g}
                <button
                  type="button"
                  onClick={() =>
                    setMovie({
                      ...movie,
                      genres: movie.genres.filter((x) => x !== g),
                    })
                  }
                  className="text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <select
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
            onChange={(e) => {
              const val = e.target.value;
              if (val && !movie.genres.includes(val)) {
                setMovie({ ...movie, genres: [...movie.genres, val] });
              }
            }}
          >
            <option value="">Select genre</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* PLAYERS */}
        <div>
          <label>Player 1 URL</label>
          <input
            value={movie.player1}
            onChange={(e) =>
              setMovie({ ...movie, player1: e.target.value })
            }
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
          />
        </div>

        <div>
          <label>Player 2 URL</label>
          <input
            value={movie.player2}
            onChange={(e) =>
              setMovie({ ...movie, player2: e.target.value })
            }
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
          />
        </div>

        <div>
          <label>Player 3 URL</label>
          <input
            value={movie.player3}
            onChange={(e) =>
              setMovie({ ...movie, player3: e.target.value })
            }
            className="w-full p-3 bg-black/40 border border-white/10 rounded"
          />
        </div>

        {/* UPLOADS */}
        <div>
          <label>Thumbnail</label>
          <input
            type="file"
            onChange={(e) => setThumbnailFile(e.target.files[0])}
            className="mt-2"
          />
        </div>

        <div>
          <label>Banner</label>
          <input
            type="file"
            onChange={(e) => setBannerFile(e.target.files[0])}
            className="mt-2"
          />
        </div>

        {/* TOGGLES */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={movie.kidsOnly}
            onChange={(e) =>
              setMovie({ ...movie, kidsOnly: e.target.checked })
            }
          />
          Kids Only
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={movie.isTrending}
            onChange={(e) =>
              setMovie({ ...movie, isTrending: e.target.checked })
            }
          />
          Trending
        </label>

        {/* SUBMIT */}
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
