import { ReactNode, RefObject, useEffect, useRef } from "react";

import { OverlayDisplay } from "src/components/pstream-shared/overlays/OverlayDisplay";
import { SkipTracker } from "src/components/player-pstream/internals/Backend/SkipTracker";
import { CastingInternal } from "src/components/player-pstream/internals/CastingInternal";
import { HeadUpdater } from "src/components/player-pstream/internals/HeadUpdater";
import { KeyboardEvents } from "src/components/player-pstream/internals/KeyboardEvents";
import { MediaSession } from "src/components/player-pstream/internals/MediaSession";
import { MetaReporter } from "src/components/player-pstream/internals/MetaReporter";
import { ProgressSaver } from "src/components/player-pstream/internals/ProgressSaver";
import { ThumbnailScraper } from "src/components/player-pstream/internals/ThumbnailScraper";
import { VideoClickTarget } from "src/components/player-pstream/internals/VideoClickTarget";
import { VideoContainer } from "src/components/player-pstream/internals/VideoContainer";
import { WatchPartyResetter } from "src/components/player-pstream/internals/WatchPartyResetter";
import { PlayerHoverState } from "src/stores/player-pstream/slices/interface";
import { usePlayerStore } from "src/stores/player-pstream/store";

import { WatchPartyReporter } from "../internals/Backend/WatchPartyReporter";

export interface PlayerProps {
  children?: ReactNode;
  showingControls: boolean;
  onLoad?: () => void;
}

function useHovering(containerEl: RefObject<HTMLDivElement>) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateInterfaceHovering = usePlayerStore(
    (s) => s.updateInterfaceHovering,
  );
  const hovering = usePlayerStore((s) => s.interface.hovering);

  useEffect(() => {
    if (!containerEl.current) return;
    const el = containerEl.current;

    function pointerMove(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      updateInterfaceHovering(PlayerHoverState.MOUSE_HOVER);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        updateInterfaceHovering(PlayerHoverState.NOT_HOVERING);
        timeoutRef.current = null;
      }, 3000);
    }

    function pointerLeave(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      updateInterfaceHovering(PlayerHoverState.NOT_HOVERING);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }

    el.addEventListener("pointermove", pointerMove);
    el.addEventListener("pointerleave", pointerLeave);

    return () => {
      el.removeEventListener("pointermove", pointerMove);
      el.removeEventListener("pointerleave", pointerLeave);
    };
  }, [containerEl, hovering, updateInterfaceHovering]);
}

function BaseContainer(props: { children?: ReactNode }) {
  const containerEl = useRef<HTMLDivElement | null>(null);
  const display = usePlayerStore((s) => s.display);
  useHovering(containerEl);

  // report container element to display interface
  useEffect(() => {
    if (display && containerEl.current) {
      display.processContainerElement(containerEl.current);
    }
  }, [display, containerEl]);

  return (
    <div ref={containerEl}>
      <OverlayDisplay>
        <div className="h-screen select-none">{props.children}</div>
      </OverlayDisplay>
    </div>
  );
}

export function Container(props: PlayerProps) {
  const propRef = useRef(props.onLoad);
  useEffect(() => {
    propRef.current?.();
  }, []);

  return (
    <div className="relative">
      <BaseContainer>
        <MetaReporter />
        <ThumbnailScraper />
        <CastingInternal />
        <VideoContainer />
        <ProgressSaver />
        <KeyboardEvents />
        <MediaSession />
        <WatchPartyReporter />
        <SkipTracker />
        <WatchPartyResetter />
        <div className="relative h-screen overflow-hidden">
          <VideoClickTarget showingControls={props.showingControls} />
          <HeadUpdater />
          {props.children}
        </div>
      </BaseContainer>
    </div>
  );
}
