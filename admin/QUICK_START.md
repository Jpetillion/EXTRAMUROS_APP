# Extra Muros Admin - Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
```bash
cd "/Volumes/Extreme_SSD/All_My_Files_DEC_2023/Lesgeven/2025-2026/AD/EXTRA MUROS APP/admin"
npm install
```

### 2. Configure Environment
The `.env` file is already configured with:
```
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Extra Muros Admin
```

Update the API URL if your backend runs on a different port.

### 3. Start Development Server
```bash
npm run dev
```

The application will start at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```

## Default Login

The application expects authentication through the backend API. Example credentials (configure in your backend):

- Email: `admin@example.com`
- Password: Your backend password

## Application Structure

```
✓ 58 Files Created:

Core Files:
- src/main.jsx                    # Application entry point
- src/App.jsx                     # Main app with routing
- src/index.css                   # Global styles

Utils:
- src/utils/api.js                # Axios API client
- src/utils/helpers.js            # Helper functions

Context:
- src/context/AuthContext.jsx    # Authentication context
- src/context/ToastContext.jsx   # Toast notifications

Hooks:
- src/hooks/useAuth.js            # Auth hook
- src/hooks/useToast.js           # Toast hook
- src/hooks/useApi.js             # API hook

Atoms (7 components):
- Button, Input, Label, Select, Textarea, Spinner, Badge

Molecules (4 components):
- FormField, Card, Modal, Toast

Organisms (6 components):
- Header, Sidebar, TripForm, ModuleForm, ContentForm, FileUpload

Pages (4 pages):
- Login, Dashboard, Trips, TripDetail
```

## Features Overview

### 1. Authentication
- JWT-based authentication
- Auto-login on page refresh
- Protected routes
- Logout functionality

### 2. Dashboard
- Trip statistics overview
- Quick actions
- Navigation to main features

### 3. Trip Management
- View all trips
- Create new trips
- Edit existing trips
- Delete trips
- Publish/unpublish trips
- Status badges (draft, published, archived)

### 4. Module Management (Trip Detail Page)
- Add modules to trips
- Edit module details
- Delete modules
- Collapsible module view
- Content organization

### 5. Content Management
- Three content types: Text, Image, Audio
- Add content to modules
- Edit content
- Delete content
- File upload with progress
- Preview uploaded files

### 6. File Upload
- Drag & drop support
- Progress indicators
- File validation (type & size)
- Preview for images
- Audio player for audio files
- Replace/remove functionality

## API Endpoints Expected

Ensure your backend implements these endpoints:

### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/profile
```

### Trips
```
GET    /api/trips
GET    /api/trips/:id
POST   /api/trips
PUT    /api/trips/:id
DELETE /api/trips/:id
POST   /api/trips/:id/publish
POST   /api/trips/:id/unpublish
```

### Modules
```
GET    /api/trips/:tripId/modules
GET    /api/trips/:tripId/modules/:id
POST   /api/trips/:tripId/modules
PUT    /api/trips/:tripId/modules/:id
DELETE /api/trips/:tripId/modules/:id
```

### Content
```
GET    /api/trips/:tripId/modules/:moduleId/content
GET    /api/trips/:tripId/modules/:moduleId/content/:id
POST   /api/trips/:tripId/modules/:moduleId/content
PUT    /api/trips/:tripId/modules/:moduleId/content/:id
DELETE /api/trips/:tripId/modules/:moduleId/content/:id
```

### Uploads
```
POST   /api/uploads/image    (multipart/form-data)
POST   /api/uploads/audio    (multipart/form-data)
DELETE /api/uploads
```

### Statistics
```
GET    /api/stats/dashboard
GET    /api/stats/trips/:id
```

## Common Issues & Solutions

### 1. API Connection Error
- Verify backend is running on `http://localhost:3000`
- Check `.env` file for correct API URL
- Ensure CORS is configured in backend

### 2. Login Not Working
- Check backend authentication endpoint
- Verify credentials
- Check browser console for errors
- Ensure JWT token is returned

### 3. File Upload Fails
- Check file size limits (5MB images, 10MB audio)
- Verify file types are allowed
- Ensure backend upload endpoint is working
- Check backend storage configuration

### 4. Styles Not Loading
- Clear browser cache
- Restart dev server
- Check CSS module imports

## Development Tips

### Hot Reload
The dev server supports hot module replacement. Changes to files will automatically reflect in the browser.

### Component Development
Each component has its own CSS module file. Use CSS variables for consistent theming:
```css
color: var(--color-primary);
padding: var(--spacing-md);
border-radius: var(--radius-md);
```

### State Management
- Use Context API for global state (Auth, Toast)
- Use local state for component-specific data
- Use custom hooks for reusable logic

### API Calls
Use the `useApi` hook for API calls:
```javascript
const { execute, loading, error } = useApi(tripsAPI.getAll);
const result = await execute();
```

## Browser DevTools

### React Developer Tools
Install React DevTools extension to inspect:
- Component hierarchy
- Props and state
- Context values
- Performance

### Network Tab
Monitor API calls and responses in the Network tab.

### Console
Check console for errors and debug logs.

## Next Steps

1. Start the backend API server
2. Run `npm install` in this directory
3. Run `npm run dev`
4. Navigate to `http://localhost:5173`
5. Login with your credentials
6. Explore the dashboard
7. Create your first trip
8. Add modules and content

## Support

For questions or issues:
1. Check the main README.md
2. Review the code comments
3. Contact the development team

---

**Ready to get started? Run `npm install` and then `npm run dev`!**
