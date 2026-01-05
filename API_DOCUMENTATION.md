# Extra Muros API Documentation

Base URL: `http://localhost:3000/api` (development) or `https://your-domain.com/api` (production)

## Authentication

All authenticated endpoints require either:
1. JWT token in `Authorization` header: `Bearer <token>`
2. JWT token in cookie (automatically set on login)

### Role-Based Access Control

- **Admin**: Full access to all endpoints
- **Teacher**: Can create, update, and publish content
- **Student**: Read-only access to published content

## Endpoints

### Health Check

#### GET `/health`
Check API server status (public endpoint)

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-05T20:00:00.000Z"
}
```

---

## Authentication Endpoints

### POST `/auth/login`
Authenticate user and receive JWT token

**Request**:
```json
{
  "email": "admin@school.be",
  "password": "changeme123"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@school.be",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- `400`: Invalid email format or missing fields
- `401`: Invalid credentials

---

### POST `/auth/logout`
Logout and clear authentication cookie

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

---

### GET `/auth/me`
Get current authenticated user info

**Headers**: Requires authentication

**Response** (200):
```json
{
  "id": "uuid",
  "email": "admin@school.be",
  "role": "admin",
  "firstName": "Admin",
  "lastName": "User"
}
```

**Errors**:
- `401`: Not authenticated
- `404`: User not found

---

## Trip Endpoints

### GET `/trips`
Get all trips

**Query Parameters**:
- `published` (boolean): Filter by published status

**Response** (200):
```json
[
  {
    "id": "uuid",
    "title": "Paris 2025",
    "description": "3-day educational trip to Paris",
    "destination": "Paris, France",
    "start_date": "2025-04-28",
    "end_date": "2025-04-30",
    "cover_image_url": "https://blob.vercel-storage.com/...",
    "published": 1,
    "manifest_version": 1,
    "created_by": "uuid",
    "created_at": 1704484800,
    "updated_at": 1704484800
  }
]
```

---

### GET `/trips/:id`
Get single trip by ID

**Response** (200):
```json
{
  "id": "uuid",
  "title": "Paris 2025",
  "description": "3-day educational trip to Paris",
  "destination": "Paris, France",
  "start_date": "2025-04-28",
  "end_date": "2025-04-30",
  "cover_image_url": "https://blob.vercel-storage.com/...",
  "published": 1,
  "manifest_version": 1,
  "created_by": "uuid",
  "created_at": 1704484800,
  "updated_at": 1704484800
}
```

**Errors**:
- `404`: Trip not found

---

### POST `/trips`
Create a new trip

**Headers**: Requires authentication (teacher/admin)

**Request**:
```json
{
  "title": "Paris 2025",
  "description": "3-day educational trip to Paris",
  "destination": "Paris, France",
  "startDate": "2025-04-28",
  "endDate": "2025-04-30",
  "coverImageUrl": "https://blob.vercel-storage.com/..."
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "title": "Paris 2025",
  ...
}
```

**Errors**:
- `400`: Validation errors
- `401`: Not authenticated
- `403`: Insufficient permissions

---

### PUT `/trips/:id`
Update trip

**Headers**: Requires authentication (teacher/admin)

**Request**:
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response** (200): Updated trip object

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Trip not found

---

### DELETE `/trips/:id`
Delete trip

**Headers**: Requires authentication (admin only)

**Response** (200):
```json
{
  "message": "Trip deleted successfully"
}
```

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions (admin only)
- `404`: Trip not found

---

### POST `/trips/:id/publish`
Publish trip and increment manifest version

**Headers**: Requires authentication (teacher/admin)

**Response** (200): Updated trip object with `published = 1`

---

## Module Endpoints

### GET `/modules/trip/:tripId`
Get all modules for a trip

**Response** (200):
```json
[
  {
    "id": "uuid",
    "trip_id": "uuid",
    "title": "Day 1 - Monday April 28",
    "description": "First day itinerary",
    "order_index": 0,
    "icon": "calendar",
    "created_at": 1704484800,
    "updated_at": 1704484800
  }
]
```

---

### GET `/modules/:id`
Get single module by ID

**Response** (200): Module object

---

### POST `/modules`
Create a new module

**Headers**: Requires authentication (teacher/admin)

**Request**:
```json
{
  "tripId": "uuid",
  "title": "Day 1 - Monday April 28",
  "description": "First day itinerary",
  "orderIndex": 0,
  "icon": "calendar"
}
```

**Response** (201): Created module object

---

### PUT `/modules/:id`
Update module

**Headers**: Requires authentication (teacher/admin)

**Request**:
```json
{
  "title": "Updated Title",
  "order_index": 1
}
```

**Response** (200): Updated module object

---

### DELETE `/modules/:id`
Delete module

**Headers**: Requires authentication (admin only)

**Response** (200):
```json
{
  "message": "Module deleted successfully"
}
```

---

## Content Endpoints

### GET `/content/module/:moduleId`
Get all content items for a module

**Query Parameters**:
- `published` (boolean): Filter by published status

**Response** (200):
```json
[
  {
    "id": "uuid",
    "trip_id": "uuid",
    "module_id": "uuid",
    "type": "text",
    "title": "Welcome to Paris",
    "body": "Paris is the capital of France...",
    "media_url": null,
    "thumbnail_url": null,
    "metadata": null,
    "order_index": 0,
    "published": 1,
    "created_at": 1704484800,
    "updated_at": 1704484800
  }
]
```

---

### GET `/content/:id`
Get single content item by ID

**Response** (200): Content item object

---

### POST `/content`
Create a new content item

**Headers**: Requires authentication (teacher/admin)

**Request**:
```json
{
  "tripId": "uuid",
  "moduleId": "uuid",
  "type": "text",
  "title": "Welcome to Paris",
  "body": "Paris is the capital of France...",
  "mediaUrl": null,
  "thumbnailUrl": null,
  "metadata": {
    "coordinates": {
      "lat": 48.8566,
      "lng": 2.3522
    }
  },
  "orderIndex": 0
}
```

**Valid types**: `text`, `image`, `audio`, `video`, `location`, `activity`, `schedule`

**Response** (201): Created content item object

---

### PUT `/content/:id`
Update content item

**Headers**: Requires authentication (teacher/admin)

**Request**:
```json
{
  "title": "Updated Title",
  "body": "Updated content"
}
```

**Response** (200): Updated content item object

---

### DELETE `/content/:id`
Delete content item

**Headers**: Requires authentication (admin only)

**Response** (200):
```json
{
  "message": "Content item deleted successfully"
}
```

---

### POST `/content/:id/publish`
Publish content item

**Headers**: Requires authentication (teacher/admin)

**Response** (200): Updated content item with `published = 1`

---

## Upload Endpoints

### POST `/upload`
Upload any file type

**Headers**:
- Requires authentication (teacher/admin)
- `Content-Type: multipart/form-data`

**Request**: FormData with:
- `file`: File to upload
- `folder` (optional): Target folder name

**Response** (200):
```json
{
  "url": "https://blob.vercel-storage.com/uploads/1704484800-file.jpg",
  "filename": "file.jpg",
  "mimetype": "image/jpeg",
  "size": 1024000
}
```

---

### POST `/upload/image`
Upload image file

**Headers**:
- Requires authentication (teacher/admin)
- `Content-Type: multipart/form-data`

**Request**: FormData with:
- `image`: Image file

**Accepted types**: JPEG, PNG, GIF, WebP

**Response** (200): Same as `/upload`

---

### POST `/upload/audio`
Upload audio file

**Headers**:
- Requires authentication (teacher/admin)
- `Content-Type: multipart/form-data`

**Request**: FormData with:
- `audio`: Audio file

**Accepted types**: MP3, WAV, OGG

**Response** (200): Same as `/upload`

---

### POST `/upload/video`
Upload video file

**Headers**:
- Requires authentication (teacher/admin)
- `Content-Type: multipart/form-data`

**Request**: FormData with:
- `video`: Video file

**Accepted types**: MP4, MPEG, QuickTime

**Response** (200): Same as `/upload`

**File size limits**:
- Images: 10MB
- Audio: 50MB
- Video: 50MB

---

## Manifest Endpoints

### POST `/manifest/:tripId/generate`
Generate offline manifest for a trip

**Headers**: Requires authentication (teacher/admin)

**Description**: Generates a complete offline-ready manifest containing all published content for the trip, grouped by modules.

**Response** (200):
```json
{
  "message": "Manifest generated successfully",
  "manifest": {
    "tripId": "uuid",
    "version": 1,
    "trip": {
      "id": "uuid",
      "title": "Paris 2025",
      "description": "3-day educational trip to Paris",
      "destination": "Paris, France",
      "startDate": "2025-04-28",
      "endDate": "2025-04-30",
      "coverImageUrl": "https://..."
    },
    "modules": [
      {
        "id": "uuid",
        "trip_id": "uuid",
        "title": "Day 1",
        "description": "First day itinerary",
        "order_index": 0,
        "icon": "calendar",
        "content": [
          {
            "id": "uuid",
            "type": "text",
            "title": "Welcome",
            "body": "...",
            "mediaUrl": null,
            "thumbnailUrl": null,
            "metadata": null,
            "orderIndex": 0
          }
        ]
      }
    ],
    "generatedAt": "2025-01-05T20:00:00.000Z"
  }
}
```

---

### GET `/manifest/:tripId`
Get manifest for a trip (public endpoint)

**Description**: Students use this endpoint to download the offline manifest.

**Response** (200): Same manifest object as above

**Errors**:
- `404`: Manifest not found (not yet generated)

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message",
  "errors": {
    "field": "Field-specific error"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production using:
- Vercel Edge Config
- Express rate-limit middleware
- API Gateway

---

## Pagination

Currently not implemented. For large datasets, consider adding pagination with:
- Query parameters: `?page=1&limit=20`
- Response headers: `X-Total-Count`, `X-Page`, `X-Per-Page`

---

## Example Usage

### JavaScript/Fetch
```javascript
// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@school.be',
    password: 'changeme123'
  })
});
const { token } = await response.json();

// Get trips with auth
const trips = await fetch('http://localhost:3000/api/trips', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### cURL
```bash
# Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.be","password":"changeme123"}' \
  | jq -r '.token')

# Get trips
curl http://localhost:3000/api/trips \
  -H "Authorization: Bearer $TOKEN"

# Upload image
curl -X POST http://localhost:3000/api/upload/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@photo.jpg"
```

### Axios (React)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true // Include cookies
});

// Login
const { data } = await api.post('/auth/login', {
  email: 'admin@school.be',
  password: 'changeme123'
});

// Set token for future requests
api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

// Get trips
const trips = await api.get('/trips');
```

---

## Webhooks (Future Feature)

Consider adding webhooks for:
- New content published
- Trip updated
- Manifest generated

---

## API Versioning

Current version: **v1** (implicit)

Future versions should use URL versioning:
- `/api/v2/trips`
- Or header versioning: `Accept: application/vnd.extramuros.v2+json`
