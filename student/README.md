# Extra Muros Student PWA

A production-ready, offline-first Progressive Web App (PWA) for students to access educational trip content without an internet connection.

## Features

- **100% Offline Support**: Download trips and access all content offline
- **IndexedDB Storage**: All data stored locally using IndexedDB
- **PWA Ready**: Installable as a native app on mobile and desktop
- **Real-time Sync**: Automatic synchronization when online
- **Rich Media Support**: Text, images, audio, maps, schedules, and activities
- **Interactive Maps**: Leaflet maps for location-based content
- **Progress Tracking**: Track completed content and sync progress
- **Mobile-First Design**: Optimized for mobile devices
- **Atomic Design Pattern**: Well-structured, reusable components

## Tech Stack

- **React 18**: Modern React with hooks
- **React Router 6**: Client-side routing
- **Vite**: Fast build tool and dev server
- **IndexedDB (idb)**: Offline data storage
- **Leaflet**: Interactive maps
- **Axios**: HTTP client with offline handling
- **Vite PWA Plugin**: Service Worker generation

## Project Structure

```
student/
├── public/
│   ├── manifest.json         # PWA manifest
│   └── icons/                # App icons (72x72 to 512x512)
├── src/
│   ├── components/
│   │   ├── atoms/            # Basic UI components
│   │   ├── molecules/        # Composite components
│   │   └── organisms/        # Complex components
│   ├── context/              # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Page components
│   ├── utils/                # Utility functions
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```
VITE_API_URL=http://your-api-url/api
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3001`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Key Components

### Atoms
- Button, Badge, Spinner, Icon, ProgressBar

### Molecules
- TripCard, ContentCard, DownloadButton, OfflineBadge, AudioPlayer

### Organisms
- Header, TripList, ModuleList, ContentViewer, MapView

### Pages
- Home: Welcome page with app features
- TripListPage: Browse downloaded trips
- TripView: View trip modules and contents
- ContentView: View specific content (text, image, audio, location, etc.)
- Settings: Manage downloads, sync, and storage

## Offline Functionality

### Download Process
1. Fetch trip data from API
2. Save trip, modules, and contents to IndexedDB
3. Download and cache all assets (images, audio)
4. Track download progress
5. Enable offline access

### Storage Structure
- **trips**: Downloaded trip data
- **modules**: Trip modules
- **contents**: Module contents
- **assets**: Images and audio files (as blobs)
- **progress**: User progress and completion status
- **settings**: App settings

### Sync Strategy
- Auto-sync every 5 minutes when online
- Manual sync option in settings
- Background sync support
- Progress data syncs to server

## Content Types

The app supports multiple content types:

1. **Text**: Rich text content
2. **Image**: Images with captions
3. **Audio**: Audio files with player and transcripts
4. **Location**: Interactive maps with markers
5. **Schedule**: Timetables and schedules
6. **Activity**: Tasks and instructions

## PWA Features

- **Install Prompt**: Add to home screen
- **Offline First**: Works without internet
- **App Icons**: Multiple sizes for all devices
- **Service Worker**: Caches resources
- **Background Sync**: Syncs data in background
- **Push Notifications**: (Ready to implement)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

## Performance

- Lazy loading of routes
- Optimized images
- Minimal bundle size
- Fast initial load
- Smooth animations
- Efficient re-renders

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
- High contrast support

## Security

- No sensitive data in localStorage
- Secure API communication
- Content Security Policy ready
- XSS protection
- HTTPS required in production

## Testing

The app is ready for testing with:
- Unit tests (add with Jest/Vitest)
- Integration tests (add with Testing Library)
- E2E tests (add with Playwright/Cypress)

## Deployment

Deploy to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting

Make sure to:
1. Set environment variables
2. Configure HTTPS
3. Set up API CORS
4. Test PWA installation
5. Test offline functionality

## Contributing

1. Follow atomic design pattern
2. Use functional components
3. Add PropTypes or TypeScript
4. Write clean, readable code
5. Test offline scenarios
6. Optimize performance

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
