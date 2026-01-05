# Deployment Architecture Guide

## Overview: One Repo, Three Apps, One Deployment

```
┌─────────────────────────────────────────────────────┐
│          GitHub Repository (One Repo)               │
│                                                     │
│  extra-muros/                                       │
│  ├── server/    (Express API)                       │
│  ├── admin/     (Teacher website)                   │
│  ├── student/   (Student PWA)                       │
│  └── shared/    (Shared utilities - NOT deployed)   │
└─────────────────────────────────────────────────────┘
                        │
                        │ Push to main branch
                        ▼
┌─────────────────────────────────────────────────────┐
│         Vercel (One Project - Monorepo)             │
│                                                     │
│  Automatic deployment on push                       │
│  Uses vercel.json configuration                     │
└─────────────────────────────────────────────────────┘
                        │
                        │ Deploys to
                        ▼
┌─────────────────────────────────────────────────────┐
│              Three Live Endpoints                    │
│                                                     │
│  1. api.yourschool.com     → server/  (API)         │
│  2. admin.yourschool.com   → admin/   (Teachers)    │
│  3. app.yourschool.com     → student/ (Students)    │
└─────────────────────────────────────────────────────┘
```

## The `shared/` Folder Explained

### What is it?
The `shared/` folder contains utility code that is **used by all three apps during development** but is **NOT deployed separately**.

### What's inside?
- `constants.js` - Content types, user roles, API URLs
- `utils.js` - Date formatting, file size formatting, etc.
- `index.js` - Exports everything

### How does it work?
```javascript
// In admin/src/utils/api.js
import { API_BASE_URL, CONTENT_TYPES } from '../../../shared';

// In student/src/utils/storage.js
import { CONTENT_TYPES, formatDate } from '../../../shared';

// In server/routes/trips.js
import { USER_ROLES } from '../../shared';
```

### During Build
When you build each app, the shared code is **bundled into** that app's build output. So:
- `admin/dist/` includes the shared code it uses
- `student/dist/` includes the shared code it uses
- `server/` imports shared code directly

### Deployment
- ✅ `server/` deployed → Uses shared code directly
- ✅ `admin/` deployed → Shared code bundled in `dist/`
- ✅ `student/` deployed → Shared code bundled in `dist/`
- ❌ `shared/` NOT deployed separately (it's just source code)

Think of `shared/` like a mini npm package that lives in your repo.

---

## Deployment Option 1: Single Vercel Project (Monorepo) ✅ RECOMMENDED

### Advantages
- ✅ One deployment workflow
- ✅ One set of environment variables
- ✅ Easier to manage
- ✅ Shared domain management
- ✅ One GitHub webhook

### Setup Steps

#### 1. Prepare Repository
```bash
cd "/Volumes/Extreme_SSD/All_My_Files_DEC_2023/Lesgeven/2025-2026/AD/EXTRA MUROS APP"

# Initialize git if not already
git init
git add .
git commit -m "Initial commit: Complete Extra Muros system"

# Create GitHub repo and push
gh repo create yourschool/extra-muros --private
git remote add origin https://github.com/yourschool/extra-muros.git
git push -u origin main
```

#### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy
vercel --prod
```

#### 3. Configure Domains in Vercel Dashboard

Go to Vercel Dashboard → Your Project → Settings → Domains

Add three domains:
1. `api.yourschool.com` → Routes to server (API)
2. `admin.yourschool.com` → Routes to admin
3. `app.yourschool.com` → Routes to student

#### 4. Configure DNS

In your domain registrar (e.g., CloudFlare, GoDaddy):

```
Type    Name     Value
─────────────────────────────────────
CNAME   api      cname.vercel-dns.com
CNAME   admin    cname.vercel-dns.com
CNAME   app      cname.vercel-dns.com
```

#### 5. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
# Server (applies to all deployments)
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
JWT_SECRET=your-secret-key
NODE_ENV=production

# CORS (important!)
CORS_ORIGINS=https://admin.yourschool.com,https://app.yourschool.com
```

#### 6. Update vercel.json

Your existing `vercel.json` already handles this:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "admin/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "student/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.js"
    },
    {
      "src": "/admin",
      "dest": "admin/index.html"
    },
    {
      "src": "/admin/(.*)",
      "dest": "admin/$1"
    },
    {
      "src": "/(.*)",
      "dest": "student/$1"
    }
  ]
}
```

---

## Deployment Option 2: Separate Vercel Projects

### When to use?
- Different teams manage each app
- Need separate billing
- Want completely isolated deployments

### Structure
```
GitHub: yourschool/extra-muros           (monorepo)

Vercel Project 1: extra-muros-api        (server/)
Vercel Project 2: extra-muros-admin      (admin/)
Vercel Project 3: extra-muros-student    (student/)
```

### Setup
Each needs separate vercel.json, but more complex to manage.

**❌ Not recommended** - adds unnecessary complexity.

---

## How Routing Works

### With Custom Domains (Production)

| URL | Goes To | Purpose |
|-----|---------|---------|
| `api.yourschool.com/*` | `server/index.js` | API endpoints |
| `admin.yourschool.com/*` | `admin/dist/` | Teacher portal |
| `app.yourschool.com/*` | `student/dist/` | Student PWA |

### Without Custom Domains (Vercel Default)

| URL | Goes To | Purpose |
|-----|---------|---------|
| `yourproject.vercel.app/api/*` | `server/index.js` | API |
| `yourproject.vercel.app/admin/*` | `admin/dist/` | Admin |
| `yourproject.vercel.app/*` | `student/dist/` | Student |

---

## Build Process

### What happens when you push to GitHub?

1. **Vercel detects changes**
2. **Runs builds in parallel:**
   ```bash
   # Server
   cd server && npm install
   # (No build needed - Node.js runs directly)

   # Admin
   cd admin && npm install && npm run build
   # Creates admin/dist/

   # Student
   cd student && npm install && npm run build
   # Creates student/dist/ with service worker
   ```
3. **Deploys each to correct route**
4. **Custom domains point to routes**

### Build Commands

Vercel automatically runs:
- **Admin**: `cd admin && npm run build`
- **Student**: `cd student && npm run build`
- **Server**: No build needed (Node.js)

These are configured in `vercel.json`.

---

## Environment Variables by App

### Server (API)
```env
TURSO_DATABASE_URL=...
TURSO_AUTH_TOKEN=...
BLOB_READ_WRITE_TOKEN=...
JWT_SECRET=...
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://admin.yourschool.com,https://app.yourschool.com
```

### Admin (Frontend)
```env
VITE_API_URL=https://api.yourschool.com/api
```

### Student (Frontend)
```env
VITE_API_URL=https://api.yourschool.com/api
```

In Vercel, set these in:
**Settings → Environment Variables → Production**

---

## Local Development vs Production

### Local Development
```bash
# Terminal 1: Server
cd server && npm run dev
# Runs at http://localhost:3000

# Terminal 2: Admin
cd admin && npm run dev
# Runs at http://localhost:5173
# Proxies /api to http://localhost:3000

# Terminal 3: Student
cd student && npm run dev
# Runs at http://localhost:5174
# Proxies /api to http://localhost:3000
```

All three apps talk to the same local API server.

### Production
```
api.yourschool.com        ← Server running as Vercel Function
admin.yourschool.com      ← Static files from admin/dist/
app.yourschool.com        ← Static files from student/dist/
```

Admin and Student apps call: `https://api.yourschool.com/api/*`

---

## Deployment Workflow

### Option A: Automatic (Recommended)
```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Builds all three apps
# 3. Deploys to production
# 4. Done! (2-5 minutes)
```

### Option B: Manual Deploy
```bash
vercel --prod
```

### Preview Deployments
Every pull request gets a preview URL:
```bash
git checkout -b new-feature
# make changes
git push origin new-feature
# Create PR on GitHub
# Vercel creates preview: https://extra-muros-git-new-feature-yourschool.vercel.app
```

---

## Shared Folder in npm Workspaces

Your root `package.json` defines workspaces:

```json
{
  "workspaces": [
    "server",
    "admin",
    "student",
    "shared"
  ]
}
```

This allows:
```bash
# Install all dependencies at once
npm install --workspaces

# Run commands in specific workspace
npm run dev --workspace=server
npm run build --workspace=admin
```

The `shared` workspace is special:
- No `scripts` defined
- Just exports utilities
- Other apps import from it

---

## Security: CORS Configuration

Since you have three domains, CORS is critical:

**In server/.env:**
```env
CORS_ORIGINS=https://admin.yourschool.com,https://app.yourschool.com
```

**In server/index.js** (already configured):
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(','),
  credentials: true
}));
```

This allows:
- ✅ admin.yourschool.com → Call api.yourschool.com
- ✅ app.yourschool.com → Call api.yourschool.com
- ❌ randomsite.com → Blocked!

---

## Summary

### Structure
- **One GitHub repo** with four folders (server, admin, student, shared)
- **One Vercel project** (monorepo deployment)
- **Three live sites** (three custom domains)
- **Shared code** is bundled into each app during build

### Deployment Flow
```
Local changes → Git push → Vercel auto-build → Three sites live
```

### Why This is Great
✅ **Simple**: One repo, one deployment
✅ **Efficient**: Shared code, no duplication
✅ **Fast**: Parallel builds
✅ **Scalable**: Vercel handles all scaling
✅ **Preview**: Every PR gets preview URL
✅ **Cost-effective**: One Vercel Pro plan ($20/month)

### Next Steps
1. Push code to GitHub
2. Connect to Vercel
3. Configure domains
4. Set environment variables
5. Deploy!

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed step-by-step instructions.
