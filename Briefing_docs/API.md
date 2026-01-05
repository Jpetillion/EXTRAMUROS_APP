# EXTRA MUROS — API (Teacher SSR + Public Manifest)

Deze API is bewust **klein en voorspelbaar**.  
Teacher admin gebruikt private endpoints (auth), student gebruikt enkel public manifest.

---

## 1) Auth (Teacher)

### POST `/api/login`
**Body**
```json
{ "email": "teacher@school.be", "password": "..." }
```

**Response**
- Sets httpOnly session cookie
- Returns basic user info

### POST `/api/logout`
- Clears session cookie

---

## 2) Trips (Teacher, auth required)

### GET `/api/trips`
- Lists trips (pagination later)

### POST `/api/trips`
```json
{ "title": "Parijs", "description": "...", "coverUrl": "..." }
```

### PATCH `/api/trips/:tripId`
```json
{ "title": "...", "description": "...", "status": "draft" }
```

### DELETE `/api/trips/:tripId`

---

## 3) Modules (Teacher, auth required)

### POST `/api/trips/:tripId/modules`
```json
{ "title": "Dag 1", "sortOrder": 1 }
```

### PATCH `/api/modules/:moduleId`
```json
{ "title": "Dag 1", "sortOrder": 2 }
```

### DELETE `/api/modules/:moduleId`

---

## 4) Content items (Teacher, auth required)

### POST `/api/modules/:moduleId/items`
```json
{
  "type": "text",
  "title": "Intro",
  "body": "Welkom...",
  "mediaUrl": null,
  "mediaMeta": null,
  "isPublished": false,
  "sortOrder": 1
}
```

### PATCH `/api/items/:itemId`
```json
{
  "title": "Intro",
  "body": "Nieuwe tekst",
  "isPublished": true
}
```

### DELETE `/api/items/:itemId`

---

## 5) Uploads (Teacher, auth required)

### POST `/api/upload`
- multipart form-data (file)
- returns:
```json
{
  "url": "https://storage/.../file.mp3",
  "meta": { "mime": "audio/mpeg", "size": 123456, "duration": 98.4 }
}
```

---

## 6) Publish (Teacher, auth required)

### POST `/api/publish/:tripId`
- Validates published items
- Builds manifest snapshot
- Writes `manifests(tripId, version, manifest_json)`
- Sets trip status to `published`

**Returns**
```json
{ "tripId": "paris-2026", "version": 7 }
```

---

## 7) Public (Student)

### GET `/api/public/manifest?tripId=paris-2026`
Returns latest manifest for the trip.

**Response**
```json
{
  "tripId": "paris-2026",
  "title": "Parijs",
  "version": 7,
  "generatedAt": "2026-01-05T20:10:00Z",
  "modules": [...]
}
```

**Caching guidance**
- Manifest: `Cache-Control: no-store` (of very short)  
- Assets: long cache (immutable) **if** URLs are versioned or hash-based.

---

## 8) Error format (consistent)

Use a consistent JSON error:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": { "field": "title" }
  }
}
```

---

## 9) Security notes
- Teacher endpoints require session cookie
- Public endpoint is read-only and serves only published manifests
- Rate limiting later if needed (basic)
