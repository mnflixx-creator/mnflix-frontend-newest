import { Icons } from "src/components/pstream-shared/Icon";
import { VideoPlayerButton } from "src/components/player-pstream/internals/Button";
import { usePlayerStore } from "src/stores/player-pstream/store";
import {
  canPictureInPicture,
  canWebkitPictureInPicture,
} from "src/utils/pstream/detectFeatures";

export function Pip() {
  const display = usePlayerStore((s) => s.display);

  if (!canPictureInPicture() && !canWebkitPictureInPicture()) return null;

  return (
    <VideoPlayerButton
      onClick={() => display?.togglePictureInPicture()}
      icon={Icons.PICTURE_IN_PICTURE}
    />
  );
}
