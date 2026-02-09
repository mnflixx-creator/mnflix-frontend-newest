# P-Stream Player Component Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Player Container                             │
│  (PStreamPlayer.js)                                                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ TopBar Component                                              │  │
│  │ • Back Button  • Title  • Info Button  • Bookmark Button     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │                   Video Element (Shaka Player)                │  │
│  │                                                               │  │
│  │    [Center Play Button] - shown before first play            │  │
│  │    [Loading Spinner] - shown during buffering                │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ PlayerControls Component                                      │  │
│  │                                                               │  │
│  │  Progress Bar (with seek)                                     │  │
│  │  ════════════════════════■═════════════                       │  │
│  │                                                               │  │
│  │  [▶] 12:34 / 45:00  ...  [S1:E2] [⏩] [1x] [HD] [CC] [🔊] [⛶] │  │
│  │                                                               │  │
│  │  Children Slots:                                              │  │
│  │  • Server Switch (if multiple servers)                        │  │
│  │  • EpisodeSelector (for series)                              │  │
│  │  • SpeedSelector (0.5x - 2x)                                 │  │
│  │  • QualitySelector (Auto, 1080p, 720p, etc.)                │  │
│  │  • SettingsMenu (Subtitles/Captions)                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

Component Tree:
================

PStreamPlayer (Main Container)
│
├── TopBar
│   ├── Back Button
│   ├── Title Display
│   ├── Info Button (placeholder)
│   └── Bookmark Button (placeholder)
│
├── Video Element (HTML5 + Shaka Player)
│   ├── Center Play Button (conditional)
│   └── Loading Spinner (conditional)
│
└── PlayerControls
    ├── Progress Bar
    ├── Play/Pause Button
    ├── Time Display
    ├── Children (flexible controls)
    │   ├── Server Switch Button
    │   ├── EpisodeSelector
    │   │   ├── Previous Episode Button
    │   │   ├── Season Dropdown
    │   │   ├── Episode Dropdown
    │   │   └── Next Episode Button
    │   ├── SpeedSelector
    │   │   └── Speed Dropdown (0.5x - 2x)
    │   ├── QualitySelector
    │   │   └── Quality Dropdown
    │   └── SettingsMenu
    │       └── Subtitle Dropdown
    ├── Volume Control (hidden on mobile)
    │   ├── Mute Button
    │   └── Volume Slider
    ├── Picture-in-Picture Button
    └── Fullscreen Button

Data Flow:
==========

app/play/[id]/page.js
  │
  ├─ Fetches movie/series data
  ├─ Manages season/episode state
  ├─ Checks subscription status
  │
  └─► PStreamPlayer
       │
       ├─ Fetches streams from Zenflify
       ├─ Initializes Shaka Player
       ├─ Loads subtitles
       ├─ Manages playback state
       ├─ Handles keyboard shortcuts
       ├─ Saves progress periodically
       │
       └─► Renders UI Components
            │
            ├─► TopBar (title, back button)
            │
            └─► PlayerControls
                 └─► Child Components
                      (episode nav, speed, quality, subtitles)

State Management:
=================

Player State:
• servers - Available stream sources
• activeServer - Current server index
• loading - Initial loading state
• error - Error message
• isPlaying - Playback state
• currentTime - Current playback position
• duration - Total video duration
• volume - Volume level (0-1)
• isMuted - Mute state
• isFullscreen - Fullscreen state
• showControls - Control visibility
• showCenterPlay - Center button visibility
• buffering - Buffering state
• playbackSpeed - Playback rate (0.5-2)
• qualities - Available quality levels
• currentQuality - Selected quality
• subtitles - Available subtitle tracks
• currentSubtitle - Active subtitle

Page State (passed to player):
• selectedSeason - Current season index
• selectedEpisode - Current episode index
• seasons - Full seasons data

Key Features:
=============

1. Auto-hide Controls
   - Fade out after 3s of inactivity
   - Show on mouse move/touch
   - Smooth 300ms transition

2. Progress Tracking
   - Auto-save every 5s
   - Restore on load
   - Per-episode for series
   - Local + server sync

3. Keyboard Shortcuts
   Space: Play/Pause
   F: Fullscreen
   M: Mute
   C: Captions
   ←/→: Seek ±10s

4. Mobile Responsive
   - Touch-friendly sizes
   - Hidden volume control
   - Responsive breakpoints
   - Large tap targets

5. Visual Design
   - Dark theme
   - Blur effects
   - Smooth animations
   - Hover states

Technologies:
=============

• React Hooks (useState, useEffect, useRef, useCallback)
• Shaka Player (HLS streaming, subtitles)
• Next.js (SSR, routing)
• Tailwind CSS (utility-first styling)
• progressUtils (watch history persistence)

File Sizes:
===========

TopBar.js:          2.5 KB
PlayerControls.js:  5.7 KB
EpisodeSelector.js: 5.3 KB
QualitySelector.js: 1.8 KB
SpeedSelector.js:   1.8 KB
SettingsMenu.js:    2.8 KB
PStreamPlayer.js:   ~25 KB (enhanced)
README.md:          2.8 KB
Total New Code:     ~48 KB

Performance:
============

• Lazy component rendering (conditional)
• Event listener cleanup
• Memoized callbacks
• Optimized re-renders
• Efficient state updates
• Minimal bundle impact
```
