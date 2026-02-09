# Next Steps to Complete P-Stream Integration

## Immediate Actions Required

### 1. Install Missing Package
```bash
npm install @plasmohq/messaging --save-dev
# OR stub it if not needed
```

### 2. Fix @noble/hashes and @scure/bip39 Imports

These packages are installed but TypeScript can't find submodule imports. Two options:

**Option A: Create ambient declarations**
Create `src/types/external-modules.d.ts`:
```typescript
declare module '@noble/hashes/pbkdf2' {
  export function pbkdf2(password: Uint8Array, salt: Uint8Array, opts: any): Uint8Array;
}

declare module '@noble/hashes/sha256' {
  export function sha256(data: Uint8Array): Uint8Array;
}

declare module '@scure/bip39/wordlists/english' {
  const wordlist: string[];
  export { wordlist };
}
```

**Option B: Update tsconfig.json**
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",  // or "node16"
    "resolveJsonModule": true
  }
}
```

### 3. Create Missing Stub Files

Run these commands to create required stubs:

```bash
# Create media components
mkdir -p src/components/media
cat > src/components/media/MediaCard.tsx << 'EOF'
export function MediaCard() { return null; }
EOF

cat > src/components/media/MediaBookmark.tsx << 'EOF'
export function MediaBookmark() { return null; }
EOF

# Create discover components
mkdir -p src/pages/discover/components
cat > src/pages/discover/components/CarouselNavButtons.tsx << 'EOF'
export function CarouselNavButtons() { return null; }
EOF

# Create migration utils
mkdir -p src/pages/migration
cat > src/pages/migration/utils.ts << 'EOF'
export function migrationVersion() { return '1.0.0'; }
EOF

# Create chromecast setup
mkdir -p src/setup
cat > src/setup/chromecast.ts << 'EOF'
export function initializeChromecast() { return Promise.resolve(); }
export const chromecastAvailable = false;
EOF

# Create backend accounts
mkdir -p src/backend/accounts
cat > src/backend/accounts/bookmarks.ts << 'EOF'
export function getBookmarks() { return Promise.resolve([]); }
EOF

# Create auth hook
mkdir -p src/hooks/auth
cat > src/hooks/auth/useBackendUrl.ts << 'EOF'
export function useBackendUrl() { return null; }
EOF

# Create text Link component  
mkdir -p src/components/pstream-shared/text
cat > src/components/pstream-shared/text/Link.tsx << 'EOF'
export function Link({ children }: any) { return <a>{children}</a>; }
EOF

# Create scrapers
cat > src/utils/pstream/imdbScraper.ts << 'EOF'
export async function scrapeImdb() { return null; }
EOF

cat > src/utils/pstream/rottenTomatoesScraper.ts << 'EOF'
export async function scrapeRottenTomatoes() { return null; }
EOF

# Fix preferences store reference
cat > src/components/pstream-shared/stores/preferences.ts << 'EOF'
import { create } from 'zustand';
export const usePreferencesStore = create(() => ({}));
EOF
```

### 4. Simplify by Removing Features

**Create a script to comment out unnecessary files:**

```bash
# Comment out Watch Party
sed -i '1i // DISABLED: Watch Party feature not needed for MNFLIX' \
  src/components/player-pstream/atoms/WatchPartyStatus.tsx \
  src/components/player-pstream/internals/Backend/WatchPartyReporter.tsx \
  src/backend/pstream/player/status.ts

# Comment out Extension
for file in src/backend/pstream/extension/*.ts; do
  sed -i '1i // DISABLED: Browser extension not needed for MNFLIX' "$file"
done

# Comment out Accounts  
for file in src/backend/pstream/accounts/*.ts; do
  sed -i '1i // DISABLED: Account system not needed for MNFLIX' "$file"
done
```

### 5. Test Compilation

```bash
npm run build 2>&1 | tee build-errors.log
```

### 6. Create Zenflify API Adapter

Create `src/adapters/zenflify-to-pstream.ts`:

```typescript
import { getZenflifyMovieStreams } from '@/services/zenflify';

export interface PStreamSource {
  id: string;
  type: 'hls' | 'mp4';
  url: string;
  quality: { height: number };
  captions?: PStreamCaption[];
}

export interface PStreamCaption {
  id: string;
  language: string;
  url: string;
  type: string;
}

export async function loadSourcesForMovie(movieId: string): Promise<{
  sources: PStreamSource[];
  captions: PStreamCaption[];
}> {
  const data = await getZenflifyMovieStreams(parseInt(movieId), 'Video');
  
  // Convert Zenflify format to P-Stream format
  const sources: PStreamSource[] = (data.streams || data.sources || []).map((stream, idx) => ({
    id: `source-${idx}`,
    type: stream.url.includes('.m3u8') ? 'hls' : 'mp4',
    url: stream.url,
    quality: { height: parseInt(stream.quality) || 1080 },
  }));

  const captions: PStreamCaption[] = (data.subtitles || []).map((sub, idx) => ({
    id: `caption-${idx}`,
    language: sub.language || sub.label || 'en',
    url: sub.url,
    type: sub.kind || 'subtitles',
  }));

  return { sources, captions };
}
```

### 7. Update PStreamPlayer.tsx

Update the integration page to use the adapter:

```typescript
import { loadSourcesForMovie } from '@/adapters/zenflify-to-pstream';

// In loadVideo function:
const { sources, captions } = await loadSourcesForMovie(id);
setSources(sources);
setCaptions(captions);
```

### 8. Update Router

In `src/App.tsx` or your router file:

```typescript
import PStreamPlayer from '@/pages/PStreamPlayer';

// Add route
<Route path="/player/:id" element={<PStreamPlayer />} />
```

## Testing Checklist

Once compilation succeeds:

- [ ] Navigate to `/player/{movieId}`
- [ ] Video should load and play
- [ ] Controls should appear and auto-hide
- [ ] Quality selector should work
- [ ] Subtitle selector should work
- [ ] Keyboard shortcuts should work (space, f, m, arrows)
- [ ] Fullscreen should work
- [ ] Volume control should work
- [ ] Progress bar should work

## If Build Still Fails

### Nuclear Option: Skip TypeScript Check

Temporarily bypass TypeScript errors to test runtime:

```json
// package.json
{
  "scripts": {
    "build:skip-check": "vite build"
  }
}
```

Then manually fix runtime errors one by one.

## Alternative: Minimal Player Approach

If the above is too complex, create a minimal player using only core P-Stream components:

1. Keep only: `display/HLSPlayer.tsx`, `atoms/` components
2. Remove all: backend, internals (except KeyboardEvents), shared components
3. Create simple Container wrapper
4. Direct integration with Zenflify API

This reduces complexity from 270 files to ~20 files.
