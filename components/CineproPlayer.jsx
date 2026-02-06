"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import shaka from "shaka-player"; // 🔁 CHANGED: use Shaka instead of Hls

// 🔹 Friendly provider names + notes (for server buttons)
const PROVIDER_INFO = {
  zen: {
    label: "Zen",
    note: "Fast, good for movies",
  },
  sonata: {
    label: "Sonata",
    note: "Native subs, wide coverage",
  },
  breeze: {
    label: "Breeze",
    note: "Multiple servers, good fallback",
  },
  nova: {
    label: "Nova",
    note: "High quality, with captions",
  },
  neko: {
    label: "Neko",
    note: "Anime only, with skip times",
  },
    flow: {
    label: "Flow",
    note: "Multi-quality MP4",
  },
    lush: {
    label: "Atlas",
    note: "Multi-quality MP4 (Lush provider)",
  },
};

// 🔥 order we want to use everywhere
const PROVIDER_PRIORITY = ["lush", "flow", "sonata", "breeze", "zen", "nova"];

/* ---------- SIMPLE ICONS ---------- */

function IconReplay10({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 4a7 7 0 0 0-6.93 6H3a1 1 0 0 0 0 2h3.5A.5.5 0 0 0 7 11.5V8a1 1 0 0 0-2 0v1.12A7 7 0 1 1 12 19"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fontSize="6"
        fill="currentColor"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      >
        10
      </text>
    </svg>
  );
}

function IconForward10({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 4a7 7 0 0 1 6.93 6H21a1 1 0 0 1 0 2h-3.5a.5.5 0 0 1-.5-.5V8a1 1 0 0 1 2 0v1.12A7 7 0 1 0 12 19"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fontSize="6"
        fill="currentColor"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      >
        10
      </text>
    </svg>
  );
}

function IconPlay({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <polygon points="10 8 10 16 16 12" fill="currentColor" />
    </svg>
  );
}

function IconPause({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect x="9" y="8" width="2.5" height="8" fill="currentColor" />
      <rect x="12.5" y="8" width="2.5" height="8" fill="currentColor" />
    </svg>
  );
}

/* ---------- MAIN PLAYER ---------- */

export default function CineproPlayer({
  src, // backend HLS URL
  tmdbId,
  type = "movie",
  movieType,
  season = 1,
  episode = 1,
  subtitles: adminSubtitles = [],
  title, // 🆕 used for Neko anime
}) {

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // 🔁 NEW: keep Shaka instance
  const shakaPlayerRef = useRef(null);

  const introRef = useRef(null);
  const outroRef = useRef(null);

  const safeTitle = useMemo(() => title || "", [title]);

  const [servers, setServers] = useState([]);
  const [activeServer, setActiveServer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);

  const [sbSubs, setSbSubs] = useState([]);
  const [activeQuality, setActiveQuality] = useState("auto"); // ⭐ NEW

  // 🔁 used only for manual "Retry"
  const [reloadKey, setReloadKey] = useState(0);

  // Custom controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0); // 🔵 seconds of buffered video
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
    // 🔐 stream readiness + queued autoplay
  const [isSourceReady, setIsSourceReady] = useState(false);
  const [autoPlayRequested, setAutoPlayRequested] = useState(false);
  // ✅ NEW for Netflix-style loader
  const [isBuffering, setIsBuffering] = useState(false); // ⭐ NEW

    // ✅ detect mobile (simple: width <= 768)
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false); // ⭐ NEW
  const [bestLushIndex, setBestLushIndex] = useState(null); // ⭐ NEW
  const [showServerMenu, setShowServerMenu] = useState(false);

  const serverOptions = useMemo(() => {
    if (!servers.length) return [];

    const options = [];
    const seenProviders = new Set();

    servers.forEach((srv, idx) => {
      const providerKey = srv.provider || "";

      let displayIndex = idx;
      let displayServer = srv; // ⭐ which server we use for label/quality

      if (providerKey === "lush" && bestLushIndex != null) {
        if (seenProviders.has("lush")) return; // already added Lush once
        displayIndex = bestLushIndex;
        displayServer = servers[bestLushIndex] || srv; // ⭐ use 1080p lush for name
      } else {
        if (seenProviders.has(providerKey)) return;
      }

      seenProviders.add(providerKey);

      const baseLabel =
        PROVIDER_INFO[providerKey]?.label ||
        displayServer.label || // ⭐ use the best one’s label
        (providerKey ? providerKey.toUpperCase() : "") ||
        `Server ${displayIndex + 1}`;

      options.push({
        index: displayIndex,
        label: baseLabel,
        provider: providerKey,
      });
    });

    return options;
  }, [servers, bestLushIndex]);

  const currentServerLabel =
    serverOptions.find((opt) => opt.index === activeServer)?.label || "Auto";


  useEffect(() => {
    if (!showControls) setShowServerMenu(false);
  }, [showControls]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setIsMobile(window.innerWidth <= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent || navigator.vendor || "";
    setIsIOS(/iPhone|iPad|iPod/i.test(ua));
  }, []);

  // Subtitles
  const [activeSubIndex, setActiveSubIndex] = useState(-1);
  const [subtitleText, setSubtitleText] = useState("");
  // ✅ NEW: use native captions in iOS fullscreen
  const [useNativeSubtitles, setUseNativeSubtitles] = useState(false); // ⭐ NEW

    // 🔧 Subtitle settings (desktop + Android only)
  const [subtitleScale, setSubtitleScale] = useState(1);   // 0.7 ~ 1.5
  const [subtitleOffset, setSubtitleOffset] = useState(0); // px up/down
  const [showSettings, setShowSettings] = useState(false);

  const subtitleBoxClasses = isFullscreen
    ? "text-base sm:text-2xl md:text-3xl bottom-24 sm:bottom-28"
    : "text-xs sm:text-sm md:text-lg bottom-6 sm:bottom-8 md:bottom-10";

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

  const normalizeUrl = (url) => {
    if (!url) return "";
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("blob:")
    ) {
      return url;
    }
    if (url.startsWith("/")) {
      if (!API_BASE) return url;
      return `${API_BASE}${url}`;
    }
    return url;
  };

  const selectServer = useCallback(
    (index) => {
      if (index === activeServer) return;

      setError("");
      setShowServerMenu(false);
      setIsBuffering(true);
      setIsSourceReady(false);

      // ✅ iOS MUST switch + play inside user gesture
      if (isIOS) {
        const video = videoRef.current;
        const next = servers[index];
        if (!video || !next?.file) {
          setIsBuffering(false);
          return;
        }

        try {
          const url = normalizeUrl(next.file);

          // reset element
          video.pause();
          video.removeAttribute("src");
          video.load();

          // set new source
          video.src = url;
          video.load();

          // try to start (allowed because this function runs from the tap)
          video.play().catch(() => {});
        } catch (e) {}

        // update UI state
        setActiveServer(index);

        // when it starts, unlock
        const done = () => {
          setIsSourceReady(true);
          setIsBuffering(false);
          video.removeEventListener("playing", done);
          video.removeEventListener("canplay", done);
        };
        video.addEventListener("playing", done);
        video.addEventListener("canplay", done);

        return;
      }

      // ✅ non-iOS: normal way (effect will load Shaka or MP4)
      setAutoPlayRequested(true);
      setActiveServer(index);
    },
    [activeServer, isIOS, servers, normalizeUrl]
  );

  const switchToNextServer = useCallback(
    (reason = "stream error") => {
      console.warn("Stream error, trying next server:", reason);

      if (!servers.length) {
        setError("Stream error. Please refresh this page or try later.");
        return;
      }

      const current = servers[activeServer];
      const currentProvider = current?.provider || "";

      // build priority list starting *after* the current provider
      const start = PROVIDER_PRIORITY.indexOf(currentProvider);
      const rotated =
        start === -1
          ? [...PROVIDER_PRIORITY]
          : [
              ...PROVIDER_PRIORITY.slice(start + 1),
              ...PROVIDER_PRIORITY.slice(0, start + 1),
            ];

      // 1️⃣ try providers in our priority order
      for (const provider of rotated) {
        const idx = servers.findIndex(
          (s, i) => s.provider === provider && i !== activeServer
        );
        if (idx !== -1) {
          setError("");
          setActiveServer(idx);
          return;
        }
      }

      // 2️⃣ fallback: any other server index
      const fallback = servers.findIndex((_, i) => i !== activeServer);
      if (fallback !== -1) {
        setError("");
        setActiveServer(fallback);
      } else {
        setError("Stream error. Please refresh this page or try later.");
      }
    },
    [servers, activeServer]
  );

  /* --------------------------------
   * 1) LOAD SOURCES + SUBTITLES
   * -------------------------------- */
  useEffect(() => {
    let cancelled = false;

    const loadSources = async () => {
      setLoading(true);
      setError("");
      setServers([]);
      setActiveServer(0);
      setSbSubs([]);
      setIsSourceReady(false);
      setAutoPlayRequested(false);

      // If we have neither tmdbId nor src → no source at all
      if (!tmdbId && !src) {
        setLoading(false);
        setError("No stream source.");
        return;
      }

      try {
        const s = season || 1;
        const e = episode || 1;

        console.log("🎬 CineproPlayer props:", {
          tmdbId,
          type,
          movieType,
          season: s,
          episode: e,
        });

        const encodedTitle = encodeURIComponent(safeTitle || "");

        // ✅ Decide endpoint SAFELY (prevents wrong /series on refresh)
        const isAnime = movieType === "anime";

        const isTvLike =
          movieType === "series" || movieType === "kdrama" || movieType === "cdrama";

        const shouldUseSeriesEndpoint =
          isTvLike && type !== "movie"; // <- important (type prop from page)

        const endpoints = [];
        if (isAnime) {
          // Prefer anime endpoint, but fall back to series if it fails (graceful)
          endpoints.push(
            `/api/zentlify/anime/${tmdbId}?season=${s}&episode=${e}&title=${encodedTitle}`,
            `/api/zentlify/series/${tmdbId}?season=${s}&episode=${e}&title=${encodedTitle}`
          );
        } else if (shouldUseSeriesEndpoint) {
          endpoints.push(
            `/api/zentlify/series/${tmdbId}?season=${s}&episode=${e}&title=${encodedTitle}`
          );
        } else {
          // ✅ default to movie endpoint
          endpoints.push(`/api/zentlify/movie/${tmdbId}?title=${encodedTitle}`);
        }
                
        console.log("🔁 Zentlify reload:", { reloadKey, endpoints });

        let data = {};
        let lastStatus = null;
        for (const endpoint of endpoints) {
          const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { "Content-Type": "application/json" },
          });
          lastStatus = res.status;
          if (!res.ok) continue;
          data = await res.json().catch(() => ({}));
          // stop on first successful response
          if (data && (data.streams || data.sources || data.result)) break;
        }

        if (!data || (!data.streams && !data.sources && !data.result)) {
          throw new Error(`Zentlify request failed: ${lastStatus || "unknown"}`);
        }
        console.log("Zentlify response:", data);

        const rawStreams =
          data.streams ||
          data.sources ||
          data.result?.streams ||
          data.result?.sources ||
          [];

        // 1️⃣ Normalize + detect provider (lush / flow / sonata / breeze / nova / zen / neko)
        const zStreams = (Array.isArray(rawStreams) ? rawStreams : []).map((st, i) => {
          const rawProvider = (st.provider || "").toLowerCase();
          const rawName = (st.name || st.title || "").toLowerCase();
          const rawUrl = String(st.url || st.file || st.src || "").toLowerCase();

          let providerKey = "";

          // --- LUSH (Atlas) FIRST ---
          if (
            rawProvider.includes("lush") ||
            rawName.includes("lush") ||
            rawProvider.includes("atlas") ||
            rawName.includes("atlas")
          ) {
            providerKey = "lush";

          // --- FLOW (Flow name or MP4-ish URL) SECOND ---
          } else if (
            rawProvider.includes("flow") ||
            rawName.includes("flow") ||
            rawUrl.endsWith(".mp4")               // direct mp4
          ) {
            providerKey = "flow";

          // --- SONATA ---
          } else if (rawProvider.includes("sonata") || rawName.includes("sonata")) {
            providerKey = "sonata";

          // --- BREEZE ---
          } else if (rawProvider.includes("breeze") || rawName.includes("breeze")) {
            providerKey = "breeze";

          // --- NOVA ---
          } else if (rawProvider.includes("nova") || rawName.includes("nova")) {
            providerKey = "nova";

          // --- NEKO ---
          } else if (rawProvider.includes("neko") || rawName.includes("neko")) {
            providerKey = "neko";

          // --- ZEN ONLY WHEN IT'S REALLY ZEN ---
          } else if (rawProvider.includes("zen") || rawName.includes("zen")) {
            providerKey = "zen";

          // ✅ fallback: unknown / mixed → NEVER force to zen
          } else {
            providerKey = rawProvider || "other";
          }

          return { ...st, _providerKey: providerKey };
        });

        // ⛔ TEMP: completely disable Zen provider
        const filteredStreams = zStreams.filter((s) => s._providerKey !== "zen");

        console.log(
          "Zentlify providers (normalized, Zen filtered):",
          filteredStreams.map((s, i) => ({
            i,
            provider: s.provider,
            normProvider: s._providerKey,
            name: s.name,
            title: s.title,
            url: s.url || s.file || s.src,
          }))
        );

        if (!filteredStreams.length) {
          setError(
            "Одоогоор энэ контентод идэвхтэй сервер алга байна. Refresh хийгээд дахин оролдоно уу"
          );
          setServers([]);
          setSbSubs([]);
          return;
        }

        // 2️⃣ Map EVERY stream to an internal server object (after removing Zen)
        const srvList = filteredStreams.map((st, idx) => {
          const raw = st.url || st.file || st.src;
          const providerKey = st._providerKey || "other";
          const pInfo = PROVIDER_INFO[providerKey];

          const url = normalizeUrl(raw);
          const lowerUrl = url.toLowerCase();

          // Detect stream type by URL pattern (not provider name)
          // /cdn/s? = segment/MP4, /cdn/pl? = playlist/HLS
          const isMp4 =
            lowerUrl.includes("/cdn/s?") ||
            lowerUrl.endsWith(".mp4") ||
            lowerUrl.includes(".mp4?");

          const streamType = isMp4 ? "mp4" : "hls";

          const baseLabel =
            PROVIDER_INFO[providerKey]?.label ||
            st.name ||
            st.title ||
            `Server ${idx + 1}`;

          const displayName = st.quality ? `${baseLabel} ${st.quality}` : baseLabel;

          return {
            type: streamType,
            file: url,
            label: displayName,
            provider: providerKey,
            quality: st.quality || "",
            note: pInfo?.note || "",
            intro: st.intro || null,
            outro: st.outro || null,
            providerSubtitles: Array.isArray(st.subtitles) ? st.subtitles : [],
          };
        });

        let orderedServers = [...srvList];

        // 3️⃣ Sort by global priority: lush > flow > sonata > breeze > zen > nova > others
        orderedServers.sort((a, b) => {
          const pa = PROVIDER_PRIORITY.indexOf(a.provider || "");
          const pb = PROVIDER_PRIORITY.indexOf(b.provider || "");
          const sa = pa === -1 ? PROVIDER_PRIORITY.length : pa;
          const sb = pb === -1 ? PROVIDER_PRIORITY.length : pb;
          return sa - sb;
        });

        // 4️⃣ Choose default server (best Lush if exists)
        let defaultIndex = 0;
        let bestLushIndexLocal = null;

        // 1️⃣ Prefer Lush streams that are MP4 (Atlas)
        let lushCandidates = orderedServers
          .map((s, idx) => ({ s, idx }))
          .filter(({ s }) => s.provider === "lush" && s.type === "mp4");

        // If for some reason there are no MP4 Lush streams, fall back to any Lush
        if (!lushCandidates.length) {
          lushCandidates = orderedServers
            .map((s, idx) => ({ s, idx }))
            .filter(({ s }) => s.provider === "lush");
        }

        if (lushCandidates.length) {
          const score = (q) => {
            if (!q) return 0;
            const num = parseInt(String(q).match(/\d+/)?.[0] || "0", 10);
            return num;
          };

          let best = lushCandidates[0];
          lushCandidates.forEach((c) => {
            if (score(c.s.quality) > score(best.s.quality)) {
              best = c;
            }
          });

          defaultIndex = best.idx;
          bestLushIndexLocal = best.idx;
        } else {
          defaultIndex = 0;
        }

        setServers(orderedServers);
        setActiveServer(defaultIndex);
        setBestLushIndex(bestLushIndexLocal);

        // Debug: log stream types for verification
        console.log(
          "[CineproPlayer] Stream types:",
          orderedServers.map((s, i) => ({
            i,
            provider: s.provider,
            type: s.type,
            quality: s.quality,
          }))
        );

        // 🔹 Collect provider subtitles
        const providerSubs = [];
        orderedServers.forEach((srv) => {
          (srv.providerSubtitles || []).forEach((sub) => {
            const url = sub.url || sub.file;
            if (!url) return;
            providerSubs.push({
              url,
              label: sub.label || sub.lang || "Subtitle",
              lang: sub.lang || "",
              default: false,
            });
          });
        });

        setSbSubs(providerSubs);
      } catch (e) {
        console.error("Zentlify load error:", e);
        if (!cancelled) {
          setError("Алдаа гарлаа. Дахин ачааллана уу.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSources();

    return () => {
      cancelled = true;
    };
  }, [
    src,
    tmdbId,
    type,
    movieType,
    season,
    episode,
    safeTitle,   // 🆕 refetch when title changes (derived from title)
    API_BASE,
    isIOS,
    reloadKey,
  ]);

  /* --------------------------------
   * 2) MERGE ADMIN SUBS + ZENTLIFY SUBS
   * -------------------------------- */
  const finalSubs = useMemo(() => {
    const admin = Array.isArray(adminSubtitles) ? adminSubtitles : [];

    const normalizedAdmin = admin.map((s) => {
      const rawLang = (s.lang || "").toLowerCase();
      const rawLabel = s.label || s.name || "";

      const looksMongolian =
        rawLang.startsWith("mn") ||
        /mongol/i.test(rawLabel) ||
        /монгол/i.test(rawLabel);

      const lang = looksMongolian ? "mn" : rawLang || "en";

      return {
        ...s,
        url: normalizeUrl(s.url),
        lang,
        label: rawLabel || (looksMongolian ? "Монгол" : "Subtitle"),
        default: looksMongolian || !!(s.default || s.isDefault),
      };
    });

    const allSubs = [...normalizedAdmin, ...sbSubs];

    // ✅ Only keep Mongolian + English
    return allSubs.filter((s) => {
      const lang = (s.lang || "").toLowerCase();
      const label = (s.label || "").toLowerCase();

      const isMn =
        lang.startsWith("mn") ||
        label.includes("mongol") ||
        label.includes("монгол");

      const isEn =
        lang.startsWith("en") ||
        label.includes("english") ||
        label.includes("eng");

      return isMn || isEn;
    });
  }, [adminSubtitles, sbSubs]);

  // 🔹 Collect distinct qualities for Lush streams (1080p / 720p / 480…)
  const lushQualities = useMemo(() => {
    if (!servers.length) return [];

    const opts = [];
    const seen = new Set();

    servers.forEach((srv, idx) => {
      if (srv.provider !== "lush" && srv.provider !== "flow") return;
      const q = srv.quality || "Auto";
      if (seen.has(q)) return;
      seen.add(q);
      opts.push({
        label: q,
        value: q,
        index: idx,
      });
    });

    return opts;
  }, [servers]);

  const firstLushIndex = useMemo(
    () => servers.findIndex((s) => s.provider === "lush"),
    [servers]
  );

  useEffect(() => {
    if (!finalSubs.length) {
      setActiveSubIndex(-1);
      return;
    }

    let idx = finalSubs.findIndex((s) => {
      const lang = (s.lang || "").toLowerCase();
      const label = s.label || "";
      return (
        lang.startsWith("mn") ||
        /mongol/i.test(label) ||
        /монгол/i.test(label)
      );
    });

    if (idx === -1) {
      idx = finalSubs.findIndex((s) => s.default);
    }

    if (idx === -1) {
      setActiveSubIndex(-1);
    } else {
      setActiveSubIndex(idx);
    }
  }, [finalSubs]);

  // 🔹 Keep activeQuality in sync with active server
  useEffect(() => {
    const server = servers[activeServer];
    if (!server) return;

    if (server.provider === "lush" || server.provider === "flow") {
      setActiveQuality(server.quality || "auto");
    } else {
      setActiveQuality("auto");
    }
  }, [servers, activeServer]);

  /* --------------------------------
   * 3) INIT / SWITCH SHAKA PLAYER
   * -------------------------------- */
  useEffect(() => {
    const video = videoRef.current;
    const server = servers[activeServer];

    if (!video || !server || !server.file) return;

    setError("");
    setIsSourceReady(false); // ⏳ lock controls while this server is loading

    introRef.current = server.intro || null;
    outroRef.current = server.outro || null;
    setShowSkipIntro(false);
    setShowSkipOutro(false);

    const sourceUrl = normalizeUrl(server.file);
    console.log("🎬 Using server with Shaka:", activeServer, sourceUrl);

    // 🧹 always destroy previous Shaka instance (old stream)
    if (shakaPlayerRef.current) {
      shakaPlayerRef.current
        .destroy()
        .catch(() => {})
        .finally(() => {
          shakaPlayerRef.current = null;
        });
    }

    const lowerSrc = sourceUrl.toLowerCase();
    const isMp4 =
      server.type === "mp4" ||
      lowerSrc.endsWith(".mp4") ||
      lowerSrc.includes("/cdn/s?");

    // 👉 If this is a direct MP4 (progressive) stream, DON'T use Shaka.
    if (isMp4) {
      console.log("▶ Using plain MP4 stream, skipping Shaka");
      video.pause();
      video.src = sourceUrl;
      video.load();

      setIsSourceReady(true);
      setIsBuffering(false);

      // just stop the loader when we actually start playing
      const onPlayingOnce = () => {
        setIsBuffering(false);
        video.removeEventListener("playing", onPlayingOnce);
      };
      video.addEventListener("playing", onPlayingOnce);

      setAutoPlayRequested((prev) => {
        if (prev) {
          video.play().catch(() => {});
          setIsPlaying(true);
          return false;
        }
        setIsPlaying(false);
        return prev;
      });

      return () => {
        video.removeEventListener("playing", onPlayingOnce);
      };
    }

    // 📱 iOS → use native HLS, skip Shaka
    if (isIOS) {
      console.log("📱 iOS detected → using native HLS only");
      video.src = sourceUrl;
      video.load();

      setIsSourceReady(true);
      setIsBuffering(false);

      setAutoPlayRequested((prev) => {
        // iOS usually blocks autoplay, so stay paused
        if (prev) {
          setIsPlaying(false);
          return false;
        }
        return prev;
      });

      return; // ⬅️ IMPORTANT: stop here, do NOT create Shaka player
    }

    // reset video element
    video.pause();
    video.removeAttribute("src");
    video.load();

    // Install polyfills & check support
    shaka.polyfill.installAll();
    if (!shaka.Player.isBrowserSupported()) {
      console.warn("Shaka not supported in this browser, using fallback src");
      video.src = sourceUrl;
      video.load();
      setIsPlaying(false);
      return;
    }

    const player = new shaka.Player(video);
    shakaPlayerRef.current = player;

    // ⭐ NEW: Netflix-style loader during buffering
    const onBuffering = (event) => {
      // event.buffering is boolean in Shaka
      setIsBuffering(!!event.buffering);
    };
    player.addEventListener("buffering", onBuffering);

    const net = player.getNetworkingEngine();
    if (net) {
      net.registerRequestFilter((type, request) => {
        if (!request.uris || !request.uris[0]) return;

        // Some providers don’t like HEAD → force GET
        if (request.method === "HEAD") {
          request.method = "GET";
        }
      });
    }

    // Softer buffering config so seeking feels faster
    player.configure({
      streaming: {
        bufferingGoal: 20,   // ~20s ahead
        bufferBehind: 20,
        rebufferingGoal: 5,
      },
    });

    const onErrorEvent = (event) => {
      const err = event.detail;
      console.error("Shaka error event:", err);

      // ✅ If Shaka says it's recoverable, let it retry instead of switching
      if (err && err.severity === shaka.util.Error.Severity.RECOVERABLE) {
        return;
      }

      // ✅ For Breeze, don't auto-switch – just keep trying on same server
      const currentSrv = servers[activeServer];
      if (currentSrv?.provider === "breeze") {
        // you can show a small toast later if you want, but don't change server
        return;
      }

      const hasNext = servers.length > 1 && activeServer < servers.length - 1;
      if (hasNext) {
        switchToNextServer("shaka error");
      } else {
        setError("Stream error. Please refresh this page or try later.");
      }
    };

    player.addEventListener("error", onErrorEvent);

    player
      .load(sourceUrl)
        .then(() => {
          // ✅ stream is ready
          setIsSourceReady(true);
          setIsBuffering(false);

          const v = videoRef.current;

          setAutoPlayRequested((prev) => {
            if (prev && v) {
              if (!isIOS) {
                // 🖥️ Desktop / Android → safe to auto-play
                v.play().catch(() => {});
                setIsPlaying(true);
              } else {
                // 📱 iOS → Safari might block auto-play
                // keep it paused; user will tap again to play
                setIsPlaying(false);
              }
              return false; // clear flag
            }

            // user never requested autoplay → stay paused
            setIsPlaying(false);
            return prev;
          });
        })
      .catch((err) => {
        console.error("Shaka load error:", err);
        setIsBuffering(false); // ⭐ NEW
        player.removeEventListener("error", onErrorEvent);
        const hasNext = servers.length > 1 && activeServer < servers.length - 1;
        if (hasNext) {
          switchToNextServer("shaka load failed");
        } else {
          setError("Stream load failed. Please try again later.");
        }
      });

    return () => {
      player.removeEventListener("error", onErrorEvent);
      player.removeEventListener("buffering", onBuffering); // ⭐ NEW
      player
        .destroy()
        .catch(() => {})
        .finally(() => {
          if (shakaPlayerRef.current === player) {
            shakaPlayerRef.current = null;
          }
        });
    };
  }, [servers, activeServer, switchToNextServer, isIOS]);

  const setupSubtitleTrack = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const textTracks = video.textTracks;
    if (!textTracks) return;

    // Always clear overlay text first
    setSubtitleText("");

    // 🔹 If we are in iOS native fullscreen, let Safari handle captions
    if (useNativeSubtitles) {
      for (let i = 0; i < textTracks.length; i++) {
        const track = textTracks[i];
        track.oncuechange = null;

        if (i === activeSubIndex) {
          track.mode = "showing";    // Safari shows this
        } else {
          track.mode = "disabled";
        }
      }
      return; // ⬅ no custom overlay
    }

    // 🔹 Custom overlay mode (desktop + non-fullscreen mobile)

    // Disable + clear all tracks first
    for (let i = 0; i < textTracks.length; i++) {
      const track = textTracks[i];
      track.mode = "disabled";
      track.oncuechange = null;
    }

    // CC = Off
    if (activeSubIndex < 0 || activeSubIndex >= finalSubs.length) {
      return;
    }

    const track = textTracks[activeSubIndex];
    if (!track) return;

    // Keep cues active but hidden (we render them ourselves)
    track.mode = "hidden";

    track.oncuechange = () => {
      const activeCues = track.activeCues;
      if (!activeCues || !activeCues.length) {
        setSubtitleText("");
        return;
      }

      const lines = [];
      for (let i = 0; i < activeCues.length; i++) {
        lines.push(activeCues[i].text);
      }
      setSubtitleText(lines.join("\n"));
    };
  }, [activeSubIndex, finalSubs.length, useNativeSubtitles]);

  useEffect(() => {
    setupSubtitleTrack();
  }, [setupSubtitleTrack]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateBuffered = () => {
      if (!video.buffered || video.buffered.length === 0) {
        setBuffered(0);
        return;
      }
      // take the end of the last buffered range
      const end = video.buffered.end(video.buffered.length - 1);
      setBuffered(end);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      const t = video.currentTime || 0;
      setCurrentTime(t);
      updateBuffered(); // 🔵 keep buffered in sync

      const intro = introRef.current;
      if (intro && typeof intro.start === "number" && typeof intro.end === "number") {
        const visible = t >= intro.start && t <= intro.end;
        if (visible !== showSkipIntro) setShowSkipIntro(visible);
      } else if (showSkipIntro) {
        setShowSkipIntro(false);
      }

      const outro = outroRef.current;
      if (outro && typeof outro.start === "number" && typeof outro.end === "number") {
        const visibleOut = t >= outro.start && t <= outro.end;
        if (visibleOut !== showSkipOutro) setShowSkipOutro(visibleOut);
      } else if (showSkipOutro) {
        setShowSkipOutro(false);
      }
    };
    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      updateBuffered(); // 🔵 initial buffer
      setupSubtitleTrack();
    };
    const onVolumeChange = () => {
      setVolume(video.muted ? 0 : video.volume);
      setIsMuted(video.muted || video.volume === 0);
    };
    const onEnded = () => setIsPlaying(false);
    const onError = (e) => {
      console.warn("HTML5 video error:", e);
      switchToNextServer("video element error");
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);
    video.addEventListener("progress", updateBuffered); // 🔵 updates while loading

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
      video.removeEventListener("progress", updateBuffered); // 🔵 cleanup
    };
  }, [setupSubtitleTrack, switchToNextServer, showSkipIntro, showSkipOutro]);

  // 🔄 Global buffering handler (debounced so spinner won't flash)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let t = null;

    const setBufferingSoon = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => setIsBuffering(true), 400); // show only if real buffering
    };

    const clearBuffering = () => {
      if (t) clearTimeout(t);
      t = null;
      setIsBuffering(false);
    };

    video.addEventListener("waiting", setBufferingSoon);
    video.addEventListener("stalled", setBufferingSoon);
    video.addEventListener("seeking", setBufferingSoon);

    video.addEventListener("playing", clearBuffering);
    video.addEventListener("canplay", clearBuffering);
    video.addEventListener("seeked", clearBuffering);
    video.addEventListener("loadeddata", clearBuffering);

    return () => {
      if (t) clearTimeout(t);

      video.removeEventListener("waiting", setBufferingSoon);
      video.removeEventListener("stalled", setBufferingSoon);
      video.removeEventListener("seeking", setBufferingSoon);

      video.removeEventListener("playing", clearBuffering);
      video.removeEventListener("canplay", clearBuffering);
      video.removeEventListener("seeked", clearBuffering);
      video.removeEventListener("loadeddata", clearBuffering);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleBeginFs = () => {
      setIsFullscreen(true);
      setUseNativeSubtitles(true);   // ⭐ use iOS native CC in fullscreen
      setupSubtitleTrack();          // apply modes
    };
    const handleEndFs = () => {
      setIsFullscreen(false);
      setUseNativeSubtitles(false);  // back to custom overlay
      setupSubtitleTrack();
    };

    video.addEventListener("webkitbeginfullscreen", handleBeginFs);
    video.addEventListener("webkitendfullscreen", handleEndFs);

    return () => {
      video.removeEventListener("webkitbeginfullscreen", handleBeginFs);
      video.removeEventListener("webkitendfullscreen", handleEndFs);
    };
  }, [setupSubtitleTrack]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 📱 MOBILE: always show controls, no auto-hide
    if (isMobile) {
      setShowControls(true);

      const showOnTap = () => {
        setShowControls(true);
      };

      container.addEventListener("touchstart", showOnTap);

      return () => {
        container.removeEventListener("touchstart", showOnTap);
      };
    }

    // 💻 DESKTOP / TABLET: auto-hide after 2.5s
    let timeoutId;

    const resetTimer = () => {
      setShowControls(true);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setShowControls(false);
      }, 2500);
    };

    resetTimer();
    container.addEventListener("mousemove", resetTimer);
    container.addEventListener("touchstart", resetTimer);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      container.removeEventListener("mousemove", resetTimer);
      container.removeEventListener("touchstart", resetTimer);
    };
  }, [isMobile]);

  // ⭐ Netflix-style loader flag (GLOBAL in component)
  const showLoaderOverlay =
  loading || (autoPlayRequested && !isSourceReady) || (!isPlaying && isBuffering);

  /* --------------------------------
   * 5) CONTROL HANDLERS
   * -------------------------------- */
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // ⏳ Stream not ready yet → remember that user wants to play
    if (!isSourceReady) {
      setAutoPlayRequested(true);
      return;
    }

    // ✅ Normal behaviour once ready
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isSourceReady]);

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const value = Number(e.target.value);
    video.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const value = Number(e.target.value);
    video.volume = value;
    video.muted = value === 0;
  };

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) {
      video.volume = 0.6;
    }
  }, []);

  const skipSeconds = useCallback((delta) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = Math.min(
      Math.max(0, (video.currentTime || 0) + delta),
      video.duration || Infinity
    );
    video.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!video) return;

    // ✅ iPhone Safari: only reliable fullscreen is video.webkitEnterFullscreen()
    if (isIOS && video.webkitEnterFullscreen) {
      try {
        video.webkitEnterFullscreen();
      } catch (e) {}
      return;
    }

    if (!container) return;

    const doc = document;

    const fsElement =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement;

    const requestOnContainer =
      container.requestFullscreen ||
      container.webkitRequestFullscreen ||
      container.mozRequestFullScreen ||
      container.msRequestFullscreen;

    const exitFs =
      doc.exitFullscreen ||
      doc.webkitExitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.msExitFullscreen;

    if (!fsElement) {
      if (requestOnContainer) {
        try {
          const p = requestOnContainer.call(container);
          if (p && p.then) p.catch(() => {});
        } catch (e) {}
      }
      return;
    }

    if (exitFs) {
      try {
        const p = exitFs.call(doc);
        if (p && p.then) p.catch(() => {});
      } catch (e) {}
    }
  }, [isIOS]);

  // 🎹 Keyboard shortcuts: space, arrows, M, F
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        e.target.isContentEditable
      ) {
        // Don't hijack keys when typing in a form/search box
        return;
      }

      // Show controls for a moment when using keyboard
      setShowControls(true);

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        skipSeconds(10);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        skipSeconds(-10);
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlay, skipSeconds, toggleMute, toggleFullscreen]);

  useEffect(() => {
    const doc = document;

    const onFsChange = () => {
      const isFs =
        !!doc.fullscreenElement ||
        !!doc.webkitFullscreenElement ||
        !!doc.mozFullScreenElement ||
        !!doc.msFullscreenElement;

      setIsFullscreen(isFs);

      // iOS fullscreen = native captions
      if (isFs && isIOS) {
        setUseNativeSubtitles(true);
      }
      if (!isFs) {
        setUseNativeSubtitles(false);
      }
    };

    doc.addEventListener("fullscreenchange", onFsChange);
    doc.addEventListener("webkitfullscreenchange", onFsChange);

    return () => {
      doc.removeEventListener("fullscreenchange", onFsChange);
      doc.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, [isIOS]);

  const playedPercent =
    duration && !Number.isNaN(duration)
      ? Math.min((currentTime / duration) * 100, 100)
      : 0;

  const bufferedPercent =
    duration && !Number.isNaN(duration)
      ? Math.min((buffered / duration) * 100, 100)
      : 0;

  const formatTime = (sec) => {
    if (sec == null || Number.isNaN(sec)) return "0:00";

    const total = Math.floor(sec);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    // If longer than 1 hour → H:MM:SS
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    }

    // Under 1 hour → M:SS
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  /* --------------------------------
   * 6) RENDER
   * -------------------------------- */
  if (!tmdbId && !src) {
    return <div className="p-4 text-sm text-gray-300">Missing stream source.</div>;
  }

  return (
    <div className="w-full bg-black">
      {/* VIDEO + CUSTOM CONTROLS */}
      <div className="px-2 sm:px-4 pb-4">
        <div
          ref={containerRef}
          id="cinepro-player-container"
          className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/15 group"
        >
          {/* CC settings – desktop + Android only */}
          {!isIOS && (
            <>
              <button
                type="button"
                onClick={() => setShowSettings((v) => !v)}
                className="absolute top-2 left-2 z-30 bg-black/70 hover:bg-black/90 text-white text-[11px] sm:text-xs px-2.5 py-1 rounded-full border border-white/30 font-medium"
              >
                CC
              </button>

              {showSettings && (
                <div className="absolute top-9 left-2 z-30 bg-black/90 text-white text-[11px] sm:text-xs rounded-lg p-2 sm:p-3 w-40 sm:w-48 border border-white/20">
                  <div className="font-semibold mb-1">Тайлбар</div>

                  {/* Size slider */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-white/70">
                        Текстийн хэмжээ
                      </span>
                      <span className="text-[10px] text-white/60">
                        {Math.round(subtitleScale * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.7}
                      max={1.5}
                      step={0.05}
                      value={subtitleScale}
                      onChange={(e) => setSubtitleScale(Number(e.target.value))}
                      className="w-full accent-blue-400"
                    />
                  </div>

                  {/* Position slider */}
                  <div>
                    <div className="text-[10px] text-white/70 mb-1">
                      Байршил (дээр / доор)
                    </div>
                    <input
                      type="range"
                      min={-60}
                      max={40}
                      step={5}
                      value={subtitleOffset}
                      onChange={(e) => setSubtitleOffset(Number(e.target.value))}
                      className="w-full accent-blue-400"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <video
            ref={videoRef}
            className="w-full h-full"
            playsInline
            controls={false}
            crossOrigin="anonymous"
            preload="auto"
            onClick={isSourceReady ? togglePlay : undefined}
          >
            {finalSubs.map((sub, i) => (
              <track
                key={i}
                kind="subtitles"
                src={normalizeUrl(sub.url)}
                label={sub.label || sub.lang || `SUB ${i + 1}`}
                srcLang={sub.lang || "en"}
                default={false}
              />
            ))}
          </video>
          {showLoaderOverlay && !error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-[3px] sm:border-4 border-white/25 border-t-white animate-spin" />
              <p className="mt-3 text-xs sm:text-sm text-white/80">
                Түр хүлээнэ үү...
              </p>
            </div>
          ) : (
            !isPlaying && isSourceReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                {isMobile ? (
                  // ✅ MOBILE: center play + left/right skip buttons
                  <div className="flex items-center gap-6">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        skipSeconds(-10);
                      }}
                      className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white"
                    >
                      <IconReplay10 className="w-6 h-6" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/70 flex items-center justify-center text-white"
                    >
                      <IconPlay className="w-8 h-8" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        skipSeconds(10);
                      }}
                      className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white"
                    >
                      <IconForward10 className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  // ✅ DESKTOP: simple center play button
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="flex items-center justify-center"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 text-white">
                      <IconPlay className="w-full h-full" />
                    </div>
                  </button>
                )}
              </div>
            )
          )}

          {showSkipIntro && (
            <button
              type="button"
              onClick={() => {
                const v = videoRef.current;
                const intro = introRef.current;
                if (v && intro && typeof intro.end === "number") {
                  v.currentTime = intro.end;
                  setCurrentTime(intro.end);
                }
                setShowSkipIntro(false);
              }}
              className="absolute top-4 right-4 bg-white text-black text-xs sm:text-sm font-semibold px-3 py-1 rounded-full shadow-lg"
            >
              Skip intro
            </button>
          )}

          {showSkipOutro && (
            <button
              type="button"
              onClick={() => {
                const v = videoRef.current;
                const outro = outroRef.current;
                if (v && outro && typeof outro.end === "number") {
                  v.currentTime = outro.end;
                  setCurrentTime(outro.end);
                }
                setShowSkipOutro(false);
              }}
              className="absolute top-4 right-4 mt-10 bg-white text-black text-xs sm:text-sm font-semibold px-3 py-1 rounded-full shadow-lg"
            >
              Skip outro
            </button>
          )}

          {subtitleText && !useNativeSubtitles && (
            <div
              className={`pointer-events-none absolute inset-x-3 sm:inset-x-6 flex justify-center ${subtitleBoxClasses}`}
            >
              <div
                className="inline-block bg-black/75 px-3 sm:px-4 py-1.5 rounded-md text-center text-white leading-snug shadow-[0_0_12px_rgba(0,0,0,1)] max-w-[92%] sm:max-w-[82%]"
                style={{
                  transform: `translateY(${subtitleOffset}px) scale(${subtitleScale})`,
                  transformOrigin: "center bottom",
                }}
              >
                {subtitleText.split("\n").map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          )}

          <div
            className={`absolute inset-x-0 bottom-0 px-2 sm:px-3 pb-2 sm:pb-3 pt-1.5 sm:pt-2 bg-gradient-to-t from-black/85 via-black/50 to-transparent transition-opacity duration-200 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* progress bar */}
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-white/80 mb-1.5">
              <span className="tabular-nums min-w-[40px] text-right">
                {formatTime(currentTime)}
              </span>

              <div className="relative flex-1 h-4 flex items-center">
                {/* total bar (dark) */}
                <div className="pointer-events-none absolute left-0 right-0 h-[4px] rounded-full bg-white/10" />

                {/* buffered bar (light, WIDER + BRIGHTER) */}
                <div
                  className="pointer-events-none absolute left-0 h-[4px] rounded-full bg-white/70"
                  style={{ width: `${bufferedPercent}%` }}
                />

                {/* played bar (blue, on top) */}
                <div
                  className="pointer-events-none absolute left-0 h-[4px] rounded-full bg-blue-500"
                  style={{ width: `${playedPercent}%` }}
                />

                {/* slider thumb */}
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="relative flex-1 appearance-none bg-transparent h-[4px]
                            accent-transparent
                            [&::-webkit-slider-runnable-track]:bg-transparent
                            [&::-moz-range-track]:bg-transparent"
                />
              </div>

              <span className="tabular-nums min-w-[40px] text-left text-white/60">
                {formatTime(duration)}
              </span>
            </div>

            {/* main controls row */}
            <div
              className={`flex items-center justify-between gap-x-2 sm:gap-x-3 text-[11px] sm:text-xs text-white ${
                isSourceReady ? "" : "opacity-60"
              }`}
            >
              {/* LEFT SIDE: play controls + CC + Servers + Quality */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {/* ⏯️ bottom rewind/play/forward ONLY on desktop/tablet */}
                {!isMobile && (
                  <>
                    <button
                      type="button"
                      onClick={() => skipSeconds(-10)}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                    >
                      <IconReplay10 className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
                    >
                      {isPlaying ? (
                        <IconPause className="w-5 h-5" />
                      ) : (
                        <IconPlay className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => skipSeconds(10)}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                    >
                      <IconForward10 className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* CC selector – visible on ALL devices */}
                <div className="flex items-center gap-1 sm:gap-1.5 ml-1">
                  <span className="text-[10px] sm:text-[11px] text-white/60">
                    CC
                  </span>
                  <select
                    value={activeSubIndex}
                    onChange={(e) => setActiveSubIndex(Number(e.target.value))}
                    className="bg-black/70 border border-white/25 rounded-full px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] outline-none max-w-[90px] sm:max-w-[120px] truncate"
                  >
                    <option value={-1}>Off</option>
                    {finalSubs.map((s, idx) => (
                      <option key={idx} value={idx}>
                        {s.label || s.lang || `Track ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Servers dropdown – one per provider, names like Lush / Sonata */}
                {serverOptions.length > 0 && (
                  <div className="relative ml-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowServerMenu((v) => !v);
                      }}
                      className="flex items-center gap-1 bg-black/70 border border-white/25 rounded-full px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] outline-none"
                    >
                      {isMobile ? (
                        <>
                          <span className="text-white/80">Servers</span>
                          <span className="text-[9px] text-white/50">▾</span>
                        </>
                      ) : (
                        <>
                          <span className="text-white/60">Servers</span>
                          <span className="text-white font-semibold">
                            {currentServerLabel}
                          </span>
                          <span className="text-[9px] text-white/50">▾</span>
                        </>
                      )}
                    </button>
                    {showServerMenu && (
                      <div className="absolute bottom-9 right-0 z-50 bg-black/90 border border-white/20 rounded-lg py-1 min-w-[120px] shadow-lg">
                        {serverOptions.map((opt) => (
                          <button
                            key={opt.index}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectServer(opt.index);
                            }}
                            className={`w-full text-left px-3 py-1 text-[10px] sm:text-[11px] ${
                              activeServer === opt.index
                                ? "bg-blue-500 text-white"
                                : "text-gray-200 hover:bg-white/10"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Q selector – Lush quality (MP4) */}
                {lushQualities.length > 0 && (
                  <div className="flex items-center gap-1 sm:gap-1.5 ml-1">
                    <span className="text-[10px] sm:text-[11px] text-white/60">
                      Q
                    </span>
                    <select
                      value={activeQuality}
                      onChange={(e) => {
                        const q = e.target.value;
                        setActiveQuality(q);

                        if (q === "auto") {
                          const first = lushQualities[0];
                          if (first) selectServer(first.index);
                          return;
                        }

                        const match = lushQualities.find((o) => o.value === q);
                        if (match) {
                          selectServer(match.index);
                        }
                      }}
                      className="bg-black/70 border border-white/25 rounded-full px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] outline-none"
                    >
                      <option value="auto">Auto</option>
                      {lushQualities.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE: volume + fullscreen */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-1">
                {/* 🔊 Hide volume controls on iPhone */}
                {!isIOS && (
                  <>
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                    >
                      {isMuted || volume === 0 ? "🔇" : "🔊"}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="hidden sm:block w-20 accent-blue-400 h-1"
                    />
                  </>
                )}

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-base"
                >
                  {isFullscreen ? "⤢" : "⤢"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-2 text-xs text-red-400 flex items-center gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                setError("");
                setReloadKey((k) => k + 1); // 🔁 manual reload
              }}
              className="px-3 py-1 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20"
            >
              Дахин оролдох
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
