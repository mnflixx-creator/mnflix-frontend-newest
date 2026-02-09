import { Spinner } from "src/components/pstream-shared/layout/Spinner";
import { usePlayerStore } from "src/stores/player-pstream/store";

export function LoadingSpinner() {
  const isLoading = usePlayerStore((s) => s.mediaPlaying.isLoading);

  if (!isLoading) return null;

  return <Spinner className="text-4xl" />;
}
