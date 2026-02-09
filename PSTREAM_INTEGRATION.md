# P-Stream Player Integration Guide

## Overview

This guide explains how to integrate the full P-Stream player into the migrated Vite + React Router MNFLIX application.

## Prerequisites

- Access to P-Stream player source code
- Understanding of Zustand state management
- Familiarity with React Router v6

## Integration Steps

### 1. Copy P-Stream Player Components

Copy the entire P-Stream player component directory:

```bash
# From P-Stream repository
cp -r path/to/pstream/src/components/player/* src/components/player/
```

This includes:
- Player.tsx (main player component)
- atoms/ (UI atoms)
- base/ (base components)
- internals/ (internal player logic)
- display/ (display interface)
- hooks/ (player hooks)
- utils/ (player utilities)

### 2. Copy P-Stream Stores

Copy the P-Stream Zustand stores:

```bash
# From P-Stream repository
cp -r path/to/pstream/src/stores/player/* src/stores/player/
```

This includes:
- store.ts (main Zustand store)
- slices/ (state slices)
  - interface.ts
  - source.ts
  - casting.ts
  - [other slices]
- utils/ (store utilities)

### 3. Update Player Page

Update `src/pages/Player.tsx` to use the P-Stream player:

```tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Player } from '@/components/player'
import { usePlayer } from '@/stores/player/hooks/usePlayer'
import { getZenflifyMovieStreams } from '@/services/zenflify'

export default function PlayerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { playMedia, setSource } = usePlayer()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStreams = async () => {
      try {
        // Fetch streams from Zenflify
        const streams = await getZenflifyMovieStreams(Number(id), 'Movie Title')
        
        if (streams.streams && streams.streams.length > 0) {
          // Set the first stream as the source
          setSource(streams.streams[0].url)
          playMedia()
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Failed to load streams:', error)
        setLoading(false)
      }
    }

    loadStreams()
  }, [id])

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading player...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <Player onBack={handleBack} />
    </div>
  )
}
```

### 4. Install Additional Dependencies

If P-Stream requires additional packages not already in package.json:

```bash
npm install [additional-packages]
```

### 5. Configure Player for Zenflify

The player should work with Zenflify streams out of the box. The key integration points are:

1. **Stream Loading**: Use `getZenflifyMovieStreams()` or `getZenflifySeriesStreams()` from `src/services/zenflify.ts`
2. **Source Setting**: Pass the stream URL to the P-Stream player
3. **Subtitles**: Zenflify subtitles can be passed to the player's subtitle system

### 6. Test the Integration

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to a movie detail page
3. Click "Play" to test the player
4. Verify:
   - Video playback works
   - Controls are functional
   - Subtitles work (if available)
   - Quality selection works
   - Progress tracking works

## Environment Configuration

Ensure these environment variables are set in `.env`:

```env
VITE_API_URL=http://localhost:4000
VITE_OMDB_API_KEY=your_key_here
VITE_PROVIDER_URL=http://localhost:3001
VITE_APP_NAME=MNFLIX
```

## Zenflify Integration Details

### Movie Streams

```typescript
import { getZenflifyMovieStreams } from '@/services/zenflify'

const streams = await getZenflifyMovieStreams(tmdbId, title)
// Returns: { streams: [...], subtitles: [...], count, cached, fresh }
```

### Series/Episode Streams

```typescript
import { getZenflifySeriesStreams } from '@/services/zenflify'

const streams = await getZenflifySeriesStreams(tmdbId, season, episode, title)
// Returns: { streams: [...], subtitles: [...], count, cached, fresh }
```

### Anime Streams

```typescript
import { getZenflifyAnimeStreams } from '@/services/zenflify'

const streams = await getZenflifyAnimeStreams(tmdbId, season, episode, title)
// Returns: { streams: [...], subtitles: [...], count, cached, fresh }
```

## Progress Tracking

The progress tracking utilities are already migrated and available:

```typescript
import {
  getStoredProgress,
  saveStoredProgress,
  clearStoredProgress,
} from '@/utils/progressUtils'

// Get saved progress
const position = getStoredProgress(movieId, season, episode)

// Save progress
saveStoredProgress(movieId, season, episode, currentTime, duration)

// Clear progress
clearStoredProgress(movieId, season, episode)
```

## Troubleshooting

### Issue: Player not loading

**Solution**: Check browser console for errors. Ensure all P-Stream dependencies are installed.

### Issue: Streams not playing

**Solution**: 
1. Verify Zenflify backend is running
2. Check `VITE_API_URL` in `.env`
3. Verify CORS configuration on backend
4. Check browser network tab for failed requests

### Issue: Subtitles not showing

**Solution**: 
1. Verify Zenflify returns subtitle data
2. Check subtitle format (should be VTT or SRT)
3. Verify subtitle URLs are accessible

### Issue: Progress not saving

**Solution**:
1. Check localStorage is available
2. Verify progress tracking is called in player
3. Check for any localStorage quota errors

## Advanced Configuration

### Custom Player Styling

P-Stream player styles can be customized in `src/components/player/styles/`.

### Custom Controls

Additional controls can be added to the player by extending the controls component.

### Custom Shortcuts

Keyboard shortcuts can be customized in the player's keyboard handler.

## Performance Optimization

1. **Lazy Loading**: Player components are already code-split
2. **Stream Quality**: Set default quality based on user's connection
3. **Buffering**: Configure buffer sizes in player settings
4. **Caching**: Enable service worker for offline support (optional)

## Security Considerations

1. **Token Refresh**: Implement token refresh in `src/utils/api.ts`
2. **Stream URLs**: Ensure stream URLs are properly authenticated
3. **CORS**: Configure CORS on backend for player domains
4. **CSP**: Configure Content Security Policy for video sources

## Next Steps

After integration:

1. Test on multiple browsers
2. Test on mobile devices
3. Implement watch history sync with backend
4. Add analytics tracking
5. Implement error reporting
6. Add quality auto-switching based on bandwidth
7. Add chromecast/airplay support (if in P-Stream)

## Support

For issues specific to:
- P-Stream player: Refer to P-Stream documentation
- Zenflify integration: Check backend API documentation
- React Router: Check React Router v6 documentation
- Vite: Check Vite documentation
