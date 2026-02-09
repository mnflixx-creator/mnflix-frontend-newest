import { StateCreator } from "zustand";

import { CastingSlice } from "src/stores/player-pstream/slices/casting";
import { DisplaySlice } from "src/stores/player-pstream/slices/display";
import { InterfaceSlice } from "src/stores/player-pstream/slices/interface";
import { PlayingSlice } from "src/stores/player-pstream/slices/playing";
import { ProgressSlice } from "src/stores/player-pstream/slices/progress";
import { SkipSegmentsSlice } from "src/stores/player-pstream/slices/skipSegments";
import { SourceSlice } from "src/stores/player-pstream/slices/source";
import { ThumbnailSlice } from "src/stores/player-pstream/slices/thumbnails";

export type AllSlices = InterfaceSlice &
  PlayingSlice &
  ProgressSlice &
  SourceSlice &
  DisplaySlice &
  CastingSlice &
  ThumbnailSlice &
  SkipSegmentsSlice;
export type MakeSlice<Slice> = StateCreator<
  AllSlices,
  [["zustand/immer", never]],
  [],
  Slice
>;
