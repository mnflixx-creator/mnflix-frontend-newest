import { Icons } from "src/components/pstream-shared/Icon";
import { VideoPlayerButton } from "src/components/player-pstream/internals/Button";
import { usePlayerStore } from "src/stores/player-pstream/store";
import { isSafari } from "src/utils/pstream/detectFeatures";

export function Airplay() {
  const canAirplay = usePlayerStore((s) => s.interface.canAirplay);
  const display = usePlayerStore((s) => s.display);

  // Show Airplay button on Safari browsers (which support AirPlay natively)
  // or when the webkit event has confirmed availability
  if (!canAirplay && !isSafari) return null;

  return (
    <VideoPlayerButton
      onClick={() => display?.startAirplay()}
      icon={Icons.AIRPLAY}
    />
  );
}
