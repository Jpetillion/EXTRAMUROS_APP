# Extra Muros - Quick Start Guide

Get the Extra Muros project up and running in minutes!

---

## 📋 Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Turso CLI** (for database)
- **Vercel account** (for blob storage)

---

## 🚀 Quick Setup (Development)

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install admin dependencies
cd ../admin
npm install

# Install student dependencies
cd ../student
npm install
```

### 2. Database Setup

#### Option A: Use Existing Turso Database

If you already have a Turso database:

```bash
# Set environment variable
export TURSO_DATABASE_URL="libsql://your-database.turso.io"
export TURSO_AUTH_TOKEN="your-auth-token"
```

#### Option B: Create New Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login to Turso
turso auth login

# Create database
turso db create extra-muros

# Get connection URL
turso db show extra-muros

# Get auth token
turso db tokens create extra-muros
```

### 3. Run Database Migrations

⚠️ **IMPORTANT:** Run this migration to add the student_progress table:

```bash
# From project root
cd server

# Run migration
turso db shell extra-muros < migrations/add_student_progress_table.sql

# Or manually:
cat migrations/add_student_progress_table.sql | turso db shell extra-muros
```

### 4. Configure Environment Variables

#### Server (`.env` in `server/` folder):

```env
# Database (Turso)
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Blob Storage (Vercel)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Port
PORT=3000
```

#### Admin (`.env` in `admin/` folder):

```env
VITE_API_URL=http://localhost:3000/api
```

#### Student (`.env` in `student/` folder):

```env
VITE_API_URL=http://localhost:3000/api
```

### 5. Start Development Servers

Open **3 terminal windows**:

```bash
# Terminal 1: Server
cd server
npm run dev
# Server runs on http://localhost:3000

# Terminal 2: Admin
cd admin
npm run dev
# Admin runs on http://localhost:5173

# Terminal 3: Student PWA
cd student
npm run dev
# Student runs on http://localhost:5174
```

---

## 🎯 First Use

### 1. Create Admin User

Currently, you need to manually create an admin user in the database:

```bash
# Connect to database
turso db shell extra-muros

# Create admin user (password will be hashed by app on first login)
# For now, manually insert or use the signup endpoint if implemented
```

**OR** use a database tool to insert a user with a bcrypt-hashed password.

### 2. Login to Admin

1. Open `http://localhost:5173` in your browser
2. Login with your admin credentials
3. You should see the dashboard

### 3. Create Your First Trip

1. Navigate to "Trips" in the sidebar
2. Click "Create New Trip"
3. Fill in the trip details:
   - Title: "Paris Adventure"
   - Description: "Explore the City of Light"
   - Destination: "Paris, France"
   - Dates: Pick start and end dates
4. Click "Create Trip"

### 4. Add Content to Your Trip

1. Click on your newly created trip
2. Add a module (e.g., "Day 1: Arrival")
3. Add content to the module (text, images, etc.)
4. Add trip stops (waypoints):
   - Click on "Trip Stops" section
   - Add stops like "Louvre Museum", "Eiffel Tower"
   - Set locations, duration, difficulty

### 5. Publish Your Trip

1. Click "Publish" button on the trip
2. This generates a manifest and makes the trip available to students

### 6. Download Trip in Student App

1. Open `http://localhost:5174` in your browser
2. You should see your published trip
3. Click "Download" to download it for offline use
4. **Test offline mode:**
   - Open DevTools (F12)
   - Go to Network tab
   - Select "Offline"
   - The app should still work! ✨

---

## 🧪 Testing the Complete Flow

### Test Checklist:

- [ ] Server starts without errors
- [ ] Admin app loads and login works
- [ ] Can create a new trip
- [ ] Can add modules to trip
- [ ] Can add content to modules
- [ ] Can add trip stops with locations
- [ ] Can upload media files
- [ ] Can publish trip
- [ ] Student app shows published trip
- [ ] Can download trip in student app
- [ ] Service worker registers successfully
- [ ] App works offline after download
- [ ] Can sync progress when back online

---

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Check if Turso database is accessible
turso db shell extra-muros

# If connection fails, regenerate token
turso db tokens create extra-muros
```

### CORS Errors

Make sure CORS_ORIGINS in server `.env` includes both:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Service Worker Not Registering

1. Check browser console for errors
2. Make sure you're on `http://localhost` (not `127.0.0.1`)
3. Clear browser cache and reload
4. Check DevTools → Application → Service Workers

### Upload Not Working

1. Verify `BLOB_READ_WRITE_TOKEN` is set correctly
2. Check Vercel dashboard for blob storage status
3. Ensure file size is under 50MB

### Migration Errors

If migration fails:

```bash
# Check existing tables
turso db shell extra-muros
sqlite> .tables

# If student_progress exists, you're good
# If not, manually run the SQL from the migration file
```

---

## 📁 Project Structure

```
extra-muros/
├── server/           # Backend API
│   ├── config/       # Database & storage config
│   ├── middleware/   # Auth, upload, etc.
│   ├── models/       # Database functions
│   ├── routes/       # API endpoints
│   ├── utils/        # Helpers & validators
│   └── migrations/   # Database migrations
├── admin/            # Teacher admin website
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Page components
│       ├── utils/       # API client, helpers
│       └── hooks/       # Custom React hooks
├── student/          # Student PWA
│   ├── public/       # Static files + sw.js
│   └── src/
│       ├── components/  # React components
│       ├── contexts/    # React contexts
│       ├── hooks/       # Custom hooks
│       ├── lib/         # Offline storage, sync
│       └── utils/       # Helpers
└── shared/           # Shared utilities (if any)
```

---

## 🔑 Important Files

### Server
- `server/index.js` - Main entry point
- `server/models/db.js` - Database functions
- `server/routes/*.js` - API routes
- `server/migrations/*.sql` - Database migrations

### Admin
- `admin/src/utils/api.js` - API client
- `admin/src/pages/TripDetail.jsx` - Main trip management page
- `admin/src/components/organisms/TripStopsManager.jsx` - Trip stops UI

### Student
- `student/public/sw.js` - Service worker (offline caching)
- `student/src/lib/storage.js` - IndexedDB operations
- `student/src/lib/downloadManager.js` - Trip download logic
- `student/src/contexts/OfflineContext.jsx` - Online/offline state

---

## 🚢 Deployment

See separate deployment guides:
- `DEPLOYMENT.md` - Server deployment
- `DEPLOYMENT_STUDENT.md` - Student PWA deployment

---

## 📚 Additional Documentation

- `API_ENDPOINTS.md` - Complete API reference
- `STATUS.md` - Project status and roadmap
- `COMPLETED_WORK.md` - Implementation summary
- `README.md` - Project overview

---

## 💡 Tips

1. **Use DevTools extensively** - Network tab for API calls, Application tab for Service Worker and IndexedDB

2. **Test offline early and often** - Don't wait until the end to test offline functionality

3. **Check browser console** - Most issues will show errors in the console

4. **Use Thunder Client or Postman** - Test API endpoints independently

5. **Git commit frequently** - Save your progress often

---

## 🆘 Getting Help

1. Check the console for error messages
2. Review the documentation files
3. Check the API endpoints documentation
4. Look at existing code for examples
5. Check browser DevTools (Network, Console, Application tabs)

---

## 🎉 Success!

If you've completed all steps, you should now have:
- ✅ Server running on port 3000
- ✅ Admin app running on port 5173
- ✅ Student PWA running on port 5174
- ✅ Database connected and migrated
- ✅ Service worker registered
- ✅ Offline functionality working

**Next steps:**
- Create more content for your trips
- Add media files (images, audio, video)
- Test the complete offline experience
- Deploy to production!

---

**Last Updated:** 2026-01-11
