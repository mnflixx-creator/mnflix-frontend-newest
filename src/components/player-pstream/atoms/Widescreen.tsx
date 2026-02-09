import { useState } from "react";

import { Icons } from "src/components/pstream-shared/Icon";
import { VideoPlayerButton } from "src/components/player-pstream/internals/Button";

export function Widescreen() {
  // Add widescreen status
  const [isWideScreen, setIsWideScreen] = useState(false);

  return (
    <VideoPlayerButton
      icon={isWideScreen ? Icons.SHRINK : Icons.STRETCH}
      className="text-white"
      onClick={() => {
        const videoElement = document.getElementById("video-element");
        if (videoElement) {
          videoElement.classList.toggle("object-cover");
          setIsWideScreen(!isWideScreen);
        }
      }}
    />
  );
}
