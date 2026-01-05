# EXTRA MUROS — ROADMAP (Teacher SSR + Student PWA)

> **Project split**
>
> 1) **Teacher Admin (SSR website)** — leerkrachten maken Extra Muros content aan, beheren, publiceren.  
> 2) **Student App (Offline-first PWA)** — leerlingen bekijken Extra Muros content, kunnen trips downloaden en volledig offline gebruiken.

**Stack (afgesproken)**
- **DB:** Turso (libSQL / SQLite cloud)
- **Teacher Admin:** Next.js (App Router) — **JavaScript (geen TypeScript)** — SSR
- **Student App:** Vite + React — **JavaScript** — Offline-first PWA (Service Worker + Cache Storage + IndexedDB)
- **UI:** Tailwind + (optioneel) DaisyUI voor snelle consistente componenten
- **Media storage:** Cloudflare R2 / Vercel Blob / S3-compatible bucket (DB bewaart enkel URL + metadata)
- **Monorepo:** npm/pnpm workspaces (aanrader)

---

## 0) Definition of Done (globaal)

### Teacher Admin — DoD
- Teachers kunnen inloggen (session cookie).
- Trips, Modules en Content Items CRUD werkt (incl. sort order).
- Media upload (image/audio) werkt en bewaart `mediaUrl` + metadata.
- Publish-knop maakt een **manifest snapshot** (met `version`) en maakt publiek leesbaar.
- Rollen: **admin** vs **teacher** (minstens voor publish en user-management).

### Student PWA — DoD
- PWA is installable (manifest + service worker).
- Student kan **trip selecteren** (ID/QR later) en **manifest ophalen**.
- Student kan **trip downloaden** (manifest + assets).
- Vliegtuigmodus: trip opent, content is zichtbaar, audio speelt.
- Update-check: nieuwste manifest ophalen, alleen deltas downloaden (hash/version).

---

## 1) Monorepo folderstructuur (aanbevolen)

```
extramuros/
├─ apps/
│  ├─ teacher-web/                 # Next.js SSR admin
│  │  ├─ app/                      # Next.js App Router
│  │  ├─ src/
│  │  │  ├─ auth/                  # login, sessions, guards
│  │  │  ├─ db/                    # turso client + queries
│  │  │  ├─ features/              # domain features
│  │  │  ├─ ui/                    # atomic design (atoms/molecules/organisms)
│  │  │  └─ lib/                   # helpers
│  │  ├─ public/
│  │  ├─ tailwind.config.js
│  │  └─ next.config.js
│  │
│  └─ student-pwa/                 # Vite React offline-first PWA
│     ├─ src/
│     │  ├─ app/                   # router + layout shell
│     │  ├─ data/                  # manifest fetch + repositories
│     │  ├─ offline/               # SW, caching strategy, download manager
│     │  ├─ features/              # TripSelect, Download, Viewer, Updates
│     │  ├─ ui/                    # atoms/molecules/organisms
│     │  └─ lib/                   # helpers
│     ├─ public/
│     ├─ vite.config.js
│     └─ index.html
│
├─ packages/
│  ├─ shared-domain/               # (optioneel) manifest schema, constants
│  ├─ shared-utils/                # (optioneel) hashing, date utils
│  └─ shared-ui/                   # (optioneel) gedeelde atoms/molecules
│
├─ infra/
│  ├─ migrations/                  # SQL migrations (Turso)
│  ├─ seed/                        # seed scripts
│  └─ scripts/                     # publish, asset hashing, admin scripts
│
├─ docs/
│  ├─ ROADMAP.md
│  ├─ ARCHITECTURE.md
│  ├─ OFFLINE_FIRST.md
│  ├─ API.md
│  └─ UI_SYSTEM.md
│
└─ README.md
```

---

## 2) Roadmap in sprints (8 weken — praktisch & haalbaar)

> Werkwijze: **weekly goals + demo** (scrum light).  
> Elke week eindigt met: *demo*, *buglist*, *next week plan*.

### Week 1 — Setup & fundament
**Doelen**
- Monorepo + workspaces
- Turso DB + migrations baseline
- UI system (atoms) in beide apps
- CI basics (lint/format/build)

**Teacher (SSR)**
- Next.js App Router skeleton
- Auth setup: login form + session cookie
- Protected routes: `middleware` of server guard

**Student (PWA)**
- Vite React skeleton
- PWA setup (manifest + service worker)
- App shell cached (precaching)

**Deliverables**
- Repo bouwt en draait lokaal (2 apps).
- Eerste deploy “hello world” voor beide.

---

### Week 2 — CRUD v1 (Teacher) + Public manifest endpoint v0
**Teacher**
- CRUD: Trips
- CRUD: Modules (per trip)
- CRUD: ContentItems (text-only)
- Sort orders: drag later, nu via up/down buttons

**API**
- `GET /api/public/manifest?tripId=` geeft placeholder manifest terug (text-only)

**Student**
- “Trip select” screen (input tripId)
- Online viewer leest manifest en rendert text items

**Deliverables**
- Leerkracht kan een trip met modules + text items maken.
- Student kan die trip online lezen via manifest.

---

### Week 3 — Media uploads + Viewer v2 (image/audio)
**Teacher**
- Upload pipeline naar storage (R2/Blob)
- ContentItem type `image` en `audio`
- Metadata opslaan (mime, size, duration (audio), width/height (image))

**Student**
- Viewer ondersteunt image + audio online
- Audio player molecule (play/pause/seek basic)

**Deliverables**
- Trip bevat text + image + audio en is online bekijkbaar.

---

### Week 4 — Publish workflow + Manifest builder v1
**Teacher**
- Publish panel:
  - Validatie: required velden, modules sort order, item status
  - Build manifest JSON (snapshot)
  - `version++` + `generatedAt`
  - Store manifest in `manifests` table
- Preview link: “Open public view”

**Student**
- Student leest alleen manifest (geen directe item-API)
- Viewer werkt volledig op manifest data

**Deliverables**
- “Publiceer” maakt een stabiele snapshot manifest.

---

### Week 5 — Offline download v1 (core)
**Student**
- IndexedDB schema (manifest + download status)
- Download manager:
  - queue assets uit manifest
  - fetch + store in Cache Storage
  - progress UI (per trip + per item)
- Offline library: lijst van gedownloade trips

**Deliverables**
- Download trip → vliegtuigmodus → trip opent en werkt.

---

### Week 6 — Offline updates + robustness
**Student**
- Update-check:
  - fetch latest manifest
  - compare `version`
  - delta download op basis van `hash`/`updatedAt`
- Retry logic + error states
- “Storage usage” indicator (simpel)

**Teacher**
- UX polish:
  - reorder modules/items
  - search/filter in admin lists

**Deliverables**
- Nieuwe content publishen → student krijgt update en downloadt alleen verschillen.

---

### Week 7 — Rollen, rechten, audit + polish
**Teacher**
- Roles: admin/teacher
- Audit basics:
  - who published + timestamp
- User management (minimum): admin kan teacher accounts aanmaken (of seed)

**Student**
- UX polish:
  - empty states
  - offline banners
  - “no downloads yet” scherm
  - nicer download progress

**Deliverables**
- Rechten kloppen en UX is toonbaar aan directie.

---

### Week 8 — Test, bugfix, release, demo
**Focus**
- End-to-end flows testen:
  - Create → Publish → Fetch manifest → Download → Offline view
- Performance basics:
  - grote audio/images, caching correct
- Deploy:
  - teacher-web: Vercel
  - student-pwa: Vercel/Netlify/static host

**Deliverables**
- Demo trip (bv. Parijs) met realistische content.
- Install instructions voor PWA.
- Minimal “admin guide” en “student guide”.

---

## 3) Milestones (checkpoints)

### M1 — End of Week 2
- “Text-only Extra Muros” live end-to-end.

### M2 — End of Week 4
- Publish + manifest snapshot werkt stabiel.

### M3 — End of Week 5
- Offline-first MVP werkt.

### M4 — End of Week 8
- Roles, updates, polish, deployment, demo.

---

## 4) Task breakdown per onderdeel (moleculair)

### Teacher Admin — Features
- Auth
  - Login form, password hashing, sessions, route guard
- Trip management
  - List + create + edit + delete
  - Cover image
- Module management
  - Add/reorder modules within a trip
- Content items
  - Types: text/image/audio
  - Validation + preview
- Publish
  - Build manifest from published items
  - Versioning
  - Public manifest endpoint
- Users/Roles (min)
  - Admin can create teacher
  - Teacher can create/edit content

### Student PWA — Features
- Trip selection
  - Input tripId (later QR)
- Viewer
  - Module list
  - Item view (text/image/audio)
- Offline library
  - Downloaded trips list
- Download manager
  - Queue assets
  - Progress UI
- Updates
  - Check manifest version
  - Delta download (hash compare)
- Diagnostics (nice-to-have)
  - Storage info
  - Last sync time

---

## 5) Quality gates (per PR / per sprint)
- “Build passes” for both apps
- No secrets in repo (env vars)
- Data validation on server
- Basic accessibility: keyboard nav for main actions
- Offline test checklist: airplane mode scenario

---

## 6) Release plan (school demo)
- Demo script:
  1. Teacher logs in
  2. Creates trip + module + 1 text + 1 image + 1 audio
  3. Publishes
  4. Student selects trip, downloads
  5. Airplane mode: view + audio plays
  6. Teacher updates item, republishes
  7. Student checks updates → delta download
