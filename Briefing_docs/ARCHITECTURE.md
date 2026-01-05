# EXTRA MUROS — ARCHITECTURE (Teacher SSR + Student Offline PWA)

Deze doc beschrijft **hoe** het project gebouwd is, waarom de keuzes zo zijn, en hoe de 2 delen samenwerken.

---

## 1) Project split & verantwoordelijkheden

### 1. Teacher Admin (SSR website)
**Doel:** leerkrachten kunnen Extra Muros content aanmaken en publiceren.

**Eigenschappen**
- SSR (Next.js) voor snelle admin UX + auth + server actions/routes.
- Niet offline-first nodig.
- Alleen geauthenticeerde users (teacher/admin).

**Belangrijkste flows**
- Login → beheer trips → maak modules/items → upload media → publiceer → manifest komt beschikbaar.

---

### 2. Student App (Offline-first PWA)
**Doel:** leerlingen kunnen de Extra Muros raadplegen, liefst ook zonder internet.

**Eigenschappen**
- Installable PWA.
- Offline-first: app shell + content + media offline.
- Leest **alleen public manifest** (geen auth voor basis use-case).

**Belangrijkste flows**
- Trip kiezen → manifest ophalen → download assets → offline viewer.

---

## 2) Data model (Turso / SQLite)

### Kernidee
We scheiden:
- **Brondata (draft/authoring)**: trips/modules/items die teachers bewerken.
- **Published snapshot**: het manifest (immutable-ish) dat student gebruikt.

### Tabellen (aanbevolen minimum)

**Auth**
- `users(id, email, password_hash, role, created_at)`
- `sessions(id, user_id, expires_at, created_at)`

**Authoring**
- `trips(id, title, description, cover_url, status, updated_at)`
- `modules(id, trip_id, title, sort_order)`
- `content_items(id, trip_id, module_id, type, title, body, media_url, media_meta_json, is_published, sort_order, updated_at)`

**Publishing**
- `manifests(trip_id, version, manifest_json, created_at, created_by_user_id)`

> Optioneel later: `audit_log`, `tags`, `languages`, `student_progress`.

---

## 3) Manifest architecture (public contract)

### Waarom een manifest?
- Student app hoeft geen complexe API calls te doen.
- Offline caching wordt eenvoudiger: “download alles wat in manifest staat”.
- Update-check: manifest `version` + item-hash maakt delta updates mogelijk.

### Manifest structuur (voorbeeld)
```json
{
  "tripId": "paris-2026",
  "title": "Parijs",
  "version": 7,
  "generatedAt": "2026-01-05T20:10:00Z",
  "modules": [
    {
      "id": "m1",
      "title": "Dag 1",
      "items": [
        {
          "id": "i10",
          "type": "audio",
          "title": "Intro",
          "body": null,
          "mediaUrl": "https://.../i10.mp3",
          "hash": "sha256-...",
          "updatedAt": "..."
        }
      ]
    }
  ]
}
```

### Hashing policy
- `hash` = sha256 van asset bytes (of ETag van storage provider als betrouwbaar)
- Doel: delta updates → alleen assets met nieuwe hash opnieuw downloaden

---

## 4) API contract (hoog niveau)

### Teacher SSR (private)
- CRUD endpoints (auth required):
  - `/api/trips`, `/api/modules`, `/api/items`
- Upload endpoint (auth required):
  - `/api/upload` → returns `{ url, meta }`
- Publish endpoint (auth required):
  - `POST /api/publish/:tripId` → build + store manifest

### Public (student)
- `GET /api/public/manifest?tripId=...`
  - returns latest manifest JSON for published trip

---

## 5) Auth & security

### Teacher Admin auth
- Password hashing (bcrypt/argon2)
- Session cookies (httpOnly, secure in prod)
- Role-based guards:
  - admin: user management, publish all
  - teacher: manage own trips (optioneel: trip ownership)

### Student access
- Public read-only manifest
- Later uitbreidbaar:
  - trip access tokens
  - school login
  - QR codes with signed payload

---

## 6) Media storage strategy

### Waarom niet in Turso?
- Audio/images zijn groot, SQLite is niet bedoeld als blob-store.
- Gebruik object storage (R2/Blob/S3).

### In DB opslaan
- `mediaUrl`
- `media_meta_json` (mime, size, duration, width, height)

### Cache headers
- Assets: `Cache-Control: public, max-age=31536000, immutable` (bij versie URLs)
- Manifest: short cache (maar we willen live updates)

---

## 7) Student offline architecture (overzicht)

### Storage layers
- **Cache Storage**: media files + app shell
- **IndexedDB**: manifest snapshots + download status + metadata

### Download pipeline
1. Fetch manifest
2. Persist manifest in IndexedDB
3. Enqueue asset URLs
4. Fetch assets + store in Cache Storage
5. Update progress in IndexedDB

### Viewer reads
- Manifest: IndexedDB (fallback to network if empty)
- Media: Cache Storage (fallback to network if not cached)

---

## 8) Error handling & resilience

### Teacher
- Validations server-side
- Upload retry / clear error message
- Publish should be atomic:
  - build manifest
  - store manifest
  - update trip status to published

### Student
- If download interrupted:
  - mark item as pending
  - resume later
- If storage full:
  - show “ruimte vrijmaken” screen
  - allow deleting downloaded trips

---

## 9) Performance considerations

### Teacher SSR
- Use server-side pagination for lists
- Avoid fetching massive blobs

### Student PWA
- Lazy render items
- Audio streaming fallback when online
- Prefer small image variants (thumbnail + full)

---

## 10) Deployment

### Teacher SSR
- Vercel (Next.js)
- Env vars: TURSO_URL, TURSO_AUTH_TOKEN, STORAGE keys

### Student PWA
- Static hosting (Vercel/Netlify)
- Ensure service worker served correctly (HTTPS)

---

## 11) Extensibility roadmap (later)
- QR scanning to select trip
- Student progress tracking (optional, needs auth)
- Multi-language content
- Push notifications (PWA)
- Trip expiry / download policies
