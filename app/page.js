"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [lang, setLang] = useState("mn");

  // 🔹 state for slider
  const [trending, setTrending] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const rowRef = useRef(null);

  // ✅ API BASE (works on localhost and on Vercel)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  // ✅ FIX: handle TMDB links OR backend paths
  const getImgSrc = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${API_BASE}${path}`;
  };

  /** ⭐ TRANSLATIONS */
  const t = {
    mn: {
      heroTitle: "Хязгааргүй кино, цуврал, аниме бүгд нэг дор",
      heroSubtitle: "Багахан төлбөрөөр хүссэн киногоо хүссэн үедээ үз.",
      heroNote: "Бүртгүүлэхийн тулд имэйл хаягаа оруулна уу.",
      emailPlaceholder: "Имэйл хаяг",
      getStarted: "Эхлэх",
      trendingNow: "Одоо тренд болж буй",
      moreReasons: "MNFLIX-г ашиглах шалтгаанууд",
      cardTvTitle: "ТВ дээрээ үз",
      cardTvText:
        "Smart TV, PlayStation, Xbox, Chromecast, Apple TV болон бусад төхөөрөмжөөс шууд үз.",
      // ✅ CHANGED: removed offline/download wording
      cardDownloadTitle: "Өндөр чанар + хамгийн их сонголттой",
      cardDownloadText:
        "Хамгийн өндөр чанараар хамгийн их кино үзэх боломж",
      cardEverywhereTitle: "Дуртай газраасаа үз",
      cardEverywhereText:
        "Гар утас, таблет, ноутбук, ТВ — нэг аккаунтаар хаанаас ч нэвтрэнэ.",
      cardKidsTitle: "Хүүхдийн горим",
      cardKidsText:
        "Хүүхдэд зориулсан аюулгүй профайл үүсгэж, зөвхөн хүүхдийн контент үзүүлээрэй.",
      signIn: "Нэвтрэх",
    },
    en: {
      heroTitle: "Unlimited movies, series and shows in one place.",
      heroSubtitle: "Watch anytime for an affordable monthly price.",
      heroNote: "Ready to watch? Enter your email to get started.",
      emailPlaceholder: "Email address",
      getStarted: "Get Started",
      trendingNow: "Trending Now",
      moreReasons: "More reasons to join MNFLIX",
      cardTvTitle: "Enjoy on your TV",
      cardTvText:
        "Watch on Smart TV, PlayStation, Xbox, Chromecast, Apple TV and more.",
      // ✅ CHANGED: removed offline/download wording
      cardDownloadTitle: "HD streaming + smooth playback",
      cardDownloadText:
        "Playback is automatically optimized for stable video and audio quality.",
      cardEverywhereTitle: "Watch everywhere",
      cardEverywhereText:
        "Stream on phone, tablet, laptop and TV with a single account.",
      cardKidsTitle: "Profiles for kids",
      cardKidsText:
        "Create kid-safe profiles with content picked just for them.",
      signIn: "Sign In",
    },
  }[lang];

  /** ⭐ FORM SUBMIT (NOW EMAIL ONLY) */
  const handleSubmit = (e) => {
    e.preventDefault();
    const value = e.target[0].value.trim();
    router.push(`/register?email=${value}`);
  };

  useEffect(() => {
    if (!API_BASE) return;

    fetch(`${API_BASE}/api/movies/trending`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setTrending(arr); // already max 10 from backend
      })
      .catch(() => setTrending([]));
  }, [API_BASE]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ⭐ TOP BAR */}
      <div className="absolute md:fixed top-0 left-0 w-full z-50">
        <div
          className="
            w-full max-w-[1800px] mx-auto
            flex items-center justify-between
            px-4 sm:px-8 lg:px-[220px]
            py-1
            -mt-10 sm:-mt-8 lg:-mt-14
            bg-transparent
          "
        >
          {/* ✅ KEEP YOUR LOGO SIZE EXACTLY SAME AS BEFORE */}
          <img
            src="/logo.png"
            alt="MNFLIX"
            className="h-50 cursor-pointer object-contain"
            onClick={() => router.push("/")}
          />

          <div className="flex items-center gap-4">
            {/* ✅ Hide MN/EN on phone */}
            <div className="hidden sm:flex items-center gap-4">
              <button
                onClick={() => setLang("mn")}
                className={`px-3 py-1 rounded text-sm ${
                  lang === "mn" ? "bg-white text-black" : "bg-black/40 text-white"
                }`}
              >
                MN
              </button>

              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded text-sm ${
                  lang === "en" ? "bg-white text-black" : "bg-black/40 text-white"
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => router.push("/login")}
              className="px-5 py-2 rounded bg-[#2EA8FF] hover:bg-[#4FB5FF] font-semibold text-sm"
            >
              {t.signIn}
            </button>
          </div>
        </div>
      </div>

      {/* ⭐ HERO SECTION */}
      <div className="relative min-h-[65vh] flex flex-col items-center justify-between">
        <div className="absolute inset-0">
          <img src="/hero.jpg" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
        </div>

        <main className="relative z-10 flex-1 w-full flex items-center">
          <div className="w-full max-w-3xl mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-2">{t.heroTitle}</h1>
            <p className="text-lg text-gray-200 mb-2">{t.heroSubtitle}</p>
            <p className="text-sm text-gray-300 mb-2">{t.heroNote}</p>

            <form
              onSubmit={handleSubmit}
              className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <input
                type="email"
                required
                placeholder={t.emailPlaceholder}
                className="w-full sm:w-2/3 px-4 py-3 rounded bg-black/70 border border-white/40 outline-none focus:border-[#2EA8FF]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded bg-[#2EA8FF] hover:bg-[#52b7ff] font-semibold"
              >
                {t.getStarted}
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* ⭐ NETFLIX-STYLE TRENDING NOW */}
      <section className="bg-gradient-to-b from-black to-[#020617] pt-7 pb-16 overflow-x-hidden">
        <div className="max-w-[1300px] mx-auto px-4 relative">
          <h2 className="text-2xl font-bold mb-6">{t.trendingNow}</h2>

          {/* LEFT EDGE FADE */}
          <div
            className="pointer-events-none absolute left-0 top-0 h-full w-32 
                            bg-gradient-to-r from-black to-transparent z-20"
          ></div>

          {/* RIGHT EDGE FADE */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-32 
                            bg-gradient-to-l from-black to-transparent z-20"
          ></div>

          {/* LEFT ARROW */}
          <button
            onClick={() => rowRef.current.scrollBy({ left: -500, behavior: "smooth" })}
            className="
              absolute -left-10 top-1/2 -translate-y-1/2
              h-[50px] w-[30px]
              flex items-center justify-center
              bg-[#2a2a2a]/70 hover:bg-[#3a3a3a]/90
              rounded-md
              shadow-lg
              z-50
            "
          >
            <svg width="12" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M15 4l-8 8 8 8z"></path>
            </svg>
          </button>

          {/* MOVIE SCROLLER */}
          <div
            ref={rowRef}
            className="
                flex 
                gap-3 sm:gap-[85px]
                overflow-x-auto
                overflow-y-hidden
                no-scrollbar
                scroll-smooth
                px-3 sm:px-10
              "
          >
            {trending.map((movie, index) => (
              <div
                key={movie._id || movie.id}
                onClick={() => setSelectedMovie(movie)}
                className="
                    relative group cursor-pointer
                    flex-shrink-0

                    w-[120px] h-[180px]
                    sm:w-[210px] sm:h-[330px]

                    transition-all duration-300
                    hover:scale-[1.12] sm:hover:scale-[1.17]
                    hover:z-50
                  "
              >
                {/* POSTER */}
                <div className="w-full h-full rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={
                      movie.thumbnail
                        ? getImgSrc(movie.thumbnail)
                        : movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : ""
                    }
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                {/* RANK NUMBER */}
                <div
                  className="
                    absolute -left-3 bottom-2
                    text-[70px] sm:text-[120px] font-extrabold
                    text-white drop-shadow-[6px_6px_0_rgba(0,0,0,1)]
                    pointer-events-none
                    transition-all duration-300
                    group-hover:scale-110
                  "
                >
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT ARROW */}
          <button
            onClick={() => rowRef.current.scrollBy({ left: 500, behavior: "smooth" })}
            className="
                absolute -right-10 top-1/2 -translate-y-1/2
                h-[50px] w-[30px]
                flex items-center justify-center
                bg-[#2a2a2a]/70 hover:bg-[#3a3a3a]/90
                rounded-md
                shadow-lg
                z-50
              "
          >
            <svg width="12" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M9 4l8 8-8 8z"></path>
            </svg>
          </button>
        </div>
      </section>

      {/* ⭐ NETFLIX POPUP MODAL */}
      {selectedMovie && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedMovie(null)} // ✅ click outside closes
        >
          <div
            className="relative bg-[#0e1525] w-[95%] max-w-5xl rounded-xl overflow-hidden shadow-xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()} // ✅ prevent closing when clicking inside
          >
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute top-3 right-3 text-white text-3xl font-bold z-50"
            >
              ✕
            </button>

            {/* ✅ FULL BANNER */}
            <div className="relative w-full h-[70vh] max-h-[520px] min-h-[320px]">
              <img
                src={
                  selectedMovie.banner
                    ? getImgSrc(selectedMovie.banner)
                    : selectedMovie.backdrop_path
                    ? `https://image.tmdb.org/t/p/original${selectedMovie.backdrop_path}`
                    : selectedMovie.poster_path
                    ? `https://image.tmdb.org/t/p/original${selectedMovie.poster_path}`
                    : ""
                }
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* ✅ dark fade so text is readable */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

              {/* ✅ TEXT + BUTTON ON IMAGE */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                <h1 className="text-2xl sm:text-4xl font-extrabold">{selectedMovie.title}</h1>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  {selectedMovie.year && (
                    <span className="px-2 py-1 bg-black/50 border border-white/15 rounded">
                      {selectedMovie.year}
                    </span>
                  )}

                  {Array.isArray(selectedMovie.genres) &&
                    selectedMovie.genres.slice(0, 4).map((g, i) => (
                      <span key={i} className="px-2 py-1 bg-black/50 border border-white/15 rounded">
                        {g}
                      </span>
                    ))}
                </div>

                {selectedMovie.description && (
                  <p className="mt-3 max-w-3xl text-gray-200 text-sm sm:text-base leading-relaxed line-clamp-3">
                    {selectedMovie.description}
                  </p>
                )}

                <button
                  onClick={() => router.push("/register")}
                  className="mt-5 px-6 py-3 bg-[#2EA8FF] hover:bg-[#4FB5FF] text-white rounded-lg text-base sm:text-lg font-semibold"
                >
                  Нэгдэх →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ REASONS */}
      <section className="bg-[#020617] border-t border-white/10 pt-14 pb-16">
        <div className="max-w-[1300px] mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">{t.moreReasons}</h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ReasonCard title={t.cardTvTitle} text={t.cardTvText} />
            <ReasonCard title={t.cardDownloadTitle} text={t.cardDownloadText} />
            <ReasonCard title={t.cardEverywhereTitle} text={t.cardEverywhereText} />
            <ReasonCard title={t.cardKidsTitle} text={t.cardKidsText} />
          </div>
        </div>
      </section>
      {/* 🔹 LEGAL DISCLAIMER */}
      <footer className="bg-[#020617] border-t border-white/10 py-6">
        <div className="max-w-[1300px] mx-auto px-4 text-[11px] sm:text-xs text-gray-400 leading-relaxed text-center">
          We do not host, upload, store, or distribute any media files. All content is
          provided by third-party services through publicly available embedded players.
          If you believe any content infringes your copyright, please contact the
          original hosting provider.
        </div>
      </footer>
    </div>
  );
}

/** ⭐ REASON CARD */
function ReasonCard({ title, text }) {
  return (
    <div className="bg-[#02091a] border border-white/10 rounded-xl p-5 shadow-lg">
      <h3 className="font-semibold text-[#2EA8FF] mb-2">{title}</h3>
      <p className="text-sm text-gray-200">{text}</p>
    </div>
  );
}
