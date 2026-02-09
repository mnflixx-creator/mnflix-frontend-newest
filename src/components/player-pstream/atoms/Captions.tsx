import { useEffect } from "react";

import { Icons } from "src/components/pstream-shared/Icon";
import { OverlayAnchor } from "src/components/pstream-shared/overlays/OverlayAnchor";
import { useCaptions } from "src/components/player-pstream/hooks/useCaptions";
import { VideoPlayerButton } from "src/components/player-pstream/internals/Button";
import { useOverlayRouter } from "src/hooks/pstream/useOverlayRouter";
import { usePlayerStore } from "src/stores/player-pstream/store";

export function Captions() {
  const router = useOverlayRouter("settings");
  const setHasOpenOverlay = usePlayerStore((s) => s.setHasOpenOverlay);
  const { setDirectCaption } = useCaptions();
  const translateTask = usePlayerStore((s) => s.caption.translateTask);

  useEffect(() => {
    setHasOpenOverlay(router.isRouterActive);
  }, [setHasOpenOverlay, router.isRouterActive]);

  useEffect(() => {
    if (!translateTask) {
      return;
    }
    if (translateTask.done) {
      const tCaption = translateTask.translatedCaption!;
      setDirectCaption(tCaption, {
        id: tCaption.id,
        url: "",
        language: tCaption.language,
        needsProxy: false,
      });
    }
  }, [translateTask, setDirectCaption]);

  return (
    <OverlayAnchor id={router.id}>
      <VideoPlayerButton
        onClick={() => {
          router.open();
          router.navigate("/captionsOverlay");
        }}
        icon={Icons.CAPTIONS}
      />
    </OverlayAnchor>
  );
}
