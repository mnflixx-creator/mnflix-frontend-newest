import { useEffect } from "react";

import { Icons } from "src/components/pstream-shared/Icon";
import { useOverlayStack } from "src/stores/interface/overlayStack";
import { usePlayerStore } from "src/stores/player-pstream/store";
import { usePreferencesStore } from "src/stores/preferences";

import { VideoPlayerButton } from "./Button";

export function InfoButton() {
  const meta = usePlayerStore((s) => s.meta);
  const { showModal, isModalVisible } = useOverlayStack();
  const setHasOpenOverlay = usePlayerStore((s) => s.setHasOpenOverlay);

  useEffect(() => {
    setHasOpenOverlay(isModalVisible("player-details"));
  }, [setHasOpenOverlay, isModalVisible]);

  const handleClick = async () => {
    if (!meta?.tmdbId) return;

    showModal("player-details", {
      id: Number(meta.tmdbId),
      type: meta.type === "movie" ? "movie" : "show",
    });
  };

  const enableLowPerformanceMode = usePreferencesStore(
    (state) => state.enableLowPerformanceMode,
  );

  if (enableLowPerformanceMode) {
    return null;
  }

  // Don't render button if meta, tmdbId, or type is missing/invalid
  if (
    !meta?.tmdbId ||
    !meta.type ||
    (meta.type !== "movie" && meta.type !== "show")
  ) {
    return null;
  }

  return (
    <VideoPlayerButton
      icon={Icons.CIRCLE_QUESTION}
      iconSizeClass="text-base"
      className="p-2 !-mr-2 relative z-10"
      onClick={handleClick}
    />
  );
}
