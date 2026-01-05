# EXTRA MUROS — OFFLINE_FIRST (Student PWA)

Dit document beschrijft de **offline-first aanpak** voor de student PWA, inclusief caching, IndexedDB schema, update-mechanisme, en test checklist.

---

## 1) Offline goals (wat moet werken zonder internet)

**Must-have**
- App kan openen zonder internet (installable + app shell cached)
- Gedownloade trip openen zonder internet
- Alle content items bekijken (text/image/audio)
- Audio afspelen offline
- “Download progress” + “download complete” state betrouwbaar

**Nice-to-have**
- Offline search
- Storage usage indicator
- Background sync (waar browser het toelaat)

---

## 2) Storage plan

### A) Cache Storage (service worker)
We gebruiken Cache Storage voor:
- App shell: `index.html`, JS bundles, CSS, icons
- Media assets: images/audio URLs uit manifest

**Waarom Cache Storage?**
- Perfect voor request→response caching
- Works great with service worker fetch event
- Eenvoudig te verwijderen per trip (namespaced caches)

### B) IndexedDB
We gebruiken IndexedDB voor:
- Latest manifest per trip
- Download status per asset
- Metadata (lastSync, errors, sizes)

**Waarom IndexedDB?**
- Structured data, querybaar
- Niet bedoeld voor grote binaries (daarvoor Cache Storage)

---

## 3) Caching strategy (service worker)

### App shell caching
- Precache build artifacts (via Vite PWA plugin)
- Strategie: `CacheFirst` voor shell files

### Manifest fetching
- Strategie: `NetworkFirst` met fallback naar IndexedDB
- Manifest wordt na fetch altijd in IndexedDB opgeslagen

### Media assets
- Tijdens download: expliciet fetch + put in cache
- Tijdens viewer: `CacheFirst` (offline guaranteed)

---

## 4) IndexedDB schema (suggestie)

Database: `extramuros`

### Stores
1. `trips`
- key: `tripId`
- value: `{ tripId, title, version, manifest, downloadedAt, lastSyncAt }`

2. `assets`
- key: `assetKey` (bv. `${tripId}:${itemId}`)
- value:
  ```js
  {
    tripId,
    itemId,
    url,
    hash,
    status: "pending" | "downloading" | "done" | "error",
    bytes: 0,
    error: null,
    updatedAt
  }
  ```

3. `settings` (optioneel)
- things like: max storage warning thresholds

---

## 5) Download manager design

### Inputs
- `tripId`
- `manifest` (from public endpoint)

### Steps
1. Save manifest to IndexedDB `trips`
2. Build asset list from manifest items:
   - include `mediaUrl` for image/audio
3. For each asset:
   - set status `pending`
4. Process queue:
   - set status `downloading`
   - fetch asset
   - cache.put(request, response.clone())
   - set status `done` (store hash)

### Progress calculation
- `doneAssets / totalAssets`
- optionally by bytes if we track `Content-Length` when available

### Retry policy
- exponential backoff for transient errors
- allow “retry all failed” button

---

## 6) Delta updates (manifest version + hash compare)

### Update check
- On app start (online) or “Check updates”
- Fetch latest manifest
- If `version` > stored version:
  - compare items by `itemId` (or url)
  - if hash differs:
    - re-download that asset
  - if item removed:
    - optionally keep old asset (or delete) — decide policy

### Policies (kies en documenteer)
- **Strict sync**: remove assets not in new manifest (clean)
- **Lenient**: keep old assets (safe, but uses more storage)

Aanrader voor schoolproject: **Strict sync** (simpel en voorspelbaar).

---

## 7) Trip deletion / storage management

### Delete trip
- Remove `trips[tripId]` from IndexedDB
- Remove assets for that trip from `assets` store
- Delete trip cache (namespaced)
  - `caches.delete('extramuros-trip-' + tripId)`

### Storage warnings
- If download fails due to quota:
  - show modal “Opslag vol”
  - offer delete old trips

---

## 8) Offline UX patterns (heel belangrijk)

### States
- **No downloads yet**: friendly empty state + CTA “Download een trip”
- **Offline + no trip downloaded**: show explanation + CTA “Ga online om te downloaden”
- **Offline + trip downloaded**: normal experience
- **Downloading**: show progress bar + “pause/cancel”
- **Failed**: list failed assets + retry button

### UI molecules/organisms (suggestie)
- `DownloadProgressCard`
- `OfflineBanner`
- `TripCard`
- `EmptyState`
- `StorageUsagePanel` (nice-to-have)

---

## 9) Test checklist (acceptance)

### Offline basics
- [ ] Open app first time online, then refresh offline → app still loads
- [ ] Download trip online → airplane mode → open trip → content visible
- [ ] Audio plays offline
- [ ] Images show offline

### Updates
- [ ] Teacher republishes with new asset
- [ ] Student check updates → only new asset downloads
- [ ] version increments and stored manifest updates

### Failure cases
- [ ] Kill tab during download → reopen → resume / retry works
- [ ] Simulate offline mid-download → errors show + retry works
- [ ] Storage full scenario → user can delete trip

---

## 10) Implementation notes (pragmatic)

- Gebruik `vite-plugin-pwa` voor precache + SW scaffolding.
- Vermijd “overly clever” caching; keep it explicit:
  - downloads do the caching
  - viewer reads the cache
- Maak caches **per trip**:
  - `extramuros-trip-paris-2026`
  - maakt delete/cleanup triviaal.
