# Extra Muros - API Endpoints Documentation

**Base URL:** `http://localhost:3000/api` (development)
**Production:** Set via `VITE_API_URL` environment variable

**Authentication:** JWT Bearer Token (included in `Authorization` header)

---

## 🔐 Authentication Endpoints

### `POST /auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "teacher@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "teacher@example.com",
    "role": "teacher",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### `POST /auth/logout`
Logout current user.

**Auth Required:** ✅
**Response:** `200 OK`

### `GET /auth/me`
Get current authenticated user profile.

**Auth Required:** ✅
**Response:**
```json
{
  "id": "uuid",
  "email": "teacher@example.com",
  "role": "teacher",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": 1234567890
}
```

---

## 🗺️ Trips Endpoints

### `GET /trips`
Get all trips (filtered by published status if not authenticated).

**Query Params:**
- `published` (optional): `true` to get only published trips

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Paris Adventure",
    "description": "Explore the City of Light",
    "destination": "Paris, France",
    "startDate": "2024-06-01",
    "endDate": "2024-06-07",
    "coverImageUrl": "https://...",
    "published": true,
    "manifestVersion": 1,
    "createdBy": "user-uuid",
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
]
```

### `GET /trips/:id`
Get single trip by ID.

**Response:** Same structure as array item above.

### `GET /trips/:id/full` ⭐ NEW
Get trip with full nested content (modules, content items, stops).

**Query Params:**
- `published` (optional): Set to `false` to include unpublished content (default: `true`)

**Response:**
```json
{
  "id": "uuid",
  "title": "Paris Adventure",
  "description": "Explore the City of Light",
  "destination": "Paris, France",
  "startDate": "2024-06-01",
  "endDate": "2024-06-07",
  "coverImageUrl": "https://...",
  "published": true,
  "manifestVersion": 1,
  "modules": [
    {
      "id": "module-uuid",
      "title": "Day 1: Arrival",
      "description": "First day in Paris",
      "orderIndex": 0,
      "contents": [
        {
          "id": "content-uuid",
          "type": "text",
          "title": "Welcome",
          "body": "Welcome to Paris!",
          "mediaUrl": null,
          "thumbnailUrl": null,
          "metadata": {},
          "orderIndex": 0,
          "published": true
        }
      ]
    }
  ],
  "stops": [
    {
      "id": "stop-uuid",
      "title": "Louvre Museum",
      "durationMinutes": 180,
      "difficulty": "Medium",
      "category": "Museum",
      "lat": 48.8606,
      "lng": 2.3376,
      "address": "Rue de Rivoli, 75001 Paris",
      "pictureUrl": "https://...",
      "audioUrl": null,
      "videoUrl": null,
      "orderIndex": 0,
      "metadata": null
    }
  ]
}
```

### `POST /trips`
Create new trip.

**Auth Required:** ✅ (Teacher/Admin)
**Request:**
```json
{
  "title": "Paris Adventure",
  "description": "Explore the City of Light",
  "destination": "Paris, France",
  "startDate": "2024-06-01",
  "endDate": "2024-06-07",
  "coverImageUrl": "https://..."
}
```

**Response:** Created trip object

### `PUT /trips/:id`
Update trip metadata.

**Auth Required:** ✅ (Teacher/Admin)
**Request:** Same fields as POST (all optional)
**Response:** Updated trip object

### `DELETE /trips/:id`
Delete trip.

**Auth Required:** ✅ (Admin only)
**Response:** `200 OK`

### `POST /trips/:id/publish`
Publish trip (makes it available to students).

**Auth Required:** ✅ (Teacher/Admin)
**Response:** Updated trip object with `published: true`

---

## 📍 Trip Stops Endpoints ⭐ NEW

### `GET /trips/:tripId/stops`
Get all stops for a trip.

**Response:**
```json
[
  {
    "id": "stop-uuid",
    "tripId": "trip-uuid",
    "title": "Louvre Museum",
    "durationMinutes": 180,
    "difficulty": "Medium",
    "category": "Museum",
    "lat": 48.8606,
    "lng": 2.3376,
    "address": "Rue de Rivoli, 75001 Paris",
    "pictureUrl": "https://...",
    "audioUrl": "https://...",
    "videoUrl": "https://...",
    "orderIndex": 0,
    "metadata": null,
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
]
```

### `POST /trips/:tripId/stops`
Create new stop for a trip.

**Auth Required:** ✅ (Teacher/Admin)
**Request:**
```json
{
  "title": "Eiffel Tower",
  "durationMinutes": 120,
  "difficulty": "Easy",
  "category": "Monument",
  "lat": 48.8584,
  "lng": 2.2945,
  "address": "Champ de Mars, 75007 Paris",
  "pictureUrl": "https://...",
  "audioUrl": "https://...",
  "videoUrl": "https://...",
  "orderIndex": 1
}
```

**Required Fields:**
- `title` (string)

**Optional Fields:**
- `durationMinutes` (number)
- `difficulty` (string: Easy, Medium, Hard)
- `category` (string: Museum, Monument, Park, Restaurant, Hotel, Activity, Other)
- `lat` (number: -90 to 90)
- `lng` (number: -180 to 180)
- `address` (string)
- `pictureUrl` (string)
- `audioUrl` (string)
- `videoUrl` (string)
- `orderIndex` (number, defaults to current count)
- `metadata` (object)

**Response:** Created stop object

### `PUT /trips/:tripId/stops/:stopId`
Update existing stop.

**Auth Required:** ✅ (Teacher/Admin)
**Request:** Same fields as POST (all optional)
**Response:** Updated stop object

### `DELETE /trips/:tripId/stops/:stopId`
Delete stop.

**Auth Required:** ✅ (Teacher/Admin)
**Response:** `200 OK`

---

## 📦 Modules Endpoints

### `GET /trips/:tripId/modules`
Get all modules for a trip.

**Response:**
```json
[
  {
    "id": "module-uuid",
    "tripId": "trip-uuid",
    "title": "Day 1: Arrival",
    "description": "First day in Paris",
    "orderIndex": 0,
    "icon": "🏨",
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
]
```

### `POST /trips/:tripId/modules`
Create new module.

**Auth Required:** ✅ (Teacher/Admin)
**Request:**
```json
{
  "title": "Day 1: Arrival",
  "description": "First day in Paris",
  "orderIndex": 0,
  "icon": "🏨"
}
```

### `PUT /trips/:tripId/modules/:moduleId`
Update module.

**Auth Required:** ✅ (Teacher/Admin)

### `DELETE /trips/:tripId/modules/:moduleId`
Delete module (cascades to content items).

**Auth Required:** ✅ (Teacher/Admin)

---

## 📄 Content Endpoints

### `GET /modules/:moduleId/contents`
Get all content items for a module.

**Response:**
```json
[
  {
    "id": "content-uuid",
    "moduleId": "module-uuid",
    "tripId": "trip-uuid",
    "type": "text",
    "title": "Welcome to Paris",
    "body": "Paris is the capital of France...",
    "mediaUrl": null,
    "thumbnailUrl": null,
    "metadata": {},
    "orderIndex": 0,
    "published": true,
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
]
```

**Content Types:**
- `text` - Rich text content
- `image` - Image with caption
- `audio` - Audio guide
- `video` - Video content
- `location` - Map location
- `schedule` - Time-based activities
- `activity` - Interactive activity/game

### `POST /modules/:moduleId/contents`
Create new content item.

**Auth Required:** ✅ (Teacher/Admin)
**Request:**
```json
{
  "type": "text",
  "title": "Welcome to Paris",
  "body": "Paris is the capital of France...",
  "mediaUrl": "https://...",
  "thumbnailUrl": "https://...",
  "metadata": {},
  "orderIndex": 0
}
```

### `PUT /content/:contentId`
Update content item.

**Auth Required:** ✅ (Teacher/Admin)

### `DELETE /content/:contentId`
Delete content item.

**Auth Required:** ✅ (Teacher/Admin)

### `POST /content/:contentId/publish`
Publish content item.

**Auth Required:** ✅ (Teacher/Admin)

---

## 📋 Manifest Endpoints

### `POST /manifest/:tripId/generate`
Generate offline manifest for a trip.

**Auth Required:** ✅ (Teacher/Admin)
**Response:**
```json
{
  "message": "Manifest generated successfully",
  "manifest": {
    "tripId": "trip-uuid",
    "version": 1,
    "trip": { ... },
    "modules": [ ... ],
    "stops": [ ... ],
    "generatedAt": "2024-01-11T12:00:00.000Z"
  }
}
```

### `GET /manifest/:tripId`
Get latest manifest for a trip (public for student downloads).

**Response:** Manifest object

---

## 📤 Upload Endpoints

### `POST /upload`
Upload generic file.

**Auth Required:** ✅ (Teacher/Admin)
**Content-Type:** `multipart/form-data`
**Form Data:**
- `file` - File to upload
- `folder` (optional) - Destination folder

**Response:**
```json
{
  "url": "https://blob.vercel-storage.com/...",
  "filename": "image.jpg",
  "mimetype": "image/jpeg",
  "size": 123456
}
```

### `POST /upload/image`
Upload image file (validates image mimetype).

**Auth Required:** ✅ (Teacher/Admin)

### `POST /upload/audio`
Upload audio file.

**Auth Required:** ✅ (Teacher/Admin)

### `POST /upload/video`
Upload video file.

**Auth Required:** ✅ (Teacher/Admin)

### `DELETE /upload` ⭐ NEW
Delete file from blob storage.

**Auth Required:** ✅ (Teacher/Admin)
**Request:**
```json
{
  "url": "https://blob.vercel-storage.com/..."
}
```

**Response:**
```json
{
  "message": "File deleted successfully",
  "url": "https://blob.vercel-storage.com/..."
}
```

---

## 🔄 Progress Sync Endpoints ⭐ NEW

### `POST /sync/progress`
Sync student progress data from offline to server.

**Auth Required:** ✅ (Student)
**Request:**
```json
{
  "tripId": "trip-uuid",
  "progress": {
    "completedContent": ["content-id-1", "content-id-2"],
    "viewedContent": ["content-id-1", "content-id-2", "content-id-3"],
    "lastPosition": {
      "moduleId": "module-uuid",
      "contentId": "content-uuid"
    },
    "customData": {}
  }
}
```

**Response:**
```json
{
  "message": "Progress synced successfully",
  "syncedAt": "2024-01-11T12:00:00.000Z"
}
```

### `GET /sync/progress/:tripId`
Get synced progress for specific trip.

**Auth Required:** ✅ (Student)
**Response:**
```json
{
  "tripId": "trip-uuid",
  "progress": { ... },
  "lastSyncedAt": 1234567890,
  "createdAt": 1234567890
}
```

### `GET /sync/progress`
Get all synced progress for current user.

**Auth Required:** ✅ (Student)
**Response:**
```json
[
  {
    "tripId": "trip-uuid",
    "progress": { ... },
    "lastSyncedAt": 1234567890,
    "createdAt": 1234567890
  }
]
```

### `DELETE /sync/progress/:tripId`
Delete progress for specific trip.

**Auth Required:** ✅ (Student)
**Response:** `200 OK`

---

## 📊 Stats Endpoints

### `GET /stats/dashboard`
Get dashboard statistics.

**Auth Required:** ✅ (Admin)
**Response:**
```json
{
  "users": 50,
  "trips": 10,
  "modules": 85,
  "contentItems": 420,
  "manifests": 10,
  "downloads": 150
}
```

---

## 🏥 Health Check

### `GET /health`
Check API server health.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-11T12:00:00.000Z"
}
```

---

## 🔄 Response Format

All API responses use **camelCase** field names (automatically transformed from database snake_case).

### Success Response
```json
{
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (authenticated but no permission)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔐 Authentication

Include JWT token in Authorization header:

```
Authorization: Bearer <token>
```

Token is returned from `/auth/login` and expires after 7 days.

---

## 🚀 Rate Limiting

Currently: **No rate limiting** (consider adding for production)

---

## 📝 Notes

1. **Field Naming:** All responses use camelCase. Request bodies accept both camelCase and snake_case.

2. **Timestamps:** All timestamps are Unix timestamps (seconds since epoch).

3. **UUIDs:** All IDs are UUID v4 format.

4. **Cascade Deletes:** Deleting a trip deletes all modules, content, and stops.

5. **Publishing:** Students only see published trips and content by default.

6. **File Uploads:** Max file size is 50MB. Files are stored in Vercel Blob storage.

---

**Last Updated:** 2026-01-11
**API Version:** 1.0
