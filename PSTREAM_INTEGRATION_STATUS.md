# P-Stream Player Integration Status

## ✅ Completed

### 1. Full P-Stream Codebase Copied (270+ files)
- **Player Components** (100 files) → `src/components/player-pstream/`
  - All atoms (buttons, controls, settings menus)
  - All base components (Container, TopControls, BottomControls, etc.)
  - All display interfaces (HLS.js, Chromecast)
  - All hooks (usePlayer, useInitializePlayer, useCaptions, etc.)
  - All internals (KeyboardEvents, ProgressSaver, MediaSession, etc.)
  - All utilities (captions, proxy, mediaErrorDetails, etc.)

- **Zustand Stores** (27 stores) → `src/stores/`
  - Player store with 8 slices (interface, playing, progress, source, display, casting, thumbnail, skipSegments)
  - Auth, bookmarks, language, preferences, subtitles, theme, volume, quality, progress, overlay, etc.

- **Backend Services** (40+ files) → `src/backend/pstream/`
  - Accounts, extension, helpers, metadata, player, providers

- **Shared Components** (40+ files) → `src/components/pstream-shared/`
  - Buttons, form, layout, overlays, text-inputs, utils

- **Hooks** (20+ files) → `src/hooks/pstream/`
  - Auth, chromecast, overlay, progress, etc.

- **Utilities** (15 files) → `src/utils/pstream/`
  - Autoplay, cache, CDN, events, formatting, etc.

### 2. Dependencies Installed
- @types/chromecast-caf-sender
- @dnd-kit (core, modifiers, sortable, utilities)
- classnames, immer, nanoid, dompurify, focus-trap-react
- @headlessui/react, @react-spring/web, @formkit/auto-animate
- ofetch, @noble/hashes, @scure/bip39, node-forge, jwt-decode
- fuse.js, lodash.merge, slugify, subsrt-ts, detect-browser
- react-helmet-async, semver, language/country utilities

### 3. Import Paths Fixed
- Updated 267 TypeScript/TSX files
- Fixed `@/` import aliases
- Fixed auth store import paths

### 4. Stub Components Created
- Icon, UserIcon, Avatar components
- Legal pages, SubPageLayout
- LinksDropdown
- bookmarkModifications utility
- @p-stream/providers stub module

### 5. Integration Page Created
- `src/pages/PStreamPlayer.tsx` - Demonstrates P-Stream UI integration with Zenflify backend

## ⚠️ Remaining Work

### 1. Fix Compilation Errors (~50 remaining)

**Missing npm packages:**
```bash
npm install @plasmohq/messaging
```

**Missing type stubs needed:**
- @noble/hashes/pbkdf2, @noble/hashes/sha256 (already installed, but submodule imports failing)
- @scure/bip39/wordlists/english (already installed, but submodule imports failing)

**Missing components/utilities to stub:**
- `@/components/media/MediaCard`
- `@/components/media/MediaBookmark`
- `@/pages/discover/components/CarouselNavButtons`
- `@/pages/migration/utils`
- `@/setup/chromecast`
- `@/backend/accounts/bookmarks`
- `@/hooks/auth/useBackendUrl`
- `@/utils/bookmarkModifications` (needs more exports)
- `src/utils/pstream/imdbScraper`
- `src/utils/pstream/rottenTomatoesScraper`
- `../text/Link` component
- `../UserIcon` in pstream-shared/form
- `../../stores/preferences` in pstream-shared/utils

### 2. Remove Unnecessary P-Stream Features

P-Stream includes many features MNFLIX doesn't need:
- **Watch Party** - Multiplayer viewing (backend/player/status.ts, WatchPartyReporter, etc.)
- **Browser Extension** - Chrome extension integration (backend/extension/*)
- **Account System** - P-Stream accounts (backend/accounts/*)
- **Bookmarks** - User bookmarks (stores/bookmarks, BookmarkSyncer)
- **TMDB Metadata** - Movie database integration (backend/metadata/tmdb)
- **Provider Scraping** - Third-party source scraping (@p-stream/providers)

**Recommendation**: Comment out or remove these features to reduce compilation errors.

### 3. Zenflify API Integration

The P-Stream player expects specific data structures. Need to create adapters:

**Required:**
- `/api/streams/{movieId}` → P-Stream Source format
- `/api/subtitles/{movieId}` → P-Stream Caption format  
- `/api/progress/{movieId}` → Watch progress saving

**Data Format Adapters:**
```typescript
// Zenflify → P-Stream format
interface ZenflifyStream {
  url: string
  quality: string
  type: string
}

interface PStreamSource {
  id: string
  type: 'hls' | 'mp4'
  url: string
  quality: { height: number }
  captions?: Caption[]
}
```

### 4. Router Integration

Update `src/App.tsx` or router configuration to use P-Stream player:
```typescript
import PStreamPlayer from '@/pages/PStreamPlayer'

// Add route
<Route path="/player/:id" element={<PStreamPlayer />} />
```

### 5. Testing Checklist
- [ ] Player loads and displays video
- [ ] HLS.js streams work correctly
- [ ] Quality selector shows available qualities
- [ ] Subtitle selector loads and displays subtitles
- [ ] Controls auto-hide after 3 seconds
- [ ] Keyboard shortcuts work (space, f, m, arrows)
- [ ] Fullscreen mode works
- [ ] Volume control works
- [ ] Progress bar seeking works
- [ ] Settings menu opens
- [ ] Player looks identical to P-Stream reference

## 📋 Quick Start for Developers

### Option 1: Fix All Compilation Errors
1. Install missing packages
2. Create all missing stub components
3. Fix @noble/hashes and @scure/bip39 import issues
4. Remove/comment out Watch Party, Extension, Accounts features
5. Test compilation: `npm run build`

### Option 2: Minimal Working Player
1. Use existing MNFLIX player (`src/components/player/Player.tsx`)
2. Apply P-Stream styling (copy CSS from P-Stream)
3. Use P-Stream's HLS display interface only
4. Keep MNFLIX's control components with P-Stream styles

### Option 3: Hybrid Approach (Recommended)
1. Keep P-Stream player UI components (atoms, base)
2. Remove P-Stream backend/accounts/extension
3. Use Zenflify API directly in player hooks
4. Focus on UI/UX parity, not feature parity

## 🎯 Priority Tasks

1. **HIGH**: Fix compilation errors preventing build
   - Install @plasmohq/messaging or stub it
   - Fix @noble/hashes imports
   - Create missing component stubs

2. **HIGH**: Remove unnecessary features
   - Comment out Watch Party
   - Comment out Extension code
   - Comment out Accounts backend

3. **MEDIUM**: Test HLS playback
   - Verify HLS.js integration works
   - Test with Zenflify streams

4. **MEDIUM**: UI/UX verification
   - Compare with P-Stream reference
   - Adjust styling if needed

5. **LOW**: Advanced features
   - Chromecast support
   - Picture-in-Picture
   - Skip intro/outro
   - Thumbnail preview

## 📝 Notes

- P-Stream is a feature-rich application with 1000+ files
- MNFLIX only needs the video player portion (~100 files)
- Many P-Stream features are tightly coupled to their backend
- A complete 1:1 port may not be practical
- Focus on UI/UX parity for the player itself

## 🔗 References

- P-Stream Repository: https://github.com/p-stream/p-stream
- P-Stream uses HLS.js v1.6.13 for video playback
- P-Stream uses Zustand v4.5.7 for state management
- P-Stream uses TailwindCSS v3.4 for styling
