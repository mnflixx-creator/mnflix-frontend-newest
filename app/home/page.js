"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";

export default function HomePage() {
  const router = useRouter();

  const [settings, setSettings] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [myListIds, setMyListIds] = useState([]);
  const { lang } = useLanguage();
  const [recommended, setRecommended] = useState([]);

  const [isFading, setIsFading] = useState(false);

  // ✅ CONTINUE WATCHING STATE
  const [continueWatching, setContinueWatching] = useState([]);
  // ✅ TMDB rows (like p-stream)
  const [tmdbTrending, setTmdbTrending] = useState([]);
  const [heroOverride, setHeroOverride] = useState(null);
  const [tmdbNew, setTmdbNew] = useState([]);
  const [tmdbPopular, setTmdbPopular] = useState([]);
  const [tmdbTop, setTmdbTop] = useState([]);
  const [kdramas, setKdramas] = useState([]);
  const [cdramas, setCdramas] = useState([]);
  const [animeTmdb, setAnimeTmdb] = useState([]);
  const [cdramasManual, setCdramasManual] = useState([]);
  const [animeManual, setAnimeManual] = useState([]);
  const [adultMovies, setAdultMovies] = useState([]);

  const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // ✅ MOBILE MENU
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const go = (path) => {
    setMenuOpen(false);
    router.push(path);
  };

  const logout = () => {
    setMenuOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("subscriptionActive");
    localStorage.removeItem("reset_email");
    router.push("/login");
  };

  const openTmdb = async (itemOrId) => {
    try {
      const item = typeof itemOrId === "object" ? itemOrId : null;
      const tmdbId = item?.id || itemOrId;

      // Decide content type you want to save in your DB
      // default: tv -> series, movie -> movie
      const type =
        item?.media_type === "tv" || item?.first_air_date || item?.name
          ? "series"
          : "movie";

      const token = localStorage.getItem("token");

      // ✅ Use YOUR SAFE route (creates if missing, returns existing if already there)
      const res = await fetch(`${API_BASE}/api/movies/by-tmdb/${tmdbId}?type=${type}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return alert(data?.message || `Open failed (${res.status})`);

      if (!data?._id) return alert("No Mongo ID returned");
      router.push(`/movie/${data._id}`);
    } catch (e) {
      alert("Open failed");
    }
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = searchText.trim();
    if (!q) return;
    setMenuOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  // -------- LOAD SETTINGS --------
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/homepageSettings`);
        const data = await res.json();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
    load();
  }, [API_BASE]);

    // ✅ LOAD TMDB ROWS (p-stream style)
    useEffect(() => {
      async function loadTmdb() {
        try {
          const safe = (url) =>
            fetch(url).then((r) => (r.ok ? r.json() : []));

          const [t, n, p, top] = await Promise.all([
            safe(`${API_BASE}/api/tmdb/trending`),
            safe(`${API_BASE}/api/tmdb/new`),
            safe(`${API_BASE}/api/tmdb/popular`),
            safe(`${API_BASE}/api/tmdb/top`),
          ]);

          setTmdbTrending(Array.isArray(t) ? t : []);
          setTmdbNew(Array.isArray(n) ? n : []);
          setTmdbPopular(Array.isArray(p) ? p : []);
          setTmdbTop(Array.isArray(top) ? top : []);
        } catch (err) {
          console.log("TMDB load error:", err);
        }
      }

      loadTmdb();
    }, [API_BASE]);

    // ✅ LOAD MANUAL ANIME + C-DRAMA (from your own Movie collection)
    useEffect(() => {
      if (!API_BASE) return;

      async function loadManualAsia() {
        try {
          const safeJson = async (res) => (res.ok ? await res.json() : []);

          const [animeRes, cdramaRes] = await Promise.all([
            fetch(`${API_BASE}/api/movies/type/anime?source=manual&limit=40`),
            fetch(`${API_BASE}/api/movies/type/cdrama?source=manual&limit=40`),
          ]);

          const [animeData, cdramaData] = await Promise.all([
            safeJson(animeRes),
            safeJson(cdramaRes),
          ]);

          setAnimeManual(Array.isArray(animeData) ? animeData : []);
          setCdramasManual(Array.isArray(cdramaData) ? cdramaData : []);
        } catch (e) {
          console.error("Manual Asia load error:", e);
        }
      }

      loadManualAsia();
    }, [API_BASE]);

    // ✅ LOAD ADULT MOVIES (Mongo only: selected in admin)
    useEffect(() => {
      if (!API_BASE) return;

      fetch(`${API_BASE}/api/movies/adult?limit=40`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setAdultMovies(Array.isArray(data) ? data : []))
        .catch(() => setAdultMovies([]));
    }, [API_BASE]);
  
    // ✅ LOAD RECOMMENDED FOR USER
    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token || !API_BASE) return;

      fetch(`${API_BASE}/api/movies/recommended`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setRecommended(data);
        })
        .catch((err) => console.log("Recommended error:", err));
    }, [API_BASE]);

      // ✅ LOAD K-DRAMA ONLY (from TMDB)
      useEffect(() => {
        if (!TMDB_KEY) {
          console.warn("❗ NEXT_PUBLIC_TMDB_API_KEY is not set");
          return;
        }

        const controller = new AbortController();

        async function loadKdramas() {
          try {
            const base = "https://api.themoviedb.org/3/discover/tv";

            const url =
              base +
              "?" +
              new URLSearchParams({
                api_key: TMDB_KEY,
                sort_by: "popularity.desc",
                "vote_count.gte": "50",
                with_original_language: "ko",
              });

            const res = await fetch(url, { signal: controller.signal });
            const data = res.ok ? await res.json() : {};
            setKdramas(Array.isArray(data.results) ? data.results.slice(0, 18) : []);
          } catch (e) {
            if (e.name !== "AbortError") {
              console.error("TMDB K-drama error:", e);
            }
          }
        }

        loadKdramas();

        return () => controller.abort();
      }, [TMDB_KEY]);

      // ✅ LOAD ANIME ONLY (from TMDB)
      useEffect(() => {
        if (!TMDB_KEY) {
          console.warn("❗ NEXT_PUBLIC_TMDB_API_KEY is not set");
          return;
        }

        const controller = new AbortController();

        async function loadAnime() {
          try {
            const base = "https://api.themoviedb.org/3/discover/tv";

            const url =
              base +
              "?" +
              new URLSearchParams({
                api_key: TMDB_KEY,
                sort_by: "popularity.desc",
                "vote_count.gte": "50",
                with_original_language: "ja", // 🇯🇵 Japanese
                with_genres: "16",            // animation
              });

            const res = await fetch(url, { signal: controller.signal });
            const data = res.ok ? await res.json() : {};
            setAnimeTmdb(Array.isArray(data.results) ? data.results.slice(0, 18) : []);
          } catch (e) {
            if (e.name !== "AbortError") {
              console.error("TMDB Anime error:", e);
            }
          }
        }

        loadAnime();

        return () => controller.abort();
      }, [TMDB_KEY]);

  const deleteFromContinue = async (movieId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch(`${API_BASE}/api/progress/delete/${movieId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // ✅ REMOVE FROM UI INSTANTLY
    setContinueWatching((prev) =>
      prev.filter((item) => item?.movieId?._id !== movieId)
    );
  };

  // ✅ LOAD CONTINUE WATCHING
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_BASE}/api/progress/continue`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => Array.isArray(data) && setContinueWatching(data))
      .catch((err) => console.log("Continue error:", err));
  }, [API_BASE]);

  // ✅ LOAD MY LIST IDS
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_BASE}/api/movies/favorite/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMyListIds(data.filter((m) => m?._id).map((m) => m._id));
        }
      });
  }, []);

  const slider = tmdbTrending || [];
  const newReleases = settings?.newReleases || [];
  const trending = settings?.trending || [];
  const movies = settings?.movies || [];
  const series = settings?.series || [];
  const anime = settings?.anime || [];

  // -------- SLIDER AUTO-SWITCH (with fade) --------
  useEffect(() => {
    if (slider.length === 0) return;

    const interval = setInterval(() => {
      // fade out
      setIsFading(true);

      // after 300ms change slide + fade in
      setTimeout(() => {
        setSlideIndex((prev) => (prev + 1) % slider.length);
        setIsFading(false);
      }, 300);
    }, 7000); // change every 7s (adjust if you want)

    return () => clearInterval(interval);
  }, [slider.length]);

  // -------- PRELOAD SLIDER IMAGES --------
  useEffect(() => {
    if (!slider.length || !API_BASE) return;

    slider.forEach((s) => {
      let url = "";

      if (s?.backdrop_path) {
        url = `https://image.tmdb.org/t/p/original${s.backdrop_path}`;
      } else if (s?.banner || s?.thumbnail) {
        const path = s.banner || s.thumbnail;
        url = path.startsWith("http") ? path : `${API_BASE}${path}`;
      }

      if (!url) return;

      const img = new Image();
      img.src = url; // browser will cache it
    });
  }, [slider, API_BASE]);

  // ✅ HERO OVERRIDE (must be ABOVE the "if (!settings) return")
  useEffect(() => {
    async function loadHeroOverride() {
      const tmdbId = slider?.[slideIndex]?.id; // get from slider safely

      if (!tmdbId || !API_BASE) {
        setHeroOverride(null);
        return;
      }

      try {
        const s = slider?.[slideIndex];
        const isTv =
          s?.media_type === "tv" || s?.first_air_date || s?.name;

        const type = isTv ? "series" : "movie";

        const res = await fetch(`${API_BASE}/api/movies/by-tmdb/${tmdbId}?type=${type}`);
        if (!res.ok) {
          setHeroOverride(null);
          return;
        }

        const doc = await res.json();
        setHeroOverride(doc && doc._id ? doc : null);
      } catch {
        setHeroOverride(null);
      }
    }

    loadHeroOverride();
  }, [API_BASE, slideIndex, slider]);

  if (!settings) {
    return <div className="text-white p-10 text-xl">Түр хүлээнэ үү...</div>;
  }

  const currentSlide = slider[slideIndex];

  // ✅ TOGGLE MY LIST (ADD / REMOVE + INSTANT SYNC)
  const toggleMyList = async (movieId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Нэвтэрч орно уу");

    const isAdded = myListIds.includes(movieId);

    const url = isAdded
      ? `${API_BASE}/api/movies/favorite/remove`
      : `${API_BASE}/api/movies/favorite/add`;

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ movieId }),
    });

    // ✅ INSTANT UI SYNC (NO RELOAD)
    setMyListIds((prev) =>
      isAdded ? prev.filter((id) => id !== movieId) : [...prev, movieId]
    );
  };

  const imgURL = (path) =>
    path?.startsWith("http") ? path : `${API_BASE}${path}`;

  return (
    <div className="bg-black min-h-screen text-white">
      {/* give space for fixed mobile header */}
      <div className="pt-0">
        {/* ---------- HERO SLIDER ---------- */}
        {currentSlide && (
          <div
            className={`
              relative w-full bg-cover bg-center cursor-pointer
              h-[50vh] sm:h-[60vh] lg:h-[72vh]
              flex items-end
              transition-opacity duration-700
              ${isFading ? "opacity-0" : "opacity-100"}
            `}
            style={{
              backgroundImage: `url(${
                currentSlide.backdrop_path
                  ? `https://image.tmdb.org/t/p/original${currentSlide.backdrop_path}`
                  : imgURL(
                      heroOverride?.banner ||
                        heroOverride?.thumbnail ||
                        currentSlide.banner ||
                        currentSlide.thumbnail
                    )
              })`,
            }}
            onClick={() => openTmdb(currentSlide)}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

            <div
              className="
                relative z-10 drop-shadow-xl
                p-4 sm:p-8 lg:p-12
                max-w-full sm:max-w-xl lg:max-w-2xl
              "
            >
              <h1 className="font-extrabold mb-3 sm:mb-4 lg:mb-6 text-3xl sm:text-5xl lg:text-6xl leading-tight">
                {heroOverride?.title || currentSlide.title || currentSlide.name}
              </h1>

              <p className="mb-5 sm:mb-6 lg:mb-8 opacity-90 text-sm sm:text-base lg:text-lg line-clamp-2 sm:line-clamp-3">
                {heroOverride?.description || currentSlide.overview || currentSlide.description}
              </p>

              {/* ✅ HERO BUTTONS (small style fix only, still same layout) */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button className="w-full sm:w-auto px-6 sm:px-10 py-3 bg-white text-black rounded-md text-base sm:text-lg font-semibold hover:bg-gray-300 transition inline-flex items-center justify-center gap-2">
                  ▶ Үзэх
                </button>

                <button className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gray-700/60 backdrop-blur-sm rounded-md text-base sm:text-lg hover:bg-gray-600 transition inline-flex items-center justify-center gap-2">
                  ℹ Дэлгэрэнгүй
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ CONTINUE WATCHING ROW */}
        {continueWatching.length > 0 && (
          <MovieRow
            title={lang === "mn" ? "▶ Үргэлжлүүлж үзэх" : "▶ Continue Watching"}
            movies={continueWatching.map((i) => i.movieId).filter(Boolean)}
            imgURL={imgURL}
            router={router}
            deleteFromContinue={deleteFromContinue}
          />
        )}

        {/* 🎯 Recommended for you */}
        <MovieRow
          title={lang === "mn" ? "Зөвхөн таньд санал болгож буй" : "Recommended for You"}
          movies={recommended}
          imgURL={imgURL}
          router={router}
          toggleMyList={toggleMyList}
          myListIds={myListIds}
        />

        {/* ---------- MOVIE ROWS ---------- */}

        {/* ✅ TMDB ROWS (Auto like p-stream) */}
        <MovieRow
          title={lang === "mn" ? "Тренд болж буй" : "Trending"}
          movies={tmdbTrending}
          imgURL={imgURL}
          router={router}
        />

        <MovieRow
          title={lang === "mn" ? "Шинээр нэмэгдсэн" : "New Releases"}
          movies={tmdbNew}
          imgURL={imgURL}
          router={router}
        />

        <MovieRow
          title={lang === "mn" ? "Одоогоор хамгийн алдартай" : "Popular"}
          movies={tmdbPopular}
          imgURL={imgURL}
          router={router}
        />

        {/* 🇰🇷 K-Drama (TMDB) */}
        <MovieRow
          title={lang === "mn" ? "Солонгос драма" : "K-Drama"}
          movies={kdramas}
          imgURL={imgURL}
          router={router}
        />

        <MovieRow
          title={lang === "mn" ? "Анимэ" : "Anime"}
          movies={animeTmdb}
          imgURL={imgURL}
          router={router}
        />

        <MovieRow
          title={lang === "mn" ? "🔞 Насанд хүрэгчидэд" : "🔞 Adults Only"}
          movies={adultMovies}
          imgURL={imgURL}
          router={router}
        />

        {/* 🔹 LEGAL DISCLAIMER */}
        <footer className="mt-10 border-t border-white/10 py-6">
          <div className="max-w-[1300px] mx-auto px-4 text-[11px] sm:text-xs text-gray-400 leading-relaxed text-center">
            We do not host, upload, store, or distribute any media files. All content is
            provided by third-party services through publicly available embedded players.
            If you believe any content infringes your copyright, please contact the
            original hosting provider.
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ---------------- MENU ITEM (MOBILE) ---------------- */
function MenuItem({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 rounded transition
        ${
          danger
            ? "text-red-300 hover:bg-red-500/10"
            : "text-white hover:bg-white/10"
        }`}
    >
      {label}
    </button>
  );
}

/* ---------------- MOVIE ROW COMPONENT ---------------- */
function MovieRow({
  title,
  movies,
  imgURL,
  router,
  deleteFromContinue,
  toggleMyList,
  myListIds,
}) {
  // ✅ detect touch devices and keep overlay open on tap
  const [isTouch, setIsTouch] = useState(false);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: none)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Filter out null/undefined movies BEFORE rendering
  const validMovies = (movies || []).filter((movie) => movie && (movie._id || movie.id));

  if (!validMovies.length) return null;

  const isContinue = title.includes("Үргэлжлүүлж") || title.includes("Continue");
  
  const openMovie = (movie) => {
    const id = movie._id || movie.id;

    // Already in Mongo
    if (movie._id) {
      router.push(`/movie/${id}`);
      return;
    }

    // TMDB item -> use /by-tmdb (safe)
    const isTv =
      movie.media_type === "tv" || movie.first_air_date || movie.name;

    const type = isTv ? "series" : "movie";

    const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
    const endpoint = `${base}/api/movies/by-tmdb/${id}?type=${type}`;

    const token = localStorage.getItem("token");

    fetch(endpoint, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.message || `Open failed (${r.status})`);
        return data;
      })
      .then((doc) => {
        if (doc?._id) router.push(`/movie/${doc._id}`);
        else alert("No Mongo ID returned");
      })
      .catch((err) => alert(err?.message || "Open failed"));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 lg:mt-14">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">
        {title}
      </h2>

      <div
        className="
          flex gap-3 sm:gap-4 overflow-x-auto pb-5 sm:pb-6
          scrollbar-hide
          snap-x snap-mandatory
          [-webkit-overflow-scrolling:touch]
        "
      >
        {[...new Map(validMovies.map((m) => [m._id || m.id, m])).values()].map(
          (movie) => {
            const movieKey = movie._id || movie.id;
            const opened = activeId === movieKey;

            return (
              <div
                key={movieKey}
                className="
                  relative cursor-pointer group
                  min-w-[140px] sm:min-w-[160px] lg:min-w-[180px]
                  snap-start
                  rounded-md overflow-hidden
                "
                onClick={() => {
                  // ✅ Mobile: first tap opens overlay (keeps open)
                  if (isTouch) {
                    setActiveId((prev) => (prev === movieKey ? null : movieKey));
                    return;
                  }
                  // ✅ Desktop: normal click opens movie
                  openMovie(movie);
                }}
              >
                <img
                  src={imgURL(
                    movie.thumbnail ||
                      (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "")
                  )}
                  className="
                    w-full object-cover shadow-lg block
                    h-[200px] sm:h-[230px] lg:h-[260px]
                    transition-transform duration-300
                    group-hover:scale-110
                  "
                  alt={movie.title || movie.name || ""}
                />
                {/* ✅ overlay: hover on PC, tap-toggle on mobile */}
                <div
                  className={`
                    absolute inset-0 bg-black/70
                    flex flex-col items-center justify-center gap-2 sm:gap-3
                    z-10
                    transition-opacity
                    rounded-md
                    ${
                      isTouch
                        ? opened
                          ? "opacity-100 pointer-events-auto"
                          : "opacity-0 pointer-events-none"
                        : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
                    }
                  `}
                >
                  {/* ▶ PLAY */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openMovie(movie);
                    }}
                    className="px-4 sm:px-6 py-2 bg-white text-black rounded font-semibold hover:bg-gray-200 text-sm sm:text-base"
                  >
                    ▶ Үзэх
                  </button>

                  {/* 🗑 REMOVE (only in Continue Watching row) */}
                  {isContinue && deleteFromContinue && movie._id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFromContinue(movie._id);
                      }}
                      className="px-4 sm:px-6 py-2 bg-red-600/90 hover:bg-red-600 text-white rounded font-semibold text-xs sm:text-sm"
                    >
                      🗑 Устгах
                    </button>
                  )}

                  {/* 💙 MY LIST (for rows that use it) */}
                  {toggleMyList && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!movie._id) return;
                        toggleMyList(movie._id);
                      }}
                      className={`px-4 sm:px-5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition
                        ${
                          myListIds?.includes(movie._id)
                            ? "bg-[#1DA1FF] text-white"
                            : "bg-white text-black hover:bg-gray-200"
                        }`}
                    >
                      {myListIds?.includes(movie._id) ? "✔ Added" : "💙 Миний жагсаалт"}
                    </button>
                  )}
                </div>

                <p className="mt-2 text-gray-300 group-hover:text-white transition font-medium text-sm sm:text-base line-clamp-1">
                  {movie.title || movie.name}
                </p>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
