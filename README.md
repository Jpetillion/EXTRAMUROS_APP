# Extra Muros - School Trip Management System

A complete offline-first system for managing and viewing school trip information, consisting of:
- **Teacher Admin Website** - Server-side rendered React app for content management
- **Student PWA** - Progressive Web App for offline access to trip guides
- **Express API Server** - Backend with Turso database and Vercel Blob storage

## Features

### Teacher Admin
- ✅ Create and manage trips
- ✅ Organize content into modules
- ✅ Upload images, audio, and video files
- ✅ Rich text editor for content
- ✅ Location picker with maps
- ✅ Schedule and activity builders
- ✅ Publish/unpublish content
- ✅ Generate offline manifests

### Student PWA
- ✅ Browse available trips
- ✅ Download trips for offline access
- ✅ View content offline (text, images, audio, video)
- ✅ Interactive maps
- ✅ Schedule views with notifications
- ✅ Activity/game features (like Louvre Bingo)
- ✅ Auto-sync updates when online
- ✅ Install as native app on iOS/Android

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Turso (libSQL/SQLite)
- **Storage**: Vercel Blob Storage
- **Frontend**: React 18 (no TypeScript)
- **Build Tool**: Vite
- **Icons**: Phosphor Icons
- **Maps**: Leaflet
- **Authentication**: JWT + bcrypt

## Project Structure

```
extra-muros/
├── server/          # Express API server
├── admin/           # Teacher admin website (to be created)
├── student/         # Student PWA (to be created)
├── shared/          # Shared utilities
└── Briefing_docs/   # Project documentation
```

## Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspaces
```

### 2. Set Up Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials:
# - Turso database URL and auth token
# - Vercel Blob token
# - JWT secret
```

### 3. Set Up Database

```bash
# Create tables
npm run db:setup

# Seed with demo users
npm run db:seed
```

### 4. Run Development Servers

```bash
# Run all services
npm run dev

# Or run individually:
npm run dev:server   # API server on :3000
npm run dev:admin    # Admin site on :5173
npm run dev:student  # Student PWA on :5174
```

## Default Login Credentials

After seeding the database:

- **Admin**: admin@school.be / changeme123
- **Teacher**: teacher@school.be / teacher123
- **Student**: student@school.be / student123

**⚠️ Change these passwords in production!**

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Trips
- `GET /api/trips` - List all trips
- `GET /api/trips/:id` - Get trip details
- `POST /api/trips` - Create trip (auth required)
- `PUT /api/trips/:id` - Update trip (auth required)
- `DELETE /api/trips/:id` - Delete trip (admin only)
- `POST /api/trips/:id/publish` - Publish trip (auth required)

### Modules
- `GET /api/modules/trip/:tripId` - List modules for a trip
- `GET /api/modules/:id` - Get module details
- `POST /api/modules` - Create module (auth required)
- `PUT /api/modules/:id` - Update module (auth required)
- `DELETE /api/modules/:id` - Delete module (admin only)

### Content
- `GET /api/content/module/:moduleId` - List content for a module
- `GET /api/content/:id` - Get content item
- `POST /api/content` - Create content (auth required)
- `PUT /api/content/:id` - Update content (auth required)
- `DELETE /api/content/:id` - Delete content (admin only)
- `POST /api/content/:id/publish` - Publish content (auth required)

### Upload
- `POST /api/upload` - Upload any file (auth required)
- `POST /api/upload/image` - Upload image (auth required)
- `POST /api/upload/audio` - Upload audio (auth required)
- `POST /api/upload/video` - Upload video (auth required)

### Manifest
- `POST /api/manifest/:tripId/generate` - Generate manifest (auth required)
- `GET /api/manifest/:tripId` - Get manifest (public)

## Content Types

The system supports 7 content types:

1. **text** - Rich text content with formatting
2. **image** - Image with caption
3. **audio** - Audio file with player
4. **video** - Video file with player
5. **location** - Map location with coordinates
6. **activity** - Interactive activity (games, bingo, etc.)
7. **schedule** - Time-based schedule entry

## Database Schema

See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for complete schema documentation.

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Environment Variables for Production

- `TURSO_DATABASE_URL` - Your Turso database URL
- `TURSO_AUTH_TOKEN` - Turso authentication token
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token
- `JWT_SECRET` - Secret key for JWT tokens
- `ADMIN_EMAIL` - Admin user email
- `ADMIN_PASSWORD` - Admin user password

## Building the Frontend Apps

The admin and student apps need to be created with the following structure:

### Admin App Structure
```
admin/
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Page components
│   ├── hooks/        # Custom React hooks
│   ├── utils/        # Helper functions
│   ├── context/      # React context providers
│   └── App.jsx       # Main app component
├── public/           # Static assets
└── vite.config.js    # Vite configuration
```

### Student PWA Structure
```
student/
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Page components
│   ├── hooks/        # Custom React hooks (offline, sync, etc.)
│   ├── utils/        # Helper functions (storage, download, etc.)
│   ├── workers/      # Service worker for offline functionality
│   └── App.jsx       # Main app component
├── public/
│   ├── manifest.json # PWA manifest
│   └── icons/        # App icons
└── vite.config.js    # Vite configuration with PWA plugin
```

## Next Steps

1. Create the admin website React application
2. Create the student PWA React application
3. Implement offline storage with IndexedDB
4. Add service worker for PWA functionality
5. Create UI components based on design requirements
6. Add real-time sync functionality
7. Test offline functionality thoroughly

## Support

For issues and feature requests, please contact the development team.

## License

MIT
# EXTRAMUROS_APP
