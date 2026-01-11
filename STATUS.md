# Extra Muros - Project Status & Roadmap

**Last Updated:** 2026-01-11
**Current Stage:** Beta / Partially Complete (~75%)
**Target MVP:** 85-90% (Critical Features Complete)

---

## Executive Summary

Extra Muros is an **offline-first school trip management system** consisting of:
- **Teacher Admin Website** - Trip content creation and management
- **Student PWA** - Offline-capable trip consumption
- **Express API Server** - Backend with Turso (SQLite) + Vercel Blob storage

**What Works:** Admin trip/module/content management, user authentication, media uploads, database structure
**What's Missing:** Trip stops API routes, service worker implementation, critical student endpoints, progress sync

---

## 1. Implementation Status by Component

### 🟢 Server (Backend) - 85% Complete

#### ✅ Fully Implemented
- User authentication with JWT + bcrypt
- Role-based authorization (admin/teacher/student)
- Database schema with all tables created
- Core CRUD operations:
  - Trips (create, read, update, delete, publish)
  - Modules (full CRUD)
  - Content items (full CRUD + publish)
- Media upload system (images, audio, video)
- Vercel Blob integration
- Manifest generation for offline packages
- Dashboard statistics endpoint
- Error handling middleware
- Input validation middleware

#### ⚠️ Partially Implemented
- Trip Stops/Blocks:
  - ✅ Database table created (`trip_stops`)
  - ✅ DB functions exist (`createTripStop`, `getTripStopsByTripId`)
  - ❌ **No API route handlers** (critical gap)

#### ❌ Missing Features
- **Trip Stops API Routes** - HIGH PRIORITY
  - `GET /trips/:tripId/stops` - List all stops for a trip
  - `POST /trips/:tripId/stops` - Create new stop
  - `PUT /trips/:tripId/stops/:stopId` - Update stop
  - `DELETE /trips/:tripId/stops/:stopId` - Delete stop

- **Nested Trip Endpoint** - HIGH PRIORITY
  - `GET /trips/:tripId/full` - Return trip with nested modules, content, and stops
  - Currently student app calls `getTripWithContent()` which doesn't exist

- **Progress Sync Endpoints** - MEDIUM PRIORITY
  - `POST /sync/progress` - Sync student progress from offline
  - `GET /sync/progress/:studentId` - Get student progress

- **Media Deletion** - MEDIUM PRIORITY
  - `DELETE /upload/:fileId` - Delete file from Vercel Blob
  - Currently files accumulate without cleanup mechanism

#### Known Issues
1. **Field Name Inconsistencies**: Server returns `media_url`, `thumbnail_url` but student expects `mediaUrl`, `thumbnailUrl`
2. **Trip Schema Confusion**: Admin sends `location/city/country`, server expects `destination/startDate/endDate`
3. **Incomplete Validation**: Trip stops creation has minimal validation
4. **No Token Refresh**: JWT expires after 7 days with no renewal mechanism

---

### 🟡 Admin (Teacher Website) - 80% Complete

#### ✅ Fully Implemented
- Login/logout with JWT authentication
- Dashboard with statistics
- Trips list and detail views
- Module management UI
- Content management UI (text, image, audio, video, location, schedule, activity)
- Rich text editor integration
- File upload with progress tracking
- Toast notifications system
- Protected routes with auth guards
- Atomic design component structure
- Form validation

#### ❌ Missing Features
- **Trip Stops UI** - HIGH PRIORITY
  - No interface to add/edit/delete trip stops
  - Database supports it, but UI missing

- **Trip Stops Management Page**
  - Should allow ordering stops (drag/drop or up/down)
  - Map integration to set lat/lng
  - Media attachment (pictures, audio, video)

- **Preview Mode** - LOW PRIORITY
  - No way to preview unpublished content as student would see it

#### Known Issues
1. **Trip Form Schema Mismatch**: Form fields don't align perfectly with server API expectations
2. **Password Validation Inconsistency**: Login allows passwords < 6 chars, but server requires >= 8
3. **No Error Recovery**: Upload failures don't offer retry mechanism

---

### 🟡 Student (PWA) - 70% Complete

#### ✅ Fully Implemented
- Home dashboard with downloaded trips count
- Trip list page (my downloads)
- Trip view with modules
- Content view with rich media
- Settings page
- IndexedDB schema with 6 stores (trips, modules, contents, assets, progress, settings)
- Offline/online detection with event listeners
- Download manager with progress tracking
- Auto-sync timer (every 5 minutes)
- Storage size estimation
- PWA manifest.json with icons

#### ⚠️ Partially Implemented
- **Offline Caching**:
  - ✅ IndexedDB storage structure complete
  - ✅ Blob storage for media files
  - ❌ **Service Worker missing** (critical gap!)

- **Trip Downloads**:
  - ✅ Download flow implemented
  - ❌ Calls non-existent endpoint `/trips/:id/full`

#### ❌ Missing Features
- **Service Worker** - CRITICAL
  - File: `student/public/sw.js` doesn't exist
  - No cache-first or network-first strategies
  - Assets won't be cached properly offline
  - App will fail offline without this

- **Student Authentication** - MEDIUM PRIORITY
  - No login page or auth flow
  - Students can't identify themselves
  - Progress tracking can't be personalized

- **Progress Tracking**:
  - ✅ Local progress stored in IndexedDB
  - ❌ Can't sync to server (endpoint missing)

#### Known Issues
1. **API Endpoint Mismatch**: Expects `/trips/:id/full` which doesn't exist on server
2. **Field Name Mismatches**: Expects `mediaUrl` but server sends `media_url`
3. **Download Will Fail**: Missing endpoint means downloads won't work
4. **No Offline Fallback**: Without service worker, app fails completely offline
5. **Service Worker Registration**: Code registers `/sw.js` but file is missing

---

## 2. Critical Path to MVP (Must Fix)

These items block core functionality and must be completed for the app to work:

### Priority 1: Student Download Flow (BLOCKING)

**Problem**: Student app cannot download trips because endpoint doesn't exist

**Solution**:
```
Location: server/routes/trips.js
Action: Add new endpoint GET /trips/:id/full

Response shape:
{
  trip: { id, title, description, ... },
  modules: [
    {
      id, title, orderIndex, ...
      contents: [
        { id, type, data, media_url, ... }
      ]
    }
  ],
  stops: [
    { id, title, lat, lng, pictures, audio, video, ... }
  ]
}
```

**Files to modify**:
- `server/routes/trips.js` - Add route handler
- `server/db.js` - Create `getTripWithFullContent()` function

**Testing**: Student should be able to download a published trip

---

### Priority 2: Service Worker Implementation (BLOCKING)

**Problem**: PWA has no actual service worker, so offline caching doesn't work

**Solution**:
```
Location: student/public/sw.js (CREATE NEW FILE)

Strategies needed:
- Cache-first for static assets (JS, CSS, images)
- Network-first for API calls with cache fallback
- Precache shell (index.html, app.js, app.css)
- Cache downloaded trip media
```

**Implementation steps**:
1. Create `student/public/sw.js`
2. Implement cache strategies (Workbox pattern)
3. Add install/activate/fetch event listeners
4. Test offline functionality

**Testing**:
- Download trip online
- Go offline (airplane mode)
- App should still work completely

---

### Priority 3: Trip Stops API Routes (HIGH)

**Problem**: Database supports trip stops but no API to manage them

**Solution**:
```
Location: server/routes/trips.js

Add routes:
- GET    /trips/:tripId/stops           (list)
- POST   /trips/:tripId/stops           (create)
- PUT    /trips/:tripId/stops/:stopId   (update)
- DELETE /trips/:tripId/stops/:stopId   (delete)
```

**Files to modify**:
- `server/routes/trips.js` - Add 4 route handlers
- Validation middleware for stop data

**Testing**: CRUD operations via Postman/Thunder Client

---

### Priority 4: Fix Field Name Mismatches (MEDIUM)

**Problem**: Server sends `media_url`, student expects `mediaUrl`

**Options**:
1. **Option A**: Add transformation layer in API responses
2. **Option B**: Update student app to use snake_case
3. **Option C**: Update server to return camelCase (RECOMMENDED)

**Recommended solution**:
- Add utility function `toCamelCase()` to transform DB results before sending
- Apply to all API responses consistently

**Files to modify**:
- `server/db.js` or create `server/utils/transform.js`
- Apply transformation in all route handlers

---

### Priority 5: Trip Stops UI in Admin (MEDIUM)

**Problem**: Teachers can't manage trip stops (waypoints) from admin interface

**Solution**:
```
Location: admin/src/pages/Trips.jsx or new TripStopsManager.jsx

UI Requirements:
- List all stops for a trip
- Add new stop with:
  - Title, description
  - Lat/lng (with map picker)
  - Order index (drag/drop or up/down buttons)
  - Media attachments (pictures, audio, video)
- Edit existing stop
- Delete stop
- Show stops on map preview
```

**Files to create/modify**:
- `admin/src/components/organisms/TripStopsManager.jsx` (new)
- `admin/src/components/molecules/StopCard.jsx` (new)
- `admin/src/pages/TripDetail.jsx` - Add stops tab
- `admin/src/utils/api.js` - Add stops API calls

---

## 3. Important but Non-Blocking Features

### Progress Sync Endpoints

**What**: Allow students to sync their progress (completed activities, viewed content) to server

**Implementation**:
```
Location: server/routes/sync.js (NEW FILE)

Endpoints:
- POST /sync/progress
  Body: { studentId, tripId, progress: {...} }

- GET /sync/progress/:studentId/:tripId
  Returns: Latest synced progress
```

**Usage**: When student comes back online, sync their offline progress

---

### Media Deletion Endpoint

**What**: Clean up uploaded files from Vercel Blob

**Implementation**:
```
Location: server/routes/upload.js

Add:
- DELETE /upload/:blobUrl
  - Extract blob URL from request
  - Call vercel blob delete API
  - Remove from database references
  - Admin/teacher auth required
```

**Usage**: When content is deleted, also delete associated media

---

### Student Authentication

**What**: Allow students to log in and personalize experience

**Implementation**:
```
Student App:
- Create LoginPage.jsx
- Add AuthContext similar to admin
- Store JWT in localStorage
- Protect download routes (optional)

Server:
- Already supports student role in JWT
- No changes needed
```

**Decision needed**: Should students log in, or is content publicly downloadable?

---

### Password Validation Fix

**Problem**: Admin allows passwords < 6 chars, server requires >= 8

**Solution**: Standardize to 8 chars minimum everywhere

**Files to modify**:
- `admin/src/pages/Login.jsx` - Update validation
- Add password strength indicator (optional)

---

### Manifest Generation - Include Stops

**Problem**: Generated manifests don't include trip stops data

**Solution**:
```
Location: server/routes/manifest.js

Modify generateManifest() to query and include:
- Trip stops with lat/lng
- Stop media URLs for precaching
```

---

## 4. Architecture & Data Flow

### Current Data Flow

```
ADMIN → SERVER → STUDENT
  ↓        ↓        ↓
Create   Store   Download
  ↓        ↓        ↓
Edit    Publish  Cache Offline
  ↓        ↓        ↓
Upload  Generate View Offline
  ↓     Manifest     ↓
Delete     ↓     Track Progress
         API        ↓
                 Sync Online
```

### Blocking Points (Data Can't Flow)

1. **Admin → Server (Trip Stops)**: ❌ No UI to send stops
2. **Server → Student (Full Trip)**: ❌ Endpoint missing
3. **Student → Server (Progress)**: ❌ Sync endpoint missing
4. **Student Offline**: ❌ Service worker missing

---

## 5. Dev Principles & Guidelines

### Monorepo Structure
```
server/     - API + business logic + data access
admin/      - Teacher/admin CMS UI
student/    - PWA + offline consumption
shared/     - Pure utilities (no browser-only or secrets)
```

**Rule**: No SQL in route handlers (use db.js functions), no secrets in shared/

---

### Backend Pattern (Pragmatic MVC)
```
Routes/Controllers: HTTP layer (req/res, auth, parsing, status codes)
Services:           Business rules (publish, manifest, permissions)
Models/DB:          SQL queries + mapping (no business logic)
```

**Rule**: Same error shape everywhere: `{ error: "message", code?: "CODE" }`

---

### Frontend (React 18 + ES6)
```
Function components + hooks (useState, useEffect, useMemo, useCallback)
Single responsibility per component
State management: local state + API hooks (no Redux unless needed)
API calls: centralized in utils/api.js
```

**Rule**: No fetch scattered in components, use api.js wrappers

---

### ES6+ Conventions
```javascript
// ✅ DO THIS
const data = await fetchData();
const { name, email } = user;
const status = data?.status ?? 'pending';
if (!user) return; // early return

// ❌ DON'T DO THIS
let data = await fetchData();
const name = user.name;
const status = data && data.status ? data.status : 'pending';
if (user) { /* nested */ }
```

**Rule**: const by default, destructure, optional chaining, early returns

---

### Project-Specific Rules

1. **Offline-First**: Student app must work without network (no hard dependencies on live API for navigation)

2. **Publish/Unpublish is Sacred**: Students only see published content (unless explicit preview mode)

3. **Media Storage**: Upload to Blob, store only metadata/URLs in DB (no base64 in DB)

4. **API Contract Stability**: Don't change response shapes without updating both frontends

5. **No Magic Strings**: Use constants for status values, roles, content types
   ```javascript
   // ✅ DO THIS
   const ROLES = { ADMIN: 'admin', TEACHER: 'teacher', STUDENT: 'student' };
   if (user.role === ROLES.ADMIN) { ... }

   // ❌ DON'T DO THIS
   if (user.role === 'admin') { ... }
   ```

---

## 6. Testing Strategy

### What to Test (Minimum Viable)

**Server**:
- [ ] Auth flow (login, logout, JWT validation)
- [ ] Trip CRUD operations
- [ ] Trip stops CRUD
- [ ] Publish flow (trip becomes available to students)
- [ ] Manifest generation includes all content + stops
- [ ] File upload + validation

**Admin**:
- [ ] Login with valid/invalid credentials
- [ ] Create trip with all fields
- [ ] Add modules and content
- [ ] Upload media files
- [ ] Publish/unpublish functionality

**Student**:
- [ ] Download trip online
- [ ] View trip offline (with service worker)
- [ ] Progress tracking
- [ ] Sync progress when back online

**Integration**:
- [ ] Full flow: Create trip in admin → Publish → Download in student → Use offline

---

## 7. Deployment Checklist

Before deploying to production:

### Environment Variables
- [ ] All secrets in Vercel environment (not .env committed)
- [ ] `.env.example` up to date
- [ ] CORS origins set correctly (admin + student domains)
- [ ] JWT_SECRET is cryptographically secure (not "your-secret-key")
- [ ] BLOB_READ_WRITE_TOKEN configured

### Server
- [ ] Database migrations run on Turso
- [ ] All API endpoints tested
- [ ] Error logging configured
- [ ] Rate limiting enabled (optional but recommended)

### Admin
- [ ] Build succeeds (`npm run build`)
- [ ] API_URL points to production server
- [ ] Static files deployed to Vercel

### Student PWA
- [ ] Build succeeds
- [ ] Service worker registers correctly
- [ ] manifest.json has correct icons and URLs
- [ ] Can install as app on iOS/Android
- [ ] Offline functionality verified

### DNS & Domains
- [ ] Admin domain configured (e.g., admin.extramuros.app)
- [ ] Student domain configured (e.g., app.extramuros.app)
- [ ] Server domain configured (e.g., api.extramuros.app)
- [ ] SSL certificates active

---

## 8. Known Issues & Workarounds

### Issue: Student Downloads Fail
**Symptom**: Download button doesn't work, console shows 404
**Cause**: `/trips/:id/full` endpoint missing
**Workaround**: None - must implement endpoint (Priority 1)
**Status**: ❌ Blocking

### Issue: App Doesn't Work Offline
**Symptom**: White screen when offline
**Cause**: No service worker to cache app shell
**Workaround**: Stay online
**Status**: ❌ Blocking

### Issue: Trip Stops Can't Be Created
**Symptom**: No UI or API for stops
**Cause**: Feature partially implemented
**Workaround**: Manually insert into DB (not recommended)
**Status**: ⚠️ High priority

### Issue: Field Name Mismatches
**Symptom**: Student app shows undefined for media URLs
**Cause**: Server sends `media_url`, student expects `mediaUrl`
**Workaround**: Transform data in student app
**Status**: ⚠️ Medium priority

---

## 9. Definition of "Done" per Feature

### Trip Stops Feature is Done when:
- [x] Database table exists and is correct
- [x] DB functions created (createTripStop, getTripStopsByTripId)
- [ ] API routes implemented (GET, POST, PUT, DELETE)
- [ ] Routes tested with Postman
- [ ] Admin UI shows stops list
- [ ] Admin UI can add/edit/delete stops
- [ ] Stops included in manifest generation
- [ ] Student app displays stops on map
- [ ] Student app shows stop details when clicked

### Service Worker is Done when:
- [ ] File `student/public/sw.js` created
- [ ] Cache strategies implemented (cache-first, network-first)
- [ ] App shell precached
- [ ] Downloaded media cached
- [ ] App works completely offline (verified with Network tab disabled)
- [ ] Update mechanism works (new version notification)
- [ ] No console errors related to SW

### Progress Sync is Done when:
- [ ] Server endpoints created (POST /sync/progress, GET /sync/progress/:id)
- [ ] Student app sends progress when online
- [ ] Progress persists to DB
- [ ] Can retrieve progress from another device (if logged in)
- [ ] Conflict resolution works (offline changes + server changes)

---

## 10. Roadmap Timeline

### Phase 1: Critical Fixes (Get to MVP)
**Goal**: Make student downloads and offline work

1. Implement `/trips/:id/full` endpoint → 2-3 hours
2. Create service worker → 3-4 hours
3. Fix field name mismatches → 1-2 hours
4. Test download + offline flow → 1-2 hours

**Total**: ~1-2 days

### Phase 2: Trip Stops Feature
**Goal**: Complete trip stops functionality

1. Create trip stops API routes → 2-3 hours
2. Build admin UI for stops management → 4-6 hours
3. Add stops to manifest generation → 1-2 hours
4. Update student app to display stops → 2-3 hours

**Total**: ~2-3 days

### Phase 3: Progress Sync
**Goal**: Student progress persists to server

1. Create sync endpoints → 2-3 hours
2. Implement conflict resolution → 2-3 hours
3. Test sync flow → 1-2 hours

**Total**: ~1 day

### Phase 4: Polish & Production Prep
**Goal**: Production-ready quality

1. Fix password validation → 30 min
2. Add media deletion endpoint → 1-2 hours
3. Security review → 2-3 hours
4. Write tests → 4-6 hours
5. Documentation updates → 2-3 hours
6. Deployment verification → 2-3 hours

**Total**: ~2-3 days

**TOTAL PROJECT COMPLETION**: ~1-2 weeks

---

## 11. Quick Reference - What Works, What Doesn't

### ✅ Works Right Now
- Admin login/logout
- Create/edit trips (basic fields)
- Add modules to trips
- Add content items (text, image, audio, video, location, schedule, activity)
- Upload media files
- Publish/unpublish trips
- View dashboard stats
- Database storing everything correctly

### ❌ Doesn't Work Right Now
- Downloading trips in student app (missing endpoint)
- Using student app offline (no service worker)
- Managing trip stops (no UI or complete API)
- Syncing student progress to server (missing endpoints)
- Deleting uploaded files (no endpoint)

### ⚠️ Partially Works
- Trip creation (field naming confusion)
- Trip stops (DB exists, some logic exists, but no complete implementation)
- Offline storage (structure built, but not integrated with service worker)

---

## 12. How to Continue Development

### Getting Started
```bash
# 1. Start the server
cd server
npm install
npm run dev  # Runs on port 3001

# 2. Start admin (in new terminal)
cd admin
npm install
npm run dev  # Runs on port 5173

# 3. Start student app (in new terminal)
cd student
npm install
npm run dev  # Runs on port 5174
```

### Development Order (Follow Priority)
1. **Fix blocking issues first** (Priority 1-2)
2. **Then complete trip stops** (Priority 3, 5)
3. **Then add progress sync** (Phase 3)
4. **Finally polish and deploy** (Phase 4)

### Testing After Each Change
- Test in admin interface
- Test API with Thunder Client / Postman
- Test in student app
- Test offline (disable network in DevTools)

---

## 13. Questions to Resolve

### Product Decisions Needed

1. **Student Authentication**: Should students log in, or is content publicly accessible?
   - If public: Progress tracked locally only
   - If authenticated: Progress syncs across devices

2. **Trip Sharing Model**: Can students share downloaded trips with others?
   - Affects: Manifest URLs, blob storage access

3. **Trip Updates**: When a published trip is updated, should students be notified?
   - Already partially implemented (manifest versioning exists)

4. **Storage Limits**: How much data can a student download?
   - Affects: Storage quota handling in PWA

### Technical Decisions Needed

1. **API Versioning**: Should we add `/api/v1` prefix now for future-proofing?

2. **Field Naming Convention**: Standardize on camelCase or snake_case?
   - Recommendation: camelCase (JavaScript convention)

3. **Service Worker Library**: Use Workbox or custom implementation?
   - Recommendation: Workbox (battle-tested, less code)

---

## 14. Success Metrics

### MVP Success = All These Work:

1. ✅ Teacher logs into admin
2. ✅ Teacher creates trip with title, description, dates
3. ✅ Teacher adds modules to trip
4. ✅ Teacher adds content (text + media) to modules
5. ❌ Teacher adds trip stops with locations
6. ✅ Teacher publishes trip
7. ❌ Student opens app and sees available trip
8. ❌ Student downloads trip (with progress bar)
9. ❌ Student goes offline
10. ❌ Student views trip content completely offline
11. ❌ Student sees trip stops on map
12. ⚠️ Student marks content as viewed/completed
13. ❌ Student goes online and progress syncs

**Current**: 6/13 working (46%)
**After Phase 1**: 10/13 working (77%) → **Usable MVP**
**After Phase 2**: 12/13 working (92%) → **Feature Complete**
**After Phase 3**: 13/13 working (100%) → **Full Product**

---

## 15. Contact & Support

**Project**: Extra Muros School Trip Manager
**Status Document Version**: 1.0
**Last Updated**: 2026-01-11

For questions about:
- **Architecture**: See `server/README.md`, `admin/README.md`, `student/README.md`
- **API**: See `API_DOCUMENTATION.md`
- **Deployment**: See `DEPLOYMENT.md`, `DEPLOYMENT_STUDENT.md`
- **Setup**: See `SETUP_GUIDE.md`

---

## Appendix: File Locations

### Critical Files to Modify

**For Priority 1 (Trip Download Endpoint)**:
- `server/routes/trips.js` - Add route handler
- `server/db.js` - Add `getTripWithFullContent()` function

**For Priority 2 (Service Worker)**:
- `student/public/sw.js` - CREATE NEW
- `student/src/registerSW.js` - Already exists (just needs actual SW file)

**For Priority 3 (Trip Stops API)**:
- `server/routes/trips.js` - Add 4 route handlers
- `server/db.js` - Already has DB functions

**For Priority 4 (Field Names)**:
- `server/utils/transform.js` - CREATE NEW (helper function)
- All route handlers - Apply transformation

**For Priority 5 (Trip Stops UI)**:
- `admin/src/components/organisms/TripStopsManager.jsx` - CREATE NEW
- `admin/src/pages/TripDetail.jsx` - Add stops tab
- `admin/src/utils/api.js` - Add stops API functions

---

**END OF STATUS DOCUMENT**
