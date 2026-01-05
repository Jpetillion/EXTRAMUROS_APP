# EXTRA MUROS — UI SYSTEM (Atomic / Molecular)

Doel: **consistentie** en **snel bouwen**.  
We gebruiken een eenvoudig Atomic Design systeem dat in beide apps identiek kan zijn.

---

## 1) Principles
- 1 component = 1 verantwoordelijkheid
- UI staat los van data (data komt uit `features/`)
- Maak states zichtbaar: loading, empty, error
- Houd CSS simpel: Tailwind + (optioneel) DaisyUI

---

## 2) Folder structuur (per app)

```
src/ui/
├─ atoms/
├─ molecules/
├─ organisms/
└─ patterns/        # (optioneel) grotere templates/layouts
```

---

## 3) Atoms (basis)

### Button
Props:
- `variant`: primary/secondary/ghost/danger
- `size`: sm/md/lg
- `loading`: boolean

### Input / Textarea
Props:
- `label`, `hint`, `error`
- `value`, `onChange`

### Card
- Title + body + actions

### Badge
- status tags (draft/published/offline)

### Progress
- download progress bar

### Icon
- lucide-react icons (optioneel)

---

## 4) Molecules (bouwstenen)

### FormRow
- Label + input + error

### Toolbar
- Title + primary CTA + secondary actions

### Modal / Dialog
- confirm delete, publish confirm

### FilePicker
- upload input + preview + remove

### AudioPlayer
- play/pause, seek, time display (student app)

### EmptyState
- icon + explanation + CTA

---

## 5) Organisms (feature-level UI)

### Teacher
- `TripEditor`
- `ModuleEditor`
- `ContentItemEditor` (switch per type)
- `PublishPanel`
- `TripListTable`

### Student
- `TripDownloader`
- `OfflineLibrary`
- `ContentViewer`
- `UpdateBanner`

---

## 6) Patterns (optioneel)
- `PageLayout`
- `TwoColumnEditorLayout` (teacher: list left, editor right)
- `ViewerLayout` (student: module nav + item view)

---

## 7) Shared design tokens (aanbevolen)
- spacing: 4/8/12/16/24
- radius: md/lg
- 1 font scale: sm/base/lg/xl/2xl
- colors via DaisyUI theme:
  - primary (school color)
  - secondary
  - neutral
  - danger

---

## 8) UX states (verplicht)

### Loading
- skeletons voor lists
- disabled publish button + spinner

### Empty
- “Nog geen trips” (teacher)
- “Nog geen downloads” (student)

### Error
- inline field errors (forms)
- toast/snackbar voor transient errors
- dedicated error page voor fatal errors

---

## 9) Accessibility baseline
- Buttons focusable
- Form labels verbonden
- Contrast ok
- Keyboard navigation voor main flows
