import { Icons } from "src/components/pstream-shared/Icon";
import { VideoPlayerButton } from "src/components/player-pstream/internals/Button";
import { usePlayerStore } from "src/stores/player-pstream/store";

export function Pause(props: { iconSizeClass?: string; className?: string }) {
  const display = usePlayerStore((s) => s.display);
  const { isPaused } = usePlayerStore((s) => s.mediaPlaying);

  const toggle = () => {
    if (isPaused) display?.play();
    else display?.pause();
  };

  return (
    <VideoPlayerButton
      className={props.className}
      iconSizeClass={props.iconSizeClass}
      onClick={toggle}
      icon={isPaused ? Icons.PLAY : Icons.PAUSE}
    />
  );
}
