import type { SegmentData } from "src/components/player-pstream/hooks/useSkipTime";
import { MakeSlice } from "src/stores/player-pstream/slices/types";

export interface SkipSegmentsSlice {
  skipSegmentsCacheKey: string | null;
  skipSegments: SegmentData[];
  setSkipSegments(cacheKey: string, segments: SegmentData[]): void;
  clearSkipSegments(): void;
}

export const createSkipSegmentsSlice: MakeSlice<SkipSegmentsSlice> = (set) => ({
  skipSegmentsCacheKey: null,
  skipSegments: [],
  setSkipSegments(cacheKey, segments) {
    set((s) => {
      s.skipSegmentsCacheKey = cacheKey;
      s.skipSegments = segments;
    });
  },
  clearSkipSegments() {
    set((s) => {
      s.skipSegmentsCacheKey = null;
      s.skipSegments = [];
    });
  },
});
