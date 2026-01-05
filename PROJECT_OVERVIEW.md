# Extra Muros - Project Overview

## What is Extra Muros?

Extra Muros is a modern, offline-first digital platform that transforms traditional paper-based school trip guides into an interactive, multimedia experience. It consists of two main applications:

1. **Teacher Admin Website** - A web-based content management system for teachers to create and manage trip content
2. **Student PWA** - A progressive web app that students install on their phones to access trip guides offline

## The Problem It Solves

### Before (Paper Booklets)
- ❌ Static, black & white printed booklets
- ❌ No multimedia content (images, audio, video)
- ❌ Difficult to update if plans change
- ❌ Easy to lose or forget
- ❌ No interactive features
- ❌ High printing costs
- ❌ Environmental waste

### After (Extra Muros)
- ✅ Dynamic, colorful digital guides
- ✅ Rich multimedia (photos, audio guides, videos)
- ✅ Easy updates pushed to students' devices
- ✅ Always in their pocket (on phone)
- ✅ Interactive maps, games, and activities
- ✅ Zero printing costs
- ✅ Environmentally friendly
- ✅ Works 100% offline (no roaming charges abroad!)

## Use Case Example: Paris Trip 2025

### Teacher's Workflow
1. **Create Trip**: Title: "Paris 2025", Dates: April 28-30
2. **Add Modules**: Day 1, Day 2, Day 3, Louvre Guide, Seine Cruise Info
3. **Add Content**:
   - Schedule entries with times and locations
   - Text descriptions of monuments
   - Photos of artworks in Louvre
   - Audio guides (e.g., explanation of Mona Lisa)
   - Interactive maps with pins
   - Games (Louvre Bingo)
4. **Upload Media**: Images, audio files, videos
5. **Publish**: Generate offline manifest
6. **Share**: Students download via trip code or QR code

### Student's Experience
1. **Install App**: Add to home screen (looks like native app)
2. **Browse Trips**: See available trips
3. **Download**: "Paris 2025" - downloads all content (~50MB)
4. **Use Offline**:
   - In the train: Read about today's schedule
   - At hotel: Check tomorrow's plans
   - At Louvre: Play Bingo game, listen to audio guides
   - On the street: View map with pinned locations
   - At night: Browse photos and information
5. **Auto-sync**: When back online, get any updates

## Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                   Internet                      │
└────────────┬────────────────────────┬───────────┘
             │                        │
             ▼                        ▼
   ┌──────────────────┐    ┌──────────────────┐
   │  Teacher Website │    │   Student PWA    │
   │  (Admin Portal)  │    │  (Mobile First)  │
   └──────────────────┘    └──────────────────┘
             │                        │
             │                        │
             ▼                        ▼
   ┌───────────────────────────────────────────┐
   │           Express API Server              │
   │         (Authentication, CRUD)            │
   └───────────────────────────────────────────┘
             │                        │
             ▼                        ▼
   ┌──────────────────┐    ┌──────────────────┐
   │  Turso Database  │    │  Vercel Blobs    │
   │   (SQLite)       │    │   (Files)        │
   └──────────────────┘    └──────────────────┘

                  Student's Phone (Offline)
   ┌─────────────────────────────────────────────┐
   │  ┌─────────────┐       ┌─────────────────┐ │
   │  │  IndexedDB  │       │  Service Worker │ │
   │  │  (Content)  │       │  (Cache Assets) │ │
   │  └─────────────┘       └─────────────────┘ │
   └─────────────────────────────────────────────┘
```

## Key Features Breakdown

### Content Types
1. **Text** - Rich formatted content, descriptions
2. **Image** - Photos of locations, artworks, maps
3. **Audio** - Audio guides, pronunciation help, music
4. **Video** - Video tours, explanations
5. **Location** - Interactive maps with coordinates
6. **Schedule** - Time-based itinerary items
7. **Activity** - Interactive games and challenges

### Teacher Features
- Dashboard with trip overview
- Visual trip builder
- Drag-and-drop module/content ordering
- Media library management
- Rich text editor
- Map location picker
- Preview mode (see what students see)
- Publish/unpublish controls
- Version management

### Student Features
- Trip discovery
- One-tap download for offline
- Offline content viewing
- Audio player with controls
- Image gallery
- Interactive maps (OpenStreetMap via Leaflet)
- Activity/game features
- Schedule with notifications (optional)
- Progress tracking
- Auto-sync when online
- Install as native app (PWA)

## Technology Stack

### Frontend
- **React 18**: Modern UI library
- **Vite**: Fast build tool
- **React Router v6**: Navigation
- **Axios**: HTTP client
- **Phosphor Icons**: Beautiful icon set
- **Leaflet**: Maps
- **IndexedDB (idb)**: Offline storage
- **Service Workers**: PWA functionality

### Backend
- **Node.js + Express**: Server framework
- **Turso (libSQL)**: Scalable SQLite database
- **Vercel Blob**: File storage
- **JWT**: Authentication
- **bcrypt**: Password hashing
- **Multer**: File uploads

### Infrastructure
- **Vercel**: Hosting and deployment
- **GitHub**: Version control
- **Turso Cloud**: Database hosting

## Folder Structure

```
extra-muros/
├── server/                 # Express API
│   ├── config/            # Database, storage config
│   ├── middleware/        # Auth, upload middleware
│   ├── models/            # Database models
│   ├── routes/            # API endpoints
│   ├── scripts/           # Setup, seed scripts
│   └── utils/             # Helpers
│
├── admin/                 # Teacher admin website
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/     # Buttons, Inputs
│   │   │   ├── molecules/ # Cards, Forms
│   │   │   └── organisms/ # Complex components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom hooks
│   │   ├── context/       # React context
│   │   └── utils/         # Helpers
│   └── public/            # Static assets
│
├── student/               # Student PWA
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/     # UI primitives
│   │   │   ├── molecules/ # Composite UI
│   │   │   └── organisms/ # Feature components
│   │   ├── pages/         # App screens
│   │   ├── hooks/         # Offline, sync hooks
│   │   ├── utils/         # Storage, download
│   │   └── workers/       # Service worker
│   └── public/
│       ├── manifest.json  # PWA manifest
│       └── icons/         # App icons
│
└── shared/                # Shared utilities
    ├── constants.js
    └── utils.js
```

## Atomic Design Principles

We use Brad Frost's Atomic Design methodology:

### Atoms (Basic building blocks)
- Button, Input, Label, Badge, Icon, Spinner

### Molecules (Simple combinations)
- FormField (Label + Input + Error)
- Card (Container with header/body/footer)
- Modal (Overlay + Card)
- Toast notification

### Organisms (Complex components)
- TripForm (Multiple fields + validation)
- ContentEditor (Rich editor + media upload)
- TripList (Search + Filter + Cards)
- Navigation bar

### Pages (Complete views)
- Dashboard, Login, TripDetail, Settings

## Development Workflow

1. **Branch**: Create feature branch
2. **Develop**: Build feature with atomic components
3. **Test**: Manual testing + API testing
4. **Commit**: Descriptive commit messages
5. **PR**: Code review
6. **Deploy**: Merge to main → Auto-deploy to Vercel

## Data Flow

### Creating Content (Teacher)
```
Teacher → Admin UI → API → Turso DB
Teacher uploads file → API → Vercel Blob → URL saved to DB
```

### Publishing Content (Teacher)
```
Teacher clicks "Publish" →
API generates manifest →
All published content bundled →
Saved to manifests table →
Version incremented
```

### Downloading Content (Student)
```
Student opens app →
Fetches available trips →
Student clicks "Download" →
Fetches manifest →
Downloads all media files →
Saves to IndexedDB →
Updates sync timestamp
```

### Viewing Content (Student, Offline)
```
Student opens app (offline) →
Service worker intercepts requests →
Reads from IndexedDB →
Displays content →
No internet needed!
```

## Security Considerations

### Authentication
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with expiration
- HTTP-only cookies to prevent XSS
- Role-based access control (admin, teacher, student)

### Authorization
- Admin: Full access
- Teacher: Create, edit, publish content
- Student: Read-only, published content only

### File Uploads
- File type validation
- File size limits
- Virus scanning (recommended for production)
- Secure URLs from Vercel Blob

### API Security
- CORS configured for specific domains
- Input validation
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitized inputs)
- Rate limiting (recommended for production)

## Performance Optimizations

### Admin Website
- Code splitting (React.lazy)
- Image optimization
- Lazy loading of media
- Debounced search
- Optimistic UI updates

### Student PWA
- Service worker caching
- IndexedDB for offline storage
- Lazy image loading
- Audio/video preloading
- Progressive enhancement
- App shell architecture

## Scalability

### Database
- Turso automatically scales
- SQLite is fast for reads
- Efficient indexes on key fields
- Can add read replicas if needed

### Storage
- Vercel Blob auto-scales
- CDN distribution
- Parallel uploads

### API
- Vercel serverless scales automatically
- No server management needed
- Can add Redis caching if needed

## Cost Estimation

For a school with 500 students:

- **Vercel Pro**: $20/month
- **Turso Scaler**: $29/month
- **Vercel Blob**: ~$5/month (50GB)

**Total**: ~$55/month or ~$660/year

Compare to:
- Printing 500 booklets × 50 pages × 3 trips = $1500+/year
- **Savings**: $840/year + environmental impact

## Future Enhancements

### Phase 2
- [ ] Push notifications
- [ ] Live updates during trip
- [ ] Student check-ins
- [ ] Photo uploads from students
- [ ] Group chat
- [ ] Emergency contacts

### Phase 3
- [ ] Multi-language support
- [ ] Accessibility improvements
- [ ] Native mobile apps (React Native)
- [ ] Integration with school system
- [ ] Analytics dashboard
- [ ] Parent portal

## Success Metrics

- ✅ App installation rate (target: 95%+)
- ✅ Content download rate (target: 90%+)
- ✅ App usage during trip (target: 80%+)
- ✅ Teacher satisfaction (survey)
- ✅ Student satisfaction (survey)
- ✅ Cost savings vs paper
- ✅ Time saved vs manual creation

## Support & Maintenance

### Teacher Training
- 1-hour workshop on content creation
- Video tutorials
- Quick start guide
- Support contact

### Student Onboarding
- Installation guide
- Welcome video
- In-app help
- FAQ page

### Technical Support
- Email support: support@school.be
- Response time: 24-48 hours
- Emergency contact for trips

## Conclusion

Extra Muros transforms school trips from analog to digital, providing an engaging, interactive, and environmentally friendly solution that works anywhere, anytime – even without internet connection.

The system is:
- **Modern**: Built with latest web technologies
- **Reliable**: Works offline when you need it most
- **Scalable**: Grows with your school
- **Cost-effective**: Saves money and resources
- **User-friendly**: Intuitive for both teachers and students

Ready to revolutionize school trips! 🚀
