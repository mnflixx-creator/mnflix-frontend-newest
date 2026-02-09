# P-Stream Player Components

This directory contains modular components for the P-Stream styled video player.

## Components

### TopBar.js
Top control bar component featuring:
- Back button to return to content details
- Title display with episode information
- Info button (placeholder for future implementation)
- Bookmark button (placeholder for future implementation)
- Auto-hide functionality
- Blur effect background

### PlayerControls.js
Bottom control bar component featuring:
- Play/Pause button
- Progress bar with seek functionality
- Time display (current / duration)
- Volume control with slider
- Picture-in-picture toggle
- Fullscreen toggle
- Mobile-responsive design
- Accepts children for additional controls

### EpisodeSelector.js
Episode navigation component for series featuring:
- Season dropdown selector
- Episode dropdown selector
- Previous episode button
- Next episode button
- Episode title display
- Automatic navigation between seasons

### QualitySelector.js
Video quality selection dropdown featuring:
- Quality level options
- Current quality indicator
- Smooth dropdown animations

### SpeedSelector.js
Playback speed control featuring:
- Speed options: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- Current speed indicator
- Smooth dropdown animations

### SettingsMenu.js
Subtitle/Caption settings featuring:
- Subtitle track selection
- Off option
- Track language and label display
- Smooth dropdown animations

## Usage

These components are integrated into the main `PStreamPlayer.js` component:

```javascript
import TopBar from "@/components/player/TopBar";
import PlayerControls from "@/components/player/PlayerControls";
import EpisodeSelector from "@/components/player/EpisodeSelector";
import QualitySelector from "@/components/player/QualitySelector";
import SpeedSelector from "@/components/player/SpeedSelector";
import SettingsMenu from "@/components/player/SettingsMenu";

// Use in player component
<TopBar title={title} onBack={onBack} showControls={showControls} />
<PlayerControls {...props}>
  <EpisodeSelector {...episodeProps} />
  <SpeedSelector {...speedProps} />
  <QualitySelector {...qualityProps} />
  <SettingsMenu {...subtitleProps} />
</PlayerControls>
```

## Styling

All components use Tailwind CSS with:
- Dark theme (black background with opacity)
- Backdrop blur effects
- Smooth transitions (duration-150 to duration-300)
- Hover effects on interactive elements
- Mobile-responsive breakpoints

## Features

- **Auto-hide Controls**: Controls fade out after 3 seconds of inactivity
- **Keyboard Shortcuts**: Fully integrated with player keyboard controls
- **Mobile Responsive**: Touch-friendly sizes and layouts
- **Accessibility**: ARIA labels and keyboard navigation support
- **Smooth Animations**: All transitions are smooth and professional
