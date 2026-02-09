import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { createCastingSlice } from "src/stores/player-pstream/slices/casting";
import { createDisplaySlice } from "src/stores/player-pstream/slices/display";
import { createInterfaceSlice } from "src/stores/player-pstream/slices/interface";
import { createPlayingSlice } from "src/stores/player-pstream/slices/playing";
import { createProgressSlice } from "src/stores/player-pstream/slices/progress";
import { createSkipSegmentsSlice } from "src/stores/player-pstream/slices/skipSegments";
import { createSourceSlice } from "src/stores/player-pstream/slices/source";
import { createThumbnailSlice } from "src/stores/player-pstream/slices/thumbnails";
import { AllSlices } from "src/stores/player-pstream/slices/types";

export const usePlayerStore = create(
  immer<AllSlices>((...a) => ({
    ...createInterfaceSlice(...a),
    ...createProgressSlice(...a),
    ...createPlayingSlice(...a),
    ...createSourceSlice(...a),
    ...createDisplaySlice(...a),
    ...createCastingSlice(...a),
    ...createThumbnailSlice(...a),
    ...createSkipSegmentsSlice(...a),
  })),
);
