# P-Stream Player Integration Mapping

## Files Copied Summary

### Total Files: ~270 TypeScript/TSX files

## Directory Structure Mapping

### Player Components
**Source:** `/tmp/p-stream/src/components/player/`  
**Destination:** `src/components/player-pstream/`  
**Files:** 100 files
- `atoms/` - Player UI atoms (buttons, controls, settings)
- `base/` - Base player components (Container, Controls, etc.)
- `display/` - Display logic and video rendering
- `hooks/` - Player-specific hooks
- `internals/` - Internal components (BookmarkButton, ContextMenu, etc.)
- `utils/` - Player utility functions
- `index.tsx`, `Player.tsx`, `README.md`, `TIDBSubmissionForm.tsx`

### Player Store
**Source:** `/tmp/p-stream/src/stores/player/`  
**Destination:** `src/stores/player-pstream/`  
**Files:** 12 files
- `slices/` - Store slices (casting, display, interface, playing, progress, skipSegments, source, thumbnails, types)
- `utils/qualities.ts`
- `store.ts`, `types.ts`

### Related Stores
1. **Subtitles Store**
   - Source: `/tmp/p-stream/src/stores/subtitles/`
   - Destination: `src/stores/subtitles/`

2. **Volume Store**
   - Source: `/tmp/p-stream/src/stores/volume/`
   - Destination: `src/stores/volume/`

3. **Quality Store**
   - Source: `/tmp/p-stream/src/stores/quality/`
   - Destination: `src/stores/quality/`

4. **Progress Store**
   - Source: `/tmp/p-stream/src/stores/progress/`
   - Destination: `src/stores/progress-pstream/`

5. **Overlay Store**
   - Source: `/tmp/p-stream/src/stores/overlay/`
   - Destination: `src/stores/overlay/`

6. **Theme Store**
   - Source: `/tmp/p-stream/src/stores/theme/`
   - Destination: `src/stores/theme/`

7. **Additional Stores** (Required by player):
   - `src/stores/auth/`
   - `src/stores/banner/`
   - `src/stores/bookmarks/`
   - `src/stores/interface/`
   - `src/stores/language/`
   - `src/stores/preferences/`
   - `src/stores/watchParty.ts`

### Shared Components
**Source:** `/tmp/p-stream/src/components/`  
**Destination:** `src/components/pstream-shared/`  
**Subdirectories:**
- `buttons/` - Button components (Button, Toggle)
- `form/` - Form components (Dropdown, etc.)
- `layout/` - Layout components (Loading, ProgressRing, Spinner)
- `overlays/` - Overlay components (Modal, OverlayAnchor, OverlayDisplay, OverlayPage, OverlayRouter)
- `text-inputs/` - Text input components (AuthInputBox)
- `utils/` - Utility components (Flare, Text, Transition)
- Root: `DropFile.tsx`, `FlagIcon.tsx`, `Icon.tsx`

### Utilities
**Source:** `/tmp/p-stream/src/utils/`  
**Destination:** `src/utils/pstream/`  
**Files:**
- `autoplay.ts`
- `cdn.ts`
- `detectFeatures.ts`
- `events.ts`
- `formatSeconds.ts`
- `keyboardShortcuts.ts`
- `language.ts`
- `proxyUrls.ts`
- `scroll.ts`
- `tidb.ts`
- `turnstile.ts`
- `uses12HourClock.ts`

### Backend
**Source:** `/tmp/p-stream/src/backend/`  
**Destination:** `src/backend/pstream/`  
**Includes:**
- `accounts/` - Account management (meta, settings)
- `extension/` - Extension messaging and streams
- `helpers/` - Helper functions (fetch, providerApi, report, subs)
- `metadata/` - Metadata handling (getmeta, tmdb, types)
- `player/` - Player status
- `providers/` - Provider fetchers and logic

### Hooks
**Source:** `/tmp/p-stream/src/hooks/`  
**Destination:** `src/hooks/pstream/`  
**Files:**
- `auth/` - Auth hooks (useBackendUrl)
- `useChromecastAvailable.ts`
- `useDebounce.ts`
- `useEmbedOrderState.ts`
- `useGlobalKeyboardEvents.ts`
- `useIntersectionObserver.ts`
- `useIsDesktopApp.ts`
- `useIsMobile.ts`
- `useIsTv.ts`
- `useOverlayRouter.ts`
- `usePing.ts`
- `useProgressBar.ts`
- `useProviderScrape.tsx`
- `useQueryParams.ts`
- `useRandomTranslation.ts`
- `useSearchQuery.ts`
- `useSettingsState.ts`
- `useWatchPartySync.ts`

## Import Path Changes

All import paths have been updated:

### Original → New Mapping
- `@/components/player` → `@/components/player-pstream`
- `@/stores/player` → `@/stores/player-pstream`
- `@/stores/progress` → `@/stores/progress-pstream`
- `@/stores/*` → `@/stores/*` (subtitles, volume, quality, overlay, theme, etc.)
- `@/components/[shared]` → `@/components/pstream-shared/[shared]`
- `@/utils` → `@/utils/pstream`
- `@/backend` → `@/backend/pstream`
- `@/hooks` → `@/hooks/pstream`

**Note:** MNFLIX already has `@/` alias configured in `vite.config.ts` and `tsconfig.json` to resolve to `./src/`, so all paths work correctly.

## Missing Dependencies

These dependencies from P-Stream are NOT in MNFLIX and may need to be installed:

### Critical (Player likely won't work without these):
- `classnames` - CSS class name utility
- `immer` - Immutable state updates (used by Zustand)
- `nanoid` - Unique ID generation
- `focus-trap-react` - Focus management for modals
- `dompurify` - XSS sanitization

### UI/UX (May be needed for full functionality):
- `@headlessui/react` - Unstyled UI components
- `@react-spring/web` - Animation library
- `@formkit/auto-animate` - Auto-animation utilities

### DnD (If drag-and-drop is used):
- `@dnd-kit/core`
- `@dnd-kit/modifiers`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

### Internationalization (Already partially covered):
- `@ladjs/country-language` - Language/country data
- `@sozialhelden/ietf-language-tags` - IETF language tag utilities
- `iso-639-3` - ISO language codes
- `flag-icons` - Country flag icons

### Utilities:
- `fuse.js` - Fuzzy search
- `lodash.merge` - Object merging
- `ofetch` - Fetch wrapper
- `semver` - Semantic versioning
- `slugify` - String slugification
- `subsrt-ts` - Subtitle parsing

### Provider-specific:
- `@p-stream/providers` - P-Stream's provider library (private GitHub repo)
- `wyzie-lib` - Wyzie integration library

### Crypto/Security:
- `@noble/hashes` - Cryptographic hashing
- `@scure/bip39` - BIP39 mnemonic generation
- `node-forge` - Crypto toolkit
- `jwt-decode` - JWT decoding

### Other:
- `detect-browser` - Browser detection
- `react-sticky-el` - Sticky elements
- `react-lazy-with-preload` - Lazy loading with preload
- `@marsidev/react-turnstile` - Cloudflare Turnstile

## Dependencies Already in MNFLIX ✅
- `react`, `react-dom` ✅
- `react-router-dom` ✅
- `zustand` ✅
- `hls.js` ✅ (v1.6.15, P-Stream uses 1.6.13)
- `fscreen` ✅
- `i18next`, `react-i18next` ✅
- `react-use` ✅
- `@tabler/icons-react` ✅ (may conflict with P-Stream's Icon usage)

## Minimum Dependencies to Add

To test compilation, install at minimum:
```bash
npm install classnames immer nanoid focus-trap-react dompurify @headlessui/react @react-spring/web
```

## API Integration Points

### Files that need Zenflify API integration:
1. **Video Source Fetching:**
   - `src/backend/pstream/providers/` - Provider logic
   - `src/stores/player-pstream/slices/source.ts` - Source management
   - Need to connect to: `GET /api/streams/{movieId}`

2. **Subtitles:**
   - `src/stores/subtitles/` - Subtitle management
   - `src/backend/pstream/helpers/subs.ts` - Subtitle helpers
   - Need to connect to: `GET /api/subtitles/{movieId}`

3. **Watch Progress:**
   - `src/stores/progress-pstream/` - Progress tracking
   - `src/backend/pstream/player/status.ts` - Status reporting
   - Need to connect to: `POST /api/progress/{movieId}`

4. **Metadata:**
   - `src/backend/pstream/metadata/` - Metadata fetching
   - May need to use existing MNFLIX metadata APIs

## P-Stream-Specific Features Present

### Features to Review/Remove:
1. **Watch Party** (`src/stores/watchParty.ts`, sync components)
2. **Extension Integration** (`src/backend/pstream/extension/`)
3. **Turnstile/Captcha** (`src/utils/pstream/turnstile.ts`)
4. **TIDB Integration** (`src/utils/pstream/tidb.ts`, `TIDBSubmissionForm.tsx`)
5. **Bookmarking** (`src/stores/bookmarks/`, BookmarkButton)
6. **Banner System** (`src/stores/banner/`)
7. **Auth System** (`src/stores/auth/`) - May conflict with MNFLIX auth
8. **Onboarding** (referenced in some stores)
9. **Desktop App Features** (`useIsDesktopApp.ts`)
10. **Chromecast** (`atoms/Chromecast.tsx`)

### Features to Keep:
1. **Core Player UI** (controls, overlays, displays)
2. **Quality Selection**
3. **Volume Control**
4. **Subtitle Support**
5. **Progress Tracking**
6. **Keyboard Shortcuts**
7. **HLS/Video Playback**
8. **Theming**

## Next Steps

1. ✅ Copy all files (DONE)
2. ✅ Fix import paths (DONE)
3. ⏳ Install minimum dependencies
4. ⏳ Test compilation
5. ⏳ Identify and fix TypeScript errors
6. ⏳ Create integration wrapper component
7. ⏳ Connect to Zenflify APIs
8. ⏳ Remove/disable unnecessary features
9. ⏳ Test player in MNFLIX context
10. ⏳ Document API integration points

## Testing Command
```bash
npm install
npm run build
```

## Known Issues to Address
- TypeScript errors due to missing dependencies
- API endpoints need to be replaced with Zenflify URLs
- Auth system may need to be adapted to MNFLIX's auth
- Provider system from P-Stream may not be needed if using Zenflify directly
