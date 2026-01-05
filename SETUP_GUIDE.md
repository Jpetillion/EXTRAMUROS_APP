# Extra Muros - Complete Setup Guide

This guide will walk you through setting up the Extra Muros application from scratch.

## Prerequisites

- Node.js 18+ installed
- Turso account (https://turso.tech)
- Vercel account (https://vercel.com) for Blob storage
- Git installed

## Step 1: Turso Database Setup

### 1.1 Install Turso CLI
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### 1.2 Login to Turso
```bash
turso auth login
```

### 1.3 Create Database
```bash
turso db create extra-muros
```

### 1.4 Get Database URL
```bash
turso db show extra-muros --url
```

### 1.5 Create Auth Token
```bash
turso db tokens create extra-muros
```

Copy the URL and token for your `.env` file.

## Step 2: Vercel Blob Storage Setup

### 2.1 Install Vercel CLI
```bash
npm i -g vercel
```

### 2.2 Login to Vercel
```bash
vercel login
```

### 2.3 Get Blob Token
1. Go to https://vercel.com/dashboard
2. Select your project (or create new one)
3. Go to Settings → Storage
4. Create a new Blob store
5. Copy the `BLOB_READ_WRITE_TOKEN`

## Step 3: Project Setup

### 3.1 Clone/Navigate to Project
```bash
cd "/Volumes/Extreme_SSD/All_My_Files_DEC_2023/Lesgeven/2025-2026/AD/EXTRA MUROS APP"
```

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Create .env File
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
NODE_ENV=development
PORT=3000
CLIENT_URL_ADMIN=http://localhost:5173
CLIENT_URL_STUDENT=http://localhost:5174

# From Turso
TURSO_DATABASE_URL=libsql://extra-muros-your-org.turso.io
TURSO_AUTH_TOKEN=your-turso-token-here

# From Vercel
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# Generate a secure random string for JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Admin credentials
ADMIN_EMAIL=admin@school.be
ADMIN_PASSWORD=ChangeMe123!

# CORS (comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### 3.4 Generate JWT Secret
```bash
# On macOS/Linux:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 4: Database Initialization

### 4.1 Create Tables
```bash
npm run db:setup
```

Expected output:
```
🗄️  Creating database tables...
✅ Database tables created successfully!
```

### 4.2 Seed Demo Data
```bash
npm run db:seed
```

Expected output:
```
🌱 Seeding database...
✅ Admin user created: admin@school.be
✅ Teacher user created: teacher@school.be
✅ Student user created: student@school.be

📋 Login credentials:
Admin: admin@school.be / ChangeMe123!
Teacher: teacher@school.be / teacher123
Student: student@school.be / student123
```

## Step 5: Start Development Servers

### 5.1 Start API Server
```bash
npm run dev:server
```

Expected output:
```
🚀 Server running on http://localhost:3000
📝 API docs: http://localhost:3000/api
```

### 5.2 Test API
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-05T..."
}
```

### 5.3 Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.be","password":"ChangeMe123!"}'
```

Expected response:
```json
{
  "user": {
    "id": "...",
    "email": "admin@school.be",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Step 6: Create Frontend Applications

The server is now running! Next steps are to create the admin and student frontend applications.

### 6.1 Admin App Setup

Create `admin/package.json`:
```json
{
  "name": "extra-muros-admin",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@phosphor-icons/react": "^2.1.7",
    "axios": "^1.7.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2"
  }
}
```

### 6.2 Student PWA Setup

Create `student/package.json`:
```json
{
  "name": "extra-muros-student",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@phosphor-icons/react": "^2.1.7",
    "axios": "^1.7.0",
    "idb": "^8.0.0",
    "leaflet": "^1.9.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-leaflet": "^4.2.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2",
    "vite-plugin-pwa": "^0.20.0"
  }
}
```

### 6.3 Install Frontend Dependencies
```bash
npm install --workspaces
```

## Step 7: Verify Setup

### 7.1 Check File Structure
```bash
tree -L 2 -I node_modules
```

Expected structure:
```
.
├── README.md
├── SETUP_GUIDE.md
├── package.json
├── .env
├── .env.example
├── .gitignore
├── vercel.json
├── server/
│   ├── package.json
│   ├── index.js
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   └── utils/
├── admin/
│   └── package.json
├── student/
│   └── package.json
├── shared/
│   ├── package.json
│   ├── constants.js
│   └── utils.js
└── Briefing_docs/
```

### 7.2 Test Database Connection
```bash
node -e "import db from './server/config/database.js'; db.execute('SELECT 1').then(() => console.log('✅ Database connected')).catch(e => console.error('❌ Error:', e))"
```

## Common Issues

### Issue: "Cannot find module"
**Solution**: Make sure you've run `npm install --workspaces`

### Issue: "Database connection failed"
**Solution**:
- Check your `TURSO_DATABASE_URL` in `.env`
- Verify your `TURSO_AUTH_TOKEN`
- Test with: `turso db shell extra-muros`

### Issue: "File upload fails"
**Solution**:
- Verify your `BLOB_READ_WRITE_TOKEN`
- Check Vercel Blob dashboard for quota limits

### Issue: "CORS errors"
**Solution**:
- Make sure `CORS_ORIGINS` in `.env` includes your frontend URLs
- Restart the server after changing `.env`

## Next Steps

1. ✅ Server is running
2. ⬜ Build admin React application
3. ⬜ Build student PWA application
4. ⬜ Create UI components
5. ⬜ Implement offline functionality
6. ⬜ Test thoroughly
7. ⬜ Deploy to production

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.

## Support

For issues, contact the development team or check the project documentation.
