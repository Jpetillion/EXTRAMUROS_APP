# HOSTING_STRUCTURE

## 1. Hosting Architecture

Je werkt met **ÉÉN GitHub-repository** met **DRIE aparte deployments**:

ONE REPO (GitHub)
├── server/ → Deployed as Vercel Serverless Functions (API)
├── admin/ → Deployed as Static Site (teachers)
├── student/ → Deployed as Static Site (students)
└── shared/ → NOT deployed (shared build-time code)


### Folder Roles

- **server/**
  - Express / API backend
  - Draait als Vercel Serverless Functions
- **admin/**
  - Webinterface voor leerkrachten
  - Desktop-first static site
- **student/**
  - Student applicatie
  - PWA, mobiel-first, installable
- **shared/**
  - Gedeelde utilities, types, validators, helpers
  - Enkel gebruikt tijdens build-time
  - Wordt niet gedeployed

---

## 2. Deployment Options

### Option A: Single Vercel Project (Monorepo) ✅ **Recommended**

- Eén GitHub repository  
- Eén Vercel project  
- Meerdere subdomeinen, elk gekoppeld aan een subfolder  



api.yourschool.com → server/
admin.yourschool.com → admin/
app.yourschool.com → student/


✔ Simpel  
✔ Centraal beheer  
✔ Eén CI/CD pipeline  
✔ Ondersteund door `vercel.json` (zoals opgezet)

---

### Option B: Separate Vercel Projects

- Eén GitHub repository  
- Drie aparte Vercel projecten  

Nadelen:
- Meer configuratie
- Meer kans op inconsistenties
- Moeilijker om shared code te beheren

❌ **Niet aanbevolen tenzij strikt nodig**

---

## 3. Two Separate Sites – Correct Setup

Ja, exact zoals bedoeld:

### Admin Site (`admin/`)
- Voor leerkrachten
- Desktop / laptop gebruik
- Beheer van vacatures, kandidaten, evaluaties, enz.

### Student PWA (`student/`)
- Voor studenten
- Mobile-first
- Installable als PWA
- Gericht op solliciteren, status volgen, notificaties

---

## 4. Shared Infrastructure

Beide sites delen:

- **Dezelfde backend API** (`server/`)
- **Dezelfde shared code** (`shared/`)
  - Validatie
  - Types
  - Helpers
  - API clients

➡️ Eén backend, twee frontends, gedeelde logica.

---

## 5. Summary

- ✅ Eén repo
- ✅ Eén backend
- ✅ Twee gescheiden frontends
- ✅ Heldere rolverdeling
- ✅ Schaalbaar en onderhoudsvriendelijk

Deze structuur is **productie-klaar**, **didactisch sterk** en **perfect geschikt** voor 