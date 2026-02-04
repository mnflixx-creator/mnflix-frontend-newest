
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import CineproPlayer from "@/components/CineproPlayer";
import ReportProblemButton from "@/components/ReportProblemButton";

// ⬇️ ADD THIS HELPER HERE
async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export default function MoviePlayerPage(props) {
  const router = useRouter();
  const { lang } = useLanguage();
  const SUBSCRIBE_PATH = "/subscribe";
  const params = useParams();
  const id = params?.id;

  const API = process.env.NEXT_PUBLIC_API_URL;

  const [movie, setMovie] = useState(null);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

  const [activePlayer, setActivePlayer] = useState(1);
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState(0);
  const [resumeData, setResumeData] = useState(null);

  // 🔍 Just for small debug text under player
  const [autoMnStatus, setAutoMnStatus] = useState(""); // "idle" | "working" | "done" | "error"

  const [playerKey, setPlayerKey] = useState(0);

  // 🇲🇳 NEW: manual translation button state
  const [mnTranslateState, setMnTranslateState] = useState("idle"); // "idle" | "working" | "done" | "error"
  const [mnProgress, setMnProgress] = useState(0);

  // For users who don't want Mongolian for this movie
  const [skipMnForThisMovie, setSkipMnForThisMovie] = useState(false);

  const [locked, setLocked] = useState(false); // 🔒 subscription lock
  const [deviceError, setDeviceError] = useState(""); // 📺 second device lock
  const [checkingAccess, setCheckingAccess] = useState(true); // ✅ IMPORTANT

  // ✅ Recommended
  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  // ✅ Treat it as series if it actually has seasons+episodes
  const isSeries = ["series", "tv", "anime", "kdrama", "cdrama"].includes(movie?.type);
  
    // ✅ Does this movie already have Mongolian subtitle?
  const hasMnSubtitle = useMemo(() => {
    if (!movie || !Array.isArray(movie.subtitles)) return false;
    return movie.subtitles.some(
      (sub) =>
        (sub.lang && String(sub.lang).toLowerCase().startsWith("mn")) ||
        (sub.label && /монгол|mongolian/i.test(sub.label)) ||
        (sub.name && /монгол|mongolian/i.test(sub.name))
    );
  }, [movie]);

  // 🔁 Load "skip Mongolian" user preference from localStorage
  useEffect(() => {
    if (!movie?._id || typeof window === "undefined") return;
    const v = localStorage.getItem(`skipMn_${movie._id}`);
    setSkipMnForThisMovie(v === "1");
  }, [movie?._id]);

  const canSeeContent = useMemo(() => {
    if (checkingAccess) return false;
    if (deviceError) return false;
    if (locked && !hasSubscription) return false;
    return true;
  }, [checkingAccess, locked, deviceError, hasSubscription]);

  /* -----------------------------
     ❤️ FAVORITE STATUS
  ----------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API}/api/movies/favorite/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((list) => setIsFavorite(list.some((m) => m._id === id)))
      .catch(() => {});
  }, [id, API]);

  /* -----------------------------
     💾 SAVE PROGRESS (dummy)
  ----------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id || !movie) return;

    fetch(`${API}/api/progress/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        movieId: id,
        season: isSeries ? selectedSeason + 1 : null,
        episode: isSeries ? selectedEpisode + 1 : null,
        currentTime: 10,
        duration: 120,
      }),
    }).catch(() => {});
  }, [id, movie, selectedSeason, selectedEpisode, API, isSeries]);

  /* -----------------------------
     ▶ CONTINUE WATCHING (SERIES)
  ----------------------------- */
  useEffect(() => {
    if (!movie || !isSeries) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API}/api/progress/continue`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((list) => {
        const found = list.find((p) => p.movieId?._id === movie._id);
        if (found) {
          setResumeData(found);
          setSelectedSeason((found.season || 1) - 1);
          setSelectedEpisode((found.episode || 1) - 1);
        }
      })
      .catch(() => {});
  }, [movie, API, isSeries]);

  // 🔁 When user changes season/episode, reset MN translate UI
  useEffect(() => {
    if (!isSeries) return;

    setMnTranslateState("idle");
    setMnProgress(0);
    setAutoMnStatus("");

    // ⭐ Force CineproPlayer to fully remount when ep/season changes
    setPlayerKey((k) => k + 1);
  }, [selectedSeason, selectedEpisode, isSeries]);

  /* -----------------------------
     ❤️ TOGGLE FAVORITE
  ----------------------------- */
  const toggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const url = isFavorite
      ? `${API}/api/movies/favorite/remove`
      : `${API}/api/movies/favorite/add`;

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ movieId: id }),
    }).catch(() => {});

    setIsFavorite(!isFavorite);
  };

  const handleSkipMnForThisMovie = () => {
    if (!movie?._id || typeof window === "undefined") return;
    localStorage.setItem(`skipMn_${movie._id}`, "1");
    setSkipMnForThisMovie(true);
  };

  const handleTranslateToMn = async () => {
    if (!movie || !API) return;
    if (mnTranslateState === "working") return; // avoid double-click spam

    setMnTranslateState("working");
    setMnProgress(5);
    setAutoMnStatus("working");

    let progress = 5;
    let intervalId;

    if (typeof window !== "undefined") {
      intervalId = window.setInterval(() => {
        progress = Math.min(progress + 5, 80); // fake progress up to 80%
        setMnProgress(progress);
      }, 1000);
    }

    try {
      console.log("[AUTO-MN BUTTON] start for title", movie._id, "tmdbId:", movie.tmdbId);

      const isSeriesContent = isSeries;

      if (movie.source === "manual") {
        throw new Error(
          isSeriesContent
            ? "Manual series: please upload subtitles in admin."
            : "Manual movies: please upload subtitles in admin."
        );
      }

      if (!movie.tmdbId) {
        throw new Error("Missing tmdbId for this title.");
      }

      // figure out which ep we are on
      const seasonNumber = isSeriesContent ? (selectedSeason || 0) + 1 : 0;
      const episodeNumber = isSeriesContent ? (selectedEpisode || 0) + 1 : 0;

      // 1) Ask Zentlify for streams/subtitles
      const zUrl = isSeriesContent
        ? `${API}/api/zentlify/series/${movie.tmdbId}?season=${seasonNumber}&episode=${episodeNumber}`
        : `${API}/api/zentlify/movie/${movie.tmdbId}`;

      const zRes = await fetchWithTimeout(zUrl, {}, 25000);
      if (!zRes.ok) {
        console.log("[AUTO-MN BUTTON] Zentlify API error:", zRes.status);
        throw new Error("Provider error");
      }

      const zData = await zRes.json().catch(() => null);

      const streams = Array.isArray(zData?.streams) ? zData.streams : [];
      if (!streams.length) {
        console.log("[AUTO-MN BUTTON] No streams from Zentlify");
        throw new Error("No provider streams");
      }

      // helper: does this server have any English subtitle?
      const serverHasEnglish = (server) => {
        const subsMaybe = Array.isArray(server?.subtitles) ? server.subtitles : [];
        return subsMaybe.some((sub) => {
          const lang = String(
            sub.lang || sub.language || sub.srclang || ""
          ).toLowerCase();
          const label = String(sub.label || sub.name || "").toLowerCase();

          return (
            lang === "en" ||
            lang === "eng" ||
            lang.startsWith("en-") ||
            label.includes("english") ||
            label.includes("eng")
          );
        });
      };

      // 1️⃣ Prefer the server that has English subs (e.g. Nova)
      //    If none, fall back to first stream.
      const chosenServer =
        streams.find((s) => serverHasEnglish(s)) || streams[0];

      const subsRaw = Array.isArray(chosenServer.subtitles)
        ? chosenServer.subtitles
        : [];

      console.log(
        "[AUTO-MN BUTTON] chosen server:",
        chosenServer.name || chosenServer.provider || "unknown"
      );

      console.log(
        "[AUTO-MN BUTTON] provider subtitles:",
        subsRaw.map((s) => ({
          lang: s.lang || s.language || s.srclang,
          label: s.label || s.name,
          url: s.url || s.file || s.src,
        }))
      );

      // 👇 we don't want “signs”, “SDH”, “provider” etc.
      const badKeywords = [
        "forced",
        "sign",
        "signs",
        "songs",
        "sdh",
        "hearing",
        "provider",      // 🚫 skip "English (provider)"
        "commentary"
      ];

      const normalizedSubs = subsRaw.map((s) => {
        const lang = String(
          s.lang || s.language || s.srclang || ""
        ).toLowerCase();
        const label = String(s.label || s.name || "").toLowerCase().trim();

        const isEnglish =
          lang === "en" ||
          lang === "eng" ||
          lang.startsWith("en-") ||
          label.includes("english") ||
          label.includes("eng");

        const hasBadKeyword = badKeywords.some((kw) => label.includes(kw));

        return {
          raw: s,
          lang,
          label,
          isEnglish,
          hasBadKeyword,
        };
      });

      // 1️⃣ BEST: plain "english" or "english [cc]" without bad keywords
      let englishCandidates = normalizedSubs.filter(
        (x) =>
          x.isEnglish &&
          !x.hasBadKeyword &&
          (x.label === "english" || x.label === "english [cc]")
      );

      // 2️⃣ NEXT: any English without bad keywords
      if (!englishCandidates.length) {
        englishCandidates = normalizedSubs.filter(
          (x) => x.isEnglish && !x.hasBadKeyword
        );
      }

      // 3️⃣ LAST RESORT: any English at all
      if (!englishCandidates.length) {
        englishCandidates = normalizedSubs.filter((x) => x.isEnglish);
      }

      let enSub = englishCandidates[0]?.raw || null;

      if (!enSub) {
        enSub =
          subsRaw.find((s) => {
            const lang = String(
              s.lang || s.language || s.srclang || ""
            ).toLowerCase();
            const label = String(s.label || s.name || "").toLowerCase();

            return (
              lang === "en" ||
              lang === "eng" ||
              lang.startsWith("en-") ||
              label.includes("english") ||
              label.includes("eng")
            );
          }) || null;
      }

      if (!enSub && subsRaw.length > 0) {
        enSub = subsRaw[0];
        console.log(
          "[AUTO-MN BUTTON] No explicit EN found, fallback to first subtitle:",
          enSub
        );
      }

      if (!enSub) {
        console.log("[AUTO-MN BUTTON] Still no subtitle track to use");
        throw new Error("No subtitle track found");
      }

      const providerUrl = enSub.file || enSub.url || enSub.src;
      if (!providerUrl) {
        console.log("[AUTO-MN BUTTON] EN track has no url/file/src");
        throw new Error("Subtitle URL missing");
      }

      console.log("[AUTO-MN BUTTON] Using providerUrl (front fetch):", providerUrl);

      // 2) First, browser downloads the subtitle text itself
      const subRes = await fetchWithTimeout(providerUrl, {}, 25000);
      if (!subRes.ok) {
        console.log("[AUTO-MN BUTTON] Failed to download subtitle in browser:", subRes.status);
        throw new Error("Failed to download subtitle in browser");
      }
      const subtitleText = await subRes.text();

      if (!subtitleText || typeof subtitleText !== "string") {
        console.log("[AUTO-MN BUTTON] Empty subtitle text from provider");
        throw new Error("Provider subtitle is empty");
      }

      // 3) Send the raw text to your backend NEW route (from-text)
      const res = await fetchWithTimeout(
        `${API}/api/subtitles/auto-mn-from-text`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            movieId: movie._id,
            subtitleText,
            providerLang: "en",
            seasonNumber,
            episodeNumber,
          }),
        },
        300000 // 5 minutes max for heavy subtitles
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.log("[AUTO-MN BUTTON] /auto-mn-from-text backend error:", data);
        throw new Error(data.message || "Translation failed");
      }

      console.log("[AUTO-MN BUTTON] /auto-mn-from-text success:", data);

      if (data.subtitle) {
        const newSub = data.subtitle;

        setMovie((prev) => {
          if (!prev) return prev;

          const isSeriesContent = isSeries;

          // 🎬 Movies: attach on movie level
          if (!isSeriesContent) {
            return {
              ...prev,
              subtitles: [...(prev.subtitles || []), newSub],
            };
          }

          // 📺 Series: attach only to current episode
          const sIndex = selectedSeason;
          const eIndex = selectedEpisode;
          if (
            !Array.isArray(prev.seasons) ||
            !prev.seasons[sIndex] ||
            !Array.isArray(prev.seasons[sIndex].episodes) ||
            !prev.seasons[sIndex].episodes[eIndex]
          ) {
            return prev;
          }

          const seasons = [...prev.seasons];
          const season = { ...seasons[sIndex] };
          const episodes = [...season.episodes];
          const episode = {
            ...episodes[eIndex],
            subtitles: [...(episodes[eIndex].subtitles || []), newSub],
          };

          episodes[eIndex] = episode;
          season.episodes = episodes;
          seasons[sIndex] = season;

          return {
            ...prev,
            seasons,
          };
        });

        // Force player reload so CC sees new track
        setPlayerKey((k) => k + 1);
      } else if (
        typeof data.message === "string" &&
        data.message.toLowerCase().includes("already exists")
      ) {
        // MN already exists → refresh movie/series one time
        try {
          const freshRes = await fetch(`${API}/api/movies/${movie._id}`);
          if (freshRes.ok) {
            const freshMovie = await freshRes.json().catch(() => null);
            if (freshMovie) {
              setMovie(freshMovie);
              setPlayerKey((k) => k + 1);
            }
          }
        } catch (e) {
          console.log("[AUTO-MN BUTTON] refresh movie failed:", e);
        }
      }

      setMnProgress(100);
      setMnTranslateState("done");
      setAutoMnStatus("done");
    } catch (err) {
      console.error("[AUTO-MN BUTTON] error:", err);

      if (err.name === "AbortError") {
        // ⏱️ This means our 180s timeout fired
        setMnTranslateState("error");
        setAutoMnStatus("error");

        if (typeof window !== "undefined") {
          alert(
            "Энэ киноны хадмал орчуулга удаан байна. Провайдер сервер хариу өгөхгүй эсвэл маш удаан байна. Дараа дахин оролдоод үзнэ үү."
          );
        }
      } else {
        setMnTranslateState("error");
        setAutoMnStatus("error");
      }
    } finally {
      if (intervalId) window.clearInterval(intervalId);
    }
  };

/* -----------------------------
 🎬 LOAD MOVIE DATA (light + fast)
----------------------------- */
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return router.push("/login");
  if (!id || !API) return;

  // reset state when switching movies
  setLoadingMovie(true);
  setMovie(null);
  setSelectedSeason(0);
  setSelectedEpisode(0);

  // 🔁 reset MN translation state
  setAutoMnStatus("");
  setMnTranslateState("idle");
  setMnProgress(0);

  const headers = { Authorization: `Bearer ${token}` };

  (async () => {
    try {
      const movieRes = await fetch(`${API}/api/movies/${id}`, { headers });

      if (!movieRes.ok) {
        console.log("Movie API error:", movieRes.status);
        setMovie(null);
        return;
      }

      const movieData = await movieRes.json().catch(() => null);
      if (!movieData || movieData.message) {
        console.log("Movie API bad data:", movieData?.message);
        setMovie(null);
        return;
      }

      setMovie(movieData);
    } catch (err) {
      console.error("Movie load error:", err);
      setMovie(null);
    } finally {
      setLoadingMovie(false);
    }
  })();
}, [id, router, API]);

/* -----------------------------
 ⭐ LOAD RECOMMENDED (separate, does NOT block page)
----------------------------- */
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;
  if (!API) return;

  setRecLoading(true);
  setRecommended([]);

  const headers = { Authorization: `Bearer ${token}` };

  (async () => {
    try {
      // Use your dedicated recommended endpoint
      const res = await fetch(`${API}/api/movies/recommended`, { headers });

      if (!res.ok) {
        console.log("Recommended API error:", res.status);
        setRecommended([]);
        return;
      }

      const data = await res.json().catch(() => []);
      setRecommended(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Recommended load error:", err);
      setRecommended([]);
    } finally {
      setRecLoading(false);
    }
  })();
}, [API]);

    /* -----------------------------
     👤 LOAD USER & SUBSCRIPTION STATUS
  ----------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const u = data.user || data;

        // Try boolean style flags first
        const flag =
          u?.subscriptionActive ??
          u?.isSubscribed ??
          u?.isPremium ??
          false;

        // Then try expiry date fields
        const expiresRaw =
          u?.subscription?.expiresAt ||
          u?.planExpiresAt ||
          u?.membershipExpiresAt ||
          u?.expiresAt;

        let active = !!flag;
        if (!active && expiresRaw) {
          const expiresAt = new Date(expiresRaw);
          if (!Number.isNaN(expiresAt.getTime())) {
            active = expiresAt.getTime() > Date.now();
          }
        }

        setHasSubscription(active);
      })
      .catch(() => {
        // ignore – fall back to stream check
      });
  }, [API]);

  /* -----------------------------
     🔐 SUBSCRIPTION + DEVICE CHECK (WITH 1 RETRY)
  ----------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;

    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", deviceId);
    }

    let cancelled = false;

    const checkStreamAccess = async () => {
      setCheckingAccess(true);
      setDeviceError("");
      setLocked(false);
      setSubscriptionError("");

      const doRequest = async () => {
        const seasonNumber = isSeries ? selectedSeason + 1 : 0;
        const episodeNumber = isSeries ? selectedEpisode + 1 : 0;

        const qs = isSeries ? `?season=${seasonNumber}&episode=${episodeNumber}` : "";

        const res = await fetch(`${API}/api/movies/${id}/stream${qs}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-device-id": deviceId,
          },
        });

        if (res.status === 403) {
          const data = await res.json().catch(() => ({}));
          return { ok: false, status: 403, data };
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return { ok: false, status: res.status, data };
        }

        const data = await res.json().catch(() => ({}));
        return { ok: true, status: res.status, data };
      };

      let result = await doRequest();

      if (!result.ok && result.status === 403) {
        await new Promise((r) => setTimeout(r, 800));
        result = await doRequest();
      }

      if (cancelled) return;

            if (!result.ok && result.status === 403) {
              const msg = (result.data?.message || "").toString();
              const code = (result.data?.code || "").toString();

              const lower = msg.toLowerCase();

              const isDeviceLimit =
                code === "DEVICE_LIMIT" ||
                lower.includes("device") ||
                lower.includes("another device") ||
                msg.includes("өөр төхөөрөмж") ||
                msg.includes("зэрэг хоёр төхөөрөмж") ||
                msg.includes("нэг аккаунтаар зэрэг хоёр төхөөрөмж");

              // 🚫 SUBSCRIPTION truly inactive?
              const isSubInactive =
                code === "SUBSCRIPTION_INACTIVE" ||
                lower.includes("subscription") ||
                msg.includes("гишүүнчлэл");

              if (isDeviceLimit) {
                // ✅ Second device
                setDeviceError(
                  lang === "mn"
                    ? msg || "Нэг аккаунтаар нэг төхөөрөмж зэрэг үзэх боломжтой."
                    : msg ||
                      "Another device is currently streaming. MNFlix allows only one device at a time."
                );
                setLocked(false);
                setSubscriptionError("");
              } else if (!hasSubscription && isSubInactive) {
                // 🔒 Only show lock if we KNOW user is not subscribed
                setDeviceError("");
                setLocked(true);
                setSubscriptionError(
                  msg ||
                    (lang === "mn"
                      ? "Гишүүнчлэл идэвхгүй байна."
                      : "Your subscription is inactive. Please subscribe.")
                );
              } else {
                // 😕 Subscribed but still 403 → treat as generic player error, not paywall
                setDeviceError("");
                setLocked(false);
                setSubscriptionError(
                  lang === "mn"
                    ? "Кино тоглуулах үед алдаа гарлаа. Дахин оролдоно уу."
                    : "We couldn’t start the stream. Please refresh and try again."
                );
              }
            } else {
        setLocked(false);
        setDeviceError("");
        setSubscriptionError("");
      }

      setCheckingAccess(false);
    };

    checkStreamAccess();

    return () => {
      cancelled = true;
    };
  }, [id, lang, API, hasSubscription, isSeries, selectedSeason, selectedEpisode]);

    /* -----------------------------
      🔁 LIVE DEVICE CHECK (forced logout when removed or kicked)
    ----------------------------- */
    useEffect(() => {
      const token = localStorage.getItem("token");
      const deviceId = localStorage.getItem("deviceId");

      if (!token || !id || !deviceId) return;
      if (!hasSubscription) return;    // 🔴 NEW: don't run device check when not subscribed
      if (deviceError) return;         // already blocked

      if (!token || !id || !deviceId) return;
      if (deviceError) return; // already blocked

      let cancelled = false;

      const checkStatus = async () => {
        try {
          const seasonNumber = isSeries ? selectedSeason + 1 : 0;
          const episodeNumber = isSeries ? selectedEpisode + 1 : 0;
          const qs = isSeries ? `?season=${seasonNumber}&episode=${episodeNumber}` : "";

          const res = await fetch(`${API}/api/movies/${id}/stream/status${qs}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-device-id": deviceId,
            },
          });

          if (res.status === 403) {
            const data = await res.json().catch(() => ({}));
            if (cancelled) return;

            const msg = (data.message || "").toString();
            const code = (data.code || "").toString();

            // 🔒 Show nice Mongolian message
            if (code === "DEVICE_LIMIT") {
              setDeviceError(
                msg ||
                  "MNFLIX нэг аккаунтаар нэгээс дээш төхөөрөмжөөр зэрэг нэгэн цагт үзэх боломжгүй. Өөр төхөөрөмж үзэж эхэлсэн тул энэ төхөөрөмж дээрх үзэх эрхийг автоматаар идэвхгүй болголоо."
              );
            } else if (code === "DEVICE_REMOVED") {
              setDeviceError(
                msg ||
                  "Энэ төхөөрөмжийг идэвхтэй төхөөрөмжүүдийн жагсаалтаас өөр төхөөмжөөс устгасан тул дахин нэвтэрч үзнэ үү."
              );
            } else {
              setDeviceError(
                "Үзэх эрх хүчингүй боллоо. MNFLIX нэг аккаунтаар нэгээс дээш төхөөрөмж зэрэг үзэх боломжгүй."
              );
            }

            setLocked(false);       // not a paywall
            setCheckingAccess(false);
          }
        } catch (e) {
          // ignore network errors here
        }
      };

      // check immediately and then every 8 seconds
      checkStatus();
      const intervalId = setInterval(checkStatus, 8000);

      return () => {
        cancelled = true;
        clearInterval(intervalId);
      };
    }, [id, API, deviceError, hasSubscription, isSeries, selectedSeason, selectedEpisode]);

      /* -----------------------------
        👋 CLEAR STREAM WHEN LEAVING MOVIE PAGE (RELIABLE)
      ----------------------------- */
      useEffect(() => {
        if (!id) return;

        const token = localStorage.getItem("token");
        let deviceId = localStorage.getItem("deviceId");
        if (!deviceId) {
          deviceId = crypto.randomUUID();
          localStorage.setItem("deviceId", deviceId);
        }

        const stopStream = () => {
          if (!token || !deviceId) return;

          // ✅ keepalive makes the request still send even when tab is closing
          fetch(`${API}/api/movies/${id}/stream/stop`, {
            method: "POST",
            keepalive: true,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "x-device-id": deviceId,
            },
            body: JSON.stringify({}),
          }).catch(() => {});
        };

        // ✅ fires on close/refresh on many browsers
        window.addEventListener("beforeunload", stopStream);
        // ✅ best for mobile Safari + modern browsers
        window.addEventListener("pagehide", stopStream);
        // ✅ when tab goes background (phone users)
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "hidden") stopStream();
        });

        // cleanup on route change/unmount
        return () => {
          stopStream();
          window.removeEventListener("beforeunload", stopStream);
          window.removeEventListener("pagehide", stopStream);
        };
      }, [id, API]);

    const posterSrc = (m) => {
      if (!m?.thumbnail) return "";
      return m.thumbnail.startsWith("http") ? m.thumbnail : `${API}${m.thumbnail}`;
    };
    // Use Zentlify for any TMDB-based title (movie OR series),
    // unless we explicitly marked it as "manual"
    const isZentlifyTitle =
      movie?.tmdbId &&
      movie?.source !== "manual";
        
    // 🆕 Anime title to send to Neko provider (for better matching)
    const animeTitle =
      movie?.type === "anime"
        ? movie?.title || movie?.originalTitle || ""
        : "";

    // 🔹 helper: do we have proper series data?
    const hasSeriesNavigation =
      movie &&
      isSeries &&
      Array.isArray(movie.seasons) &&
      movie.seasons.length > 0 &&
      Array.isArray(movie.seasons[selectedSeason]?.episodes) &&
      movie.seasons[selectedSeason].episodes.length > 0;

    // 🔹 can go to next / previous episode?
    const canGoNextEpisode = (() => {
      if (!hasSeriesNavigation) return false;
      const seasons = movie.seasons;
      const sIndex = selectedSeason;
      const eIndex = selectedEpisode;
      const currentSeason = seasons[sIndex];
      if (!currentSeason) return false;

      // next inside same season
      if (eIndex + 1 < currentSeason.episodes.length) return true;

      // look for any later season with episodes
      for (let i = sIndex + 1; i < seasons.length; i++) {
        if (Array.isArray(seasons[i]?.episodes) && seasons[i].episodes.length > 0) {
          return true;
        }
      }
      return false;
    })();

    const canGoPrevEpisode = (() => {
      if (!hasSeriesNavigation) return false;
      const seasons = movie.seasons;
      const sIndex = selectedSeason;
      const eIndex = selectedEpisode;

      // previous inside same season
      if (eIndex > 0) return true;

      // look for any previous season with episodes
      for (let i = sIndex - 1; i >= 0; i--) {
        if (Array.isArray(seasons[i]?.episodes) && seasons[i].episodes.length > 0) {
          return true;
        }
      }
      return false;
    })();

    // ▶ go to next episode (handles next season)
    const goToNextEpisode = () => {
      if (!hasSeriesNavigation) return;

      const seasons = movie.seasons;
      let sIndex = selectedSeason;
      let eIndex = selectedEpisode;
      const currentSeason = seasons[sIndex];
      if (!currentSeason) return;

      // 1) next inside same season
      if (eIndex + 1 < currentSeason.episodes.length) {
        setSelectedEpisode(eIndex + 1);
        return;
      }

      // 2) go to first episode of next season that has episodes
      for (let i = sIndex + 1; i < seasons.length; i++) {
        const s = seasons[i];
        if (Array.isArray(s?.episodes) && s.episodes.length > 0) {
          setSelectedSeason(i);
          setSelectedEpisode(0);
          return;
        }
      }
      // no more episodes → do nothing
    };

    // ◀ go to previous episode (handles previous season)
    const goToPrevEpisode = () => {
      if (!hasSeriesNavigation) return;

      const seasons = movie.seasons;
      let sIndex = selectedSeason;
      let eIndex = selectedEpisode;
      const currentSeason = seasons[sIndex];
      if (!currentSeason) return;

      // 1) previous inside same season
      if (eIndex > 0) {
        setSelectedEpisode(eIndex - 1);
        return;
      }

      // 2) go to last episode of previous season that has episodes
      for (let i = sIndex - 1; i >= 0; i--) {
        const s = seasons[i];
        if (Array.isArray(s?.episodes) && s.episodes.length > 0) {
          setSelectedSeason(i);
          setSelectedEpisode(s.episodes.length - 1);
          return;
        }
      }
      // already at very first episode → do nothing
    };
      // 🔹 SUBTITLE SELECTION (movie-level + per-episode)
    const movieSubs = Array.isArray(movie?.subtitles) ? movie.subtitles : [];

    // current season / episode (0-based indexes)
    const currentSeason =
      isSeries &&
      Array.isArray(movie.seasons) &&
      movie.seasons[selectedSeason]
        ? movie.seasons[selectedSeason]
        : null;

    const currentEpisode =
      currentSeason &&
      Array.isArray(currentSeason.episodes) &&
      currentSeason.episodes[selectedEpisode]
        ? currentSeason.episodes[selectedEpisode]
        : null;

    const episodeSubs = Array.isArray(currentEpisode?.subtitles)
      ? currentEpisode.subtitles
      : [];

    // ✅ Does the CURRENT EPISODE already have Mongolian?
    const hasMnForCurrentEpisode =
      isSeries &&
      currentEpisode &&
      Array.isArray(currentEpisode.subtitles) &&
      currentEpisode.subtitles.some((sub) => {
        const lang = String(sub.lang || "").toLowerCase();
        const label = String(sub.label || sub.name || "").toLowerCase();
        return (
          lang.startsWith("mn") ||
          label.includes("mongolian") ||
          label.includes("монгол")
        );
      });
    const canShowMnTranslate =
      !checkingAccess &&
      !locked &&
      !deviceError &&
      (
        (movie?.type === "movie" && !hasMnSubtitle) ||
        (isSeries && !hasMnForCurrentEpisode)
      ) &&
      !skipMnForThisMovie;

    // ✅ FINAL subtitles:
    // - if episode has its own subtitles → use them
    // - also add movie-level subs that don't duplicate by lang
    const effectiveSubtitles =
      episodeSubs.length > 0
        ? [
            ...episodeSubs,
            ...movieSubs.filter(
              (ms) => !episodeSubs.some((es) => es.lang === ms.lang)
            ),
          ]
        : movieSubs;
    // ✅ Only show English + Mongolian in the player CC menu
    const visibleSubtitles = (effectiveSubtitles || []).filter((sub) => {
      const lang = String(sub.lang || "").toLowerCase();
      const label = String(sub.label || sub.name || "").toLowerCase();

      const isEnglish =
        lang === "en" ||
        lang === "eng" ||
        lang.startsWith("en-") ||
        label.includes("english") ||
        label.includes("eng");

      const isMongolian =
        lang === "mn" ||
        label.includes("mongolian") ||
        label.includes("монгол");

      return isEnglish || isMongolian;
    });

    // 🔹 stream from backend proxy (player1/2/3 → /api/movies/:id/stream/1.m3u8 etc)
    // ❗ For Zentlify TMDB movies, ignore movie.streams so we let CineproPlayer call Zentlify
    const streams =
      !isZentlifyTitle && Array.isArray(movie?.streams) ? movie.streams : [];

    const currentStream =
      streams.find((s) => s.id === activePlayer)?.url || streams[0]?.url || null;

  if (loadingMovie) return <p className="text-white mt-20 px-6">Loading…</p>;
  if (!movie) return <p className="text-white mt-20 px-6">Movie not found.</p>;

  return (
    <div className="bg-black text-white min-h-screen">
      {/* BANNER SECTION (MOBILE IMPROVED) */}
      <div className="relative w-full h-[52vh] sm:h-[60vh] md:h-[70vh] overflow-hidden">
        {movie.banner && (
          <img
            src={movie.banner.startsWith("http") ? movie.banner : `${API}${movie.banner}`}
            className="w-full h-full object-cover"
            alt="banner"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* BANNER CONTENT */}
        <div className="absolute bottom-5 left-4 right-4 sm:bottom-8 sm:left-6 md:left-12 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold drop-shadow-lg leading-tight">
            {movie.title}
          </h1>

          <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-gray-200/90 drop-shadow-lg line-clamp-4">
            {movie.description}
          </p>

          <div className="mt-3 sm:mt-4 text-gray-300 text-xs sm:text-sm md:text-base space-y-1">
            <p>
              <strong>Year:</strong> {movie.year || "N/A"}
            </p>
            <p>
              <strong>Genres:</strong> {movie.genres?.join(", ") || "N/A"}
            </p>
            <p>
              <strong>Kids:</strong> {movie.kidsOnly ? "Yes" : "No"}
            </p>
          </div>

          {/* BUTTONS (STACK ON MOBILE) */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
            <button
              onClick={() =>
                document.getElementById("moviePlayer")?.scrollIntoView({ behavior: "smooth" })
              }
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black font-semibold px-5 sm:px-6 py-3 rounded-md hover:bg-gray-200 transition text-base sm:text-lg"
            >
              ▶ Үзэх
            </button>

            <button
              onClick={toggleFavorite}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-700/80 px-5 sm:px-6 py-3 rounded-md hover:bg-gray-600 transition"
            >
              {isFavorite ? "✔ Жагсаалтанд нэмэгдлээ" : "+ Жагсаалтанд нэмэх"}
            </button>
          </div>
        </div>
      </div>

      {/* PLAYER SECTION */}
      <div id="moviePlayer" className="relative px-4 sm:px-6 md:px-12 mt-8 md:mt-12 pb-16">
        {checkingAccess && (
          <p className="text-gray-300 mb-3 text-sm sm:text-base">
            {lang === "mn" ? "Шалгаж байна..." : "Checking access..."}
          </p>
        )}

        {!checkingAccess && !locked && !deviceError && (
          <p className="text-gray-300 mb-3 text-sm sm:text-base">
            Хэрвээ кино тоглохгүй удвал Server сольж аль эсвэл Refresh хийж дахин оролдоно уу, 
          </p>
        )}

        {/* CC info card */}
        {!checkingAccess && !locked && !deviceError && (
          <div className="mb-4 rounded-2xl border border-white/10 bg-black/40 p-4">
            <div className="font-extrabold text-sm">
              {lang === "mn" ? "🇲🇳 Монгол хадмал" : "🇬🇧 Subtitles"}
            </div>

            <div className="text-white/70 text-sm mt-1">
              {lang === "mn" ? (
                <>
                  Видео тоглуулагч дээрх <span className="font-bold">CC</span> товчийг дарж
                  <span className="font-bold"> Mongolian</span> хадмалыг сонгоно уу.
                </>
              ) : (
                <>
                  Click the <span className="font-bold">CC</span> button on the player and select{" "}
                  <span className="font-bold">Mongolian</span> subtitles.
                </>
              )}
            </div>
          </div>
        )}
                {/* SERIES CONTROLS – PRETTY DROPDOWNS + NEXT/PREV */}
                {isSeries && movie.seasons?.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      {/* Season selector */}
                      <div className="flex items-center gap-3 w-full md:max-w-sm">
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/15 text-[11px] font-semibold text-white/80">
                          S
                        </div>
                        <div className="flex-1">
                          <div className="text-[11px] uppercase tracking-wide text-white/45 mb-1">
                            {lang === "mn" ? "Улирал сонгох" : "Choose season"}
                          </div>
                          <div className="relative">
                            <select
                              value={selectedSeason}
                              onChange={(e) => {
                                const idx = Number(e.target.value);
                                setSelectedSeason(idx);
                                setSelectedEpisode(0);
                              }}
                              className="w-full appearance-none bg-white/5 border border-white/15 rounded-full px-4 pr-9 py-2 text-sm sm:text-base text-white shadow-sm backdrop-blur
                                        focus:outline-none focus:ring-2 focus:ring-[#2EA8FF] focus:border-transparent
                                        hover:bg-white/10 transition"
                            >
                              {movie.seasons.map((s, i) => (
                                <option key={s.seasonNumber ?? i} value={i} className="bg-black">
                                  {lang === "mn"
                                    ? `Улирал ${s.seasonNumber || i + 1}`
                                    : `Season ${s.seasonNumber || i + 1}`}
                                </option>
                              ))}
                            </select>
                            {/* custom arrow */}
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs">
                              ▼
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Episode selector */}
                      <div className="flex items-center gap-3 w-full md:max-w-sm">
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/15 text-[11px] font-semibold text-white/80">
                          Ep
                        </div>
                        <div className="flex-1">
                          <div className="text-[11px] uppercase tracking-wide text-white/45 mb-1">
                            {lang === "mn" ? "Анги сонгох" : "Choose episode"}
                          </div>
                          <div className="relative">
                            <select
                              value={selectedEpisode}
                              onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                              className="w-full appearance-none bg-white/5 border border-white/15 rounded-full px-4 pr-9 py-2 text-sm sm:text-base text-white shadow-sm backdrop-blur
                                        focus:outline-none focus:ring-2 focus:ring-[#2EA8FF] focus:border-transparent
                                        hover:bg-white/10 transition"
                            >
                              {(movie.seasons[selectedSeason]?.episodes || []).map((ep, i) => (
                                <option key={ep.episodeNumber ?? i} value={i} className="bg-black">
                                  {lang === "mn"
                                    ? `Анги ${ep.episodeNumber || i + 1}`
                                    : `Episode ${ep.episodeNumber || i + 1}`}
                                </option>
                              ))}
                            </select>
                            {/* custom arrow */}
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs">
                              ▼
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ▶◀ Next / Previous buttons */}
                    {hasSeriesNavigation && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={goToPrevEpisode}
                          disabled={!canGoPrevEpisode}
                          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition
                            ${
                              canGoPrevEpisode
                                ? "bg-white/10 hover:bg-white/20 border border-white/20"
                                : "bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
                            }`}
                        >
                          ←{" "}
                          {lang === "mn" ? "Өмнөх анги" : "Previous episode"}
                        </button>

                        <button
                          type="button"
                          onClick={goToNextEpisode}
                          disabled={!canGoNextEpisode}
                          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition
                            ${
                              canGoNextEpisode
                                ? "bg-[#2EA8FF] hover:bg-[#4FB5FF] text-black"
                                : "bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
                            }`}
                        >
                          {lang === "mn" ? "Дараагийн анги" : "Next episode"} →
                        </button>
                      </div>
                    )}
                  </div>
                )}

        {/* PLAYER BUTTONS (only 1 for now) */}
        {movie.type === "movie" && (
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setActivePlayer(1)}
              className={`px-4 py-2 rounded-md text-sm md:text-base transition ${
                activePlayer === 1 ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              Player 1
            </button>
          </div>
        )}

        {/* ✅ SECOND DEVICE CARD */}
        {!checkingAccess && deviceError && (
          <div className="rounded-2xl border border-white/10 bg-black/50 p-5 text-center shadow-2xl">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/10">
              📺
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold mb-2">
              {lang === "mn" ? "Нэг аккаунтаар нэг төхөөрөмж" : "One device at a time"}
            </h2>

            <p className="text-white/70 text-sm sm:text-base mb-4">{deviceError}</p>

            <button
              onClick={() => router.push("/account/devices")}
              className="w-full sm:w-auto px-6 py-3 bg-[#2EA8FF] rounded-xl font-extrabold hover:bg-[#4FB5FF] transition"
            >
              {lang === "mn" ? "Идэвхтэй төхөөрөмжүүдийг харах" : "View active devices"}
            </button>
          </div>
        )}

        {/* ✅ SUBSCRIPTION LOCK CARD */}
        {!checkingAccess && locked && !deviceError && !hasSubscription && (
          <div className="flex justify-center">
            <div className="w-full max-w-[520px] sm:max-w-[620px] md:max-w-[760px] lg:max-w-[820px] rounded-2xl border border-white/10 bg-black/55 p-5 sm:p-6 text-center shadow-2xl">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/10">
                🔒
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold">
                {lang === "mn" ? "Кино түгжигдсэн" : "Content locked"}
              </h2>

              <p className="mt-2 text-white/70 text-sm sm:text-base">
                {lang === "mn"
                  ? "Гишүүн болсноор бүх кино, цувралыг хязгааргүй үзэх боломжтой."
                  : "Subscribe to unlock all movies and series without limits."}
              </p>

              <div className="mt-4 grid gap-2 text-left text-sm text-white/75">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  ✅ {lang === "mn" ? "Хамгийн чанартай" : "HD playback"}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  ✅{" "}
                  {lang === "mn"
                    ? "Шинэ шилдэг кино контент тогтмол нэмэгдэнэ"
                    : "New content added regularly"}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  ✅ {lang === "mn" ? "Монгол орчуулгатай" : "Mongolian subtitles (via CC)"}
                </div>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push("/subscribe")}
                  className="w-full px-6 py-3 bg-[#2EA8FF] rounded-xl font-extrabold hover:bg-[#4FB5FF] transition"
                >
                  {lang === "mn" ? "Гишүүнчлэл авах" : "Subscribe now"}
                </button>

                <button
                  onClick={() => router.push("/home")}
                  className="w-full px-6 py-3 bg-white/10 rounded-xl font-bold hover:bg-white/15 border border-white/10 transition"
                >
                  {lang === "mn" ? "Нүүр хуудас" : "Home"}
                </button>
              </div>
            </div>
          </div>
        )}

          {/* 🇲🇳 Translate bar – desktop, ABOVE player */}
              {canShowMnTranslate && (
                <div className="hidden md:block w-full md:w-[70%] max-w-[1280px] mx-auto mb-4 rounded-2xl border border-[#2EA8FF]/40 bg-black/50 p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-sm font-extrabold">
                        Та энэ киног хамгийн түрүүнд үзэж байна 🇲🇳
                      </div>
                      <div className="text-xs sm:text-sm text-white/70 mt-1">
                        Монгол хадмал одоогоор байхгүй байна. Доорх{" "}
                        <span className="font-bold">“Монгол орчуулга хийх”</span> товчийг дарснаар
                        Монгол хадмалыг автоматаар нэмнэ.
                      </div>
                    </div>

                    {/* same button & states as before */}
                    {mnTranslateState === "idle" && (
                      <div className="flex flex-row gap-2 items-center mt-3 md:mt-0">
                        <button
                          type="button"
                          onClick={handleTranslateToMn}
                          disabled={loadingMovie || checkingAccess}
                          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold
                            ${
                              loadingMovie || checkingAccess
                                ? "bg-[#2EA8FF]/40 text-black/60 cursor-not-allowed"
                                : "bg-[#2EA8FF] hover:bg-[#4FB5FF] text-black"
                            }`}
                        >
                          Монгол орчуулга хийх
                        </button>

                        <button
                          type="button"
                          onClick={handleSkipMnForThisMovie}
                          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs sm:text-sm text-white/80 border border-white/15"
                        >
                          Зөвхөн англи хадмалаар үзэх
                        </button>
                      </div>
                    )}

                    {mnTranslateState === "working" && (
                      <div className="w-full sm:w-64 mt-3 md:mt-0">
                        <div className="flex justify-between text-[11px] text-white/60 mb-1">
                          <span>Орчуулж байна…</span>
                          <span>{mnProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2EA8FF] transition-[width] duration-400"
                            style={{ width: `${mnProgress}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-white/50 mt-1">
                          Ихэвчлэн 5-10 секундийн дотор бэлэн болно.
                        </div>
                      </div>
                    )}

                    {mnTranslateState === "done" && (
                      <div className="w-full sm:w-64 mt-3 md:mt-0 text-xs text-green-400">
                        Орчуулга амжилттай дууслаа. CC цэсэн дотор{" "}
                        <span className="font-bold">Mongolian</span> хадмал гарч ирсэн.
                        Хэрэв харагдахгүй байвал хуудсыг дахин ачааллана уу.
                      </div>
                    )}

                    {mnTranslateState === "error" && (
                      <div className="w-full sm:w-64 mt-3 md:mt-0 text-xs text-red-400">
                        Орчуулга хийх үед алдаа гарлаа. Дахин оролдохын тулд{" "}
                        <button
                          type="button"
                          onClick={handleTranslateToMn}
                          className="underline font-semibold"
                        >
                          энд дарна уу
                        </button>
                        .
                      </div>
                    )}
                  </div>
                </div>
              )}

        {/* ✅ PLAYER (centered, 70% width on desktop) */}
        {!checkingAccess && !locked && !deviceError && (
          <div className="w-full flex justify-center mt-4">
            <div className="w-full md:w-[70%] max-w-[1280px] bg-black rounded-2xl border border-white/10 overflow-hidden relative">

              {(loadingMovie || checkingAccess) && (
                <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center pointer-events-auto">
                  <div className="text-center">
                    <div className="text-sm sm:text-base font-semibold text-white/90">
                      Кино ачаалж байна…
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      Түр хүлээнэ үү. Тоглуулагч бүрэн ачаалтал товчлуурууд идэвхгүй байна.
                    </div>
                  </div>
                </div>
              )}

              <div className={loadingMovie ? "pointer-events-none select-none" : ""}>
                {isZentlifyTitle ? (
                  // 🟦 All TMDB titles (movie + series) use Zentlify (Zen/Sonata/Breeze/Nova/Lush/Flow)
                  <CineproPlayer
                    key={`${movie._id || movie.tmdbId}-${isSeries ? "tv" : "movie"}-s${
                      isSeries ? selectedSeason + 1 : 1
                    }-e${isSeries ? selectedEpisode + 1 : 1}-k${playerKey}`}
                    tmdbId={String(movie.tmdbId)}
                    type={movie?.type || "movie"}
                    movieType={movie?.type || "movie"}
                    season={isSeries ? selectedSeason + 1 : 1}
                    episode={isSeries ? selectedEpisode + 1 : 1}
                    subtitles={visibleSubtitles}
                    title={
                      movie?.type === "anime"
                        ? movie?.title || movie?.originalTitle || ""
                        : movie?.originalTitle || movie?.title || ""
                    }
                    animeTitle={animeTitle}
                  />
                ) : currentStream ? (
                  // 🟧 Old/manual provider from DB (no Zentlify)
                  <CineproPlayer
                    key={`${movie._id || movie.tmdbId}-${isSeries ? "tv" : "movie"}-s${
                      isSeries ? selectedSeason + 1 : 1
                    }-e${isSeries ? selectedEpisode + 1 : 1}-k${playerKey}`}
                    src={currentStream}
                    tmdbId={movie.tmdbId ? String(movie.tmdbId) : ""}
                    type={movie?.type || "movie"}
                    movieType={movie?.type || "movie"}
                    season={isSeries ? selectedSeason + 1 : 1}
                    episode={isSeries ? selectedEpisode + 1 : 1}
                    subtitles={visibleSubtitles}
                    title={
                      movie?.type === "anime"
                        ? movie?.title || movie?.originalTitle || ""
                        : movie?.originalTitle || movie?.title || ""
                    }
                    animeTitle={animeTitle}
                  />
                ) : !movie?.tmdbId ? (
                  <div className="p-6 text-gray-400 text-sm">
                    This movie has no <b>stream</b> or <b>tmdbId</b>. Add one in admin.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* 🇲🇳 MANUAL TRANSLATE BAR – mobile only (under player) */}
        {canShowMnTranslate && (
          <div className="mb-4 rounded-2xl border border-[#2EA8FF]/40 bg-black/50 p-4 md:hidden">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-sm font-extrabold">
                    Та энэ киног хамгийн түрүүнд үзэж байна 🇲🇳
                  </div>
                  <div className="text-xs sm:text-sm text-white/70 mt-1">
                    Монгол хадмал одоогоор байхгүй байна. Доорх{" "}
                    <span className="font-bold">“Монгол орчуулга хийх”</span> товчийг дарснаар
                    Монгол хадмалыг автоматаар нэмнэ.
                  </div>
                </div>

                {/* idle → show buttons */}
                {mnTranslateState === "idle" && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center mt-3 sm:mt-0">
                    <button
                      type="button"
                      onClick={handleTranslateToMn}
                      disabled={loadingMovie || checkingAccess}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold
                        ${
                          loadingMovie || checkingAccess
                            ? "bg-[#2EA8FF]/40 text-black/60 cursor-not-allowed"
                            : "bg-[#2EA8FF] hover:bg-[#4FB5FF] text-black"
                        }`}
                    >
                      Монгол орчуулга хийх
                    </button>

                    <button
                      type="button"
                      onClick={handleSkipMnForThisMovie}
                      className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs sm:text-sm text-white/80 border border-white/15"
                    >
                      Зөвхөн англи хадмалаар үзэх
                    </button>
                  </div>
                )}

                {/* working → show progress */}
                {mnTranslateState === "working" && (
                  <div className="w-full sm:w-64 mt-3 sm:mt-0">
                    <div className="flex justify-between text-[11px] text-white/60 mb-1">
                      <span>Орчуулж байна…</span>
                      <span>{mnProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2EA8FF] transition-[width] duration-400"
                        style={{ width: `${mnProgress}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-white/50 mt-1">
                      Ихэвчлэн 5-10 секундийн дотор бэлэн болно.
                    </div>
                  </div>
                )}

                {/* done */}
                {mnTranslateState === "done" && (
                  <div className="w-full sm:w-64 mt-3 sm:mt-0 text-xs text-green-400">
                    Орчуулга амжилттай дууслаа. CC цэсэн дотор{" "}
                    <span className="font-bold">Mongolian</span> хадмал гарч ирсэн.
                    Хэрэв харагдахгүй байвал хуудсыг дахин ачааллана уу.
                  </div>
                )}

                {/* error */}
                {mnTranslateState === "error" && (
                  <div className="w-full sm:w-64 mt-3 sm:mt-0 text-xs text-red-400">
                    Орчуулга хийх үед алдаа гарлаа. Дахин оролдохын тулд{" "}
                    <button
                      type="button"
                      onClick={handleTranslateToMn}
                      className="underline font-semibold"
                    >
                      энд дарна уу
                    </button>
                    .
                  </div>
                )}
              </div>
            </div>
          )}
        {/* ✅ REPORT PROBLEM BUTTON BELOW PLAYER */}
        {!checkingAccess && !locked && !deviceError && (
          <div className="w-full flex justify-center mt-3">
            <div className="w-full md:w-[70%] max-w-[1280px] flex justify-end">
              <ReportProblemButton
                movieId={movie._id}
                movieTitle={movie.title}
              />
            </div>
          </div>
        )}

        {/* ✅ RECOMMENDED (SUBSCRIBED ONLY) */}
        {!checkingAccess && !locked && !deviceError && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-extrabold">
                {lang === "mn" ? "Санал болгох" : "Recommended for you"}
              </h3>
              {recLoading && (
                <div className="text-xs text-gray-400">
                  {lang === "mn" ? "Ачаалж байна..." : "Loading..."}
                </div>
              )}
            </div>

            {!recLoading && recommended.length === 0 ? (
              <div className="text-gray-500 text-sm">
                {lang === "mn"
                  ? "Одоогоор санал болгох контент алга."
                  : "No recommendations yet."}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {recommended.slice(0, 6).map((m) => (
                  <button
                    key={m._id}
                    onClick={() =>
                      router.push(`/movie/${m._id}`)
                    }
                    className="text-left group"
                    title={m.title}
                  >
                    <div className="w-full aspect-[2/3] rounded-xl overflow-hidden border border-white/10 bg-white/5">
                      {posterSrc(m) ? (
                        <img
                          src={posterSrc(m)}
                          alt={m.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs sm:text-sm text-white/90 line-clamp-2">
                      {m.title}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {m.year || ""}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

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
