# MNFLIX - Vite + React Router Migration

## Overview

This project has been migrated from Next.js App Router to Vite + React Router to enable seamless integration with P-Stream player components and Zenflify backend.

## Technology Stack

- **Build Tool**: Vite 5.0
- **Framework**: React 18.2
- **Routing**: React Router v6
- **State Management**: Zustand (ready for P-Stream integration)
- **Styling**: TailwindCSS 3.3
- **Language**: TypeScript 5.3
- **Streaming**: HLS.js, Shaka Player
- **API Client**: Axios

## Project Structure

```
src/
├── main.tsx                    # Vite entry point
├── App.tsx                     # React Router configuration
├── pages/                      # Page components
│   ├── Home.tsx
│   ├── Browse.tsx
│   ├── MovieDetail.tsx
│   ├── Player.tsx             # Player page (P-Stream integration ready)
│   ├── Watch.tsx
│   ├── Profile.tsx
│   ├── Settings.tsx
│   ├── Login.tsx
│   └── NotFound.tsx
├── components/                 # Reusable components
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── player/                # Ready for P-Stream player components
│   ├── cards/
│   └── common/
├── services/                   # API services
│   └── zenflify.ts            # Zenflify streaming integration
├── utils/                      # Utility functions
│   ├── api.ts                 # Axios client with JWT interceptors
│   └── progressUtils.ts       # Progress tracking utilities
├── stores/                     # Zustand state management (ready for P-Stream)
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript type definitions
└── styles/                     # Global styles
    └── index.css
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

The dev server will start at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:4000
VITE_OMDB_API_KEY=your_key_here
VITE_PROVIDER_URL=http://localhost:3001
VITE_APP_NAME=MNFLIX
```

## Backend Integration

### API Client

The API client is configured with JWT authentication:

```typescript
import apiClient from '@/utils/api'

// All requests automatically include the JWT token from localStorage
const response = await apiClient.get('/api/movies')
```

### Zenflify Integration

Streaming sources are fetched from Zenflify:

```typescript
import { getZenflifyMovieStreams } from '@/services/zenflify'

const streams = await getZenflifyMovieStreams(tmdbId, title)
```

## P-Stream Player Integration

The project is structured to easily integrate P-Stream player components:

1. Copy P-Stream player components to `src/components/player/`
2. Copy P-Stream stores to `src/stores/player/`
3. Update the `Player.tsx` page to use the P-Stream player
4. All utilities and services are already compatible

## Routes

- `/` - Home page
- `/browse` - Browse content
- `/search` - Search (same as browse with query param)
- `/movie/:id` - Movie detail page
- `/series/:id` - Series detail page
- `/play/:id` - Player page
- `/profile` - User profile
- `/settings` - Settings
- `/login` - Authentication
- `/my-list` - User's saved content

## Features

✅ Vite fast development server
✅ React Router v6 client-side routing
✅ JWT authentication support
✅ Zenflify streaming integration
✅ Progress tracking utilities
✅ TypeScript type safety
✅ TailwindCSS styling
✅ Responsive design
✅ Dark theme
✅ Ready for P-Stream player integration

## Next Steps

1. Copy P-Stream player components
2. Integrate P-Stream state management
3. Connect to actual backend API endpoints
4. Implement authentication flow
5. Add movie database integration
6. Implement search functionality
7. Add watch history tracking

## Migration Benefits

- ⚡ Lightning-fast development with Vite
- 🔄 Seamless P-Stream component integration
- 🎯 Simplified routing with React Router
- 📦 Smaller bundle sizes
- 🚀 Better build performance
- ✨ No more Next.js hydration errors
- 🎨 Direct component compatibility with P-Stream

## Notes

- All API URLs use Vite's `import.meta.env` instead of Next.js `process.env`
- No server-side rendering (pure client-side)
- All routes are client-side rendered
- Compatible with any backend deployment
