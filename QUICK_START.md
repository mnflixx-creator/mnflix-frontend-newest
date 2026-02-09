# P-Stream Player - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Backend API with Zenflify endpoints running
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📺 Using the Player

### Basic Usage
Navigate to `/play/{movieId}` to watch content. The player will:
1. Fetch content details from backend
2. Check subscription status
3. Load streaming sources from Zenflify
4. Initialize Shaka Player with HLS support
5. Restore watch progress if available

### Player Controls

#### Mouse/Touch Controls
- **Click video**: Play/Pause
- **Click progress bar**: Seek to position
- **Move mouse**: Show controls (auto-hide after 3s)
- **Center play button**: Start playback

#### Keyboard Shortcuts
- **Space**: Play/Pause
- **F**: Toggle Fullscreen
- **M**: Mute/Unmute
- **C**: Toggle Captions/Subtitles
- **← (Left Arrow)**: Seek backward 10 seconds
- **→ (Right Arrow)**: Seek forward 10 seconds
- **ESC**: Exit fullscreen

#### Bottom Control Bar
- **Play/Pause Button**: Toggle playback
- **Time Display**: Shows current time / total duration
- **Server Switch**: Switch between available streaming servers
- **Episode Selector** (series only): Navigate episodes and seasons
  - Previous/Next episode buttons
  - Season dropdown
  - Episode dropdown
- **Speed Selector**: Change playback speed (0.5x - 2x)
- **Quality Selector**: Choose video quality (when available)
- **Settings Menu**: Manage subtitles/captions
- **Volume Slider** (desktop only): Adjust volume with mute button
- **Picture-in-Picture**: Toggle PiP mode
- **Fullscreen**: Toggle fullscreen mode

#### Top Control Bar
- **Back Button**: Return to content details page
- **Title**: Shows content title with episode info
- **Info Button**: (Placeholder for future feature)
- **Bookmark Button**: (Placeholder for future feature)

## 🎬 For Series Content

### Episode Navigation
The player automatically displays episode navigation for series, kdrama, cdrama, and anime:

1. **Season Selector**: Dropdown showing all available seasons
2. **Episode Selector**: Dropdown showing episodes with titles
3. **Previous Button**: Navigate to previous episode
4. **Next Button**: Navigate to next episode

Navigation automatically handles:
- Moving between episodes within a season
- Advancing to next season when reaching last episode
- Going back to previous season when on first episode
- Saving current episode position to localStorage

### Progress Tracking
- Automatically saves progress every 5 seconds
- Restores progress when returning to content
- Tracks progress per episode for series
- Marks content as complete at 93% watched
- Syncs with backend API

## 🔧 Backend API Requirements

The player expects these endpoints:

### Movie Streaming
```
GET /api/zentlify/movie/{tmdbId}?title={title}
```

### Series Streaming
```
GET /api/zentlify/series/{tmdbId}?season={season}&episode={episode}&title={title}
```

### Anime Streaming
```
GET /api/zentlify/anime/{tmdbId}?season={season}&episode={episode}&title={title}
```

### Expected Response Format
```json
{
  "streams": [
    {
      "url": "https://stream.example.com/video.m3u8",
      "name": "Server 1",
      "provider": "lush",
      "quality": "1080p"
    }
  ],
  "subtitles": [
    {
      "url": "https://subtitles.example.com/english.vtt",
      "label": "English",
      "language": "en",
      "kind": "subtitles"
    }
  ]
}
```

### Progress Saving
```
POST /api/progress/save
Content-Type: application/json

{
  "movieId": "abc123",
  "position": 1234.56,
  "duration": 5400,
  "season": 1,     // For series only
  "episode": 1     // For series only
}
```

## 📱 Mobile Support

### Mobile Optimizations
- Touch-friendly button sizes
- Hidden volume control (uses native controls)
- Large tap targets for all controls
- Responsive text sizes
- Touch detection for showing controls
- Mobile-responsive progress bar

### Supported Gestures
- **Tap video**: Play/Pause
- **Tap controls**: Show controls for 3 seconds
- **Swipe progress bar**: Seek to position
- **Pinch**: Native browser zoom (in some browsers)

## 🎨 Customization

### Styling
All components use Tailwind CSS. To customize:
- Edit component files in `components/player/`
- Modify Tailwind classes in JSX
- Update `tailwind.config.js` for global changes

### Colors
- Progress bar: `bg-red-600` (#DC2626)
- Controls background: `bg-black/80`
- Hover effects: `hover:bg-white/10`
- Text: `text-white`

### Animations
- Control fade: `duration-300`
- Progress bar: `duration-150`
- Hover transitions: `duration-200`

## 🐛 Troubleshooting

### Player Not Loading
1. Check browser console for errors
2. Verify Zenflify API is accessible
3. Check network tab for API responses
4. Ensure tmdbId is valid

### Video Not Playing
1. Check if browser supports HLS (via Shaka Player)
2. Verify stream URL is accessible
3. Check for CORS issues
4. Try switching servers using server button

### Subtitles Not Working
1. Check subtitle URL is accessible
2. Verify subtitle format is VTT
3. Check subtitle language code
4. Try toggling captions on/off

### Controls Not Hiding
1. Check mouse movement detection
2. Verify 3-second timeout is active
3. Check console for JavaScript errors

## 📊 Performance Tips

### Optimization
- Player uses Shaka Player's built-in buffering
- Progress saves only every 5 seconds (not on every frame)
- Controls use CSS transitions (GPU accelerated)
- Event listeners are properly cleaned up

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (WebKit fullscreen API)
- **Mobile Safari**: Full support with touch controls
- **Mobile Chrome**: Full support

## 📚 Additional Resources

- **PLAYER_IMPLEMENTATION.md**: Detailed implementation guide
- **COMPONENT_STRUCTURE.md**: Component architecture diagram
- **IMPLEMENTATION_SUMMARY.md**: Comprehensive feature summary
- **components/player/README.md**: Component-level documentation

## 🆘 Support

For issues or questions:
1. Check existing documentation files
2. Review component source code (well-commented)
3. Check browser console for error messages
4. Verify backend API is responding correctly

## ✨ Features at a Glance

- ✅ HLS and MP4 streaming support
- ✅ Multi-server switching
- ✅ Episode navigation for series
- ✅ Progress tracking and restoration
- ✅ Subtitle/Caption support
- ✅ Playback speed control (6 speeds)
- ✅ Quality selection (UI ready)
- ✅ Keyboard shortcuts
- ✅ Auto-hide controls (3s timeout)
- ✅ Fullscreen support
- ✅ Picture-in-Picture support
- ✅ Mobile responsive design
- ✅ Professional P-Stream styling
- ✅ Dark theme with blur effects
- ✅ Smooth animations
- ✅ Error handling
- ✅ Loading states

## 🚀 Production Deployment

### Checklist
- [x] Build successful (`npm run build`)
- [x] No security vulnerabilities (`npm audit`)
- [x] Environment variables configured
- [x] Backend API accessible
- [x] CORS configured properly
- [x] CDN configured (if using)
- [x] Error tracking enabled
- [x] Analytics integrated (optional)

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

That's it! You're ready to use the P-Stream player. 🎉
