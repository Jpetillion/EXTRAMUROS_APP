# Extra Muros Admin Application

A production-ready React admin application for managing trips, modules, and content for the Extra Muros platform.

## Features

- **Authentication System**: Secure login with JWT tokens
- **Trip Management**: Create, edit, delete, publish/unpublish trips
- **Module Management**: Organize content into modules within trips
- **Content Management**: Support for text, image, and audio content
- **File Uploads**: Upload and manage images and audio files
- **Real-time Notifications**: Toast notifications for user feedback
- **Responsive Design**: Mobile-friendly UI
- **Modern UI**: Clean, professional interface with atomic design pattern

## Technology Stack

- **React 18** - UI library
- **React Router 6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Vite** - Build tool and dev server
- **CSS Modules** - Scoped styling

## Project Structure

```
admin/
├── src/
│   ├── components/
│   │   ├── atoms/          # Basic UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Label.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── Badge.jsx
│   │   ├── molecules/      # Composite components
│   │   │   ├── FormField.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Toast.jsx
│   │   └── organisms/      # Complex components
│   │       ├── Header.jsx
│   │       ├── Sidebar.jsx
│   │       ├── TripForm.jsx
│   │       ├── ModuleForm.jsx
│   │       ├── ContentForm.jsx
│   │       └── FileUpload.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ToastContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useToast.js
│   │   └── useApi.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Trips.jsx
│   │   └── TripDetail.jsx
│   ├── utils/
│   │   ├── api.js          # API client with interceptors
│   │   └── helpers.js      # Helper functions
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── .env.example
├── package.json
├── vite.config.js
└── index.html
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your API URL:
```
VITE_API_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## API Integration

The application expects a REST API with the following endpoints:

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get user profile

### Trips
- `GET /api/trips` - List all trips
- `GET /api/trips/:id` - Get trip by ID
- `POST /api/trips` - Create trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/:id/publish` - Publish trip
- `POST /api/trips/:id/unpublish` - Unpublish trip

### Modules
- `GET /api/trips/:tripId/modules` - List modules
- `GET /api/trips/:tripId/modules/:id` - Get module
- `POST /api/trips/:tripId/modules` - Create module
- `PUT /api/trips/:tripId/modules/:id` - Update module
- `DELETE /api/trips/:tripId/modules/:id` - Delete module

### Content
- `GET /api/trips/:tripId/modules/:moduleId/content` - List content
- `GET /api/trips/:tripId/modules/:moduleId/content/:id` - Get content
- `POST /api/trips/:tripId/modules/:moduleId/content` - Create content
- `PUT /api/trips/:tripId/modules/:moduleId/content/:id` - Update content
- `DELETE /api/trips/:tripId/modules/:moduleId/content/:id` - Delete content

### Uploads
- `POST /api/uploads/image` - Upload image
- `POST /api/uploads/audio` - Upload audio
- `DELETE /api/uploads` - Delete file

### Statistics
- `GET /api/stats/dashboard` - Dashboard statistics
- `GET /api/stats/trips/:id` - Trip statistics

## Components

### Atomic Design Pattern

The application follows the atomic design methodology:

- **Atoms**: Basic building blocks (Button, Input, Label, etc.)
- **Molecules**: Simple combinations of atoms (FormField, Card, Modal, etc.)
- **Organisms**: Complex components (Header, Sidebar, Forms, etc.)
- **Pages**: Full page layouts combining organisms

### Key Features

#### Authentication
- JWT token-based authentication
- Automatic token refresh
- Protected routes
- Persistent login state

#### Form Validation
- Client-side validation
- Real-time error feedback
- Required field indicators

#### File Upload
- Drag and drop support
- Progress indicators
- File type validation
- Size limit enforcement
- Preview before upload

#### Notifications
- Toast notifications
- Success/error/warning/info types
- Auto-dismiss with configurable duration
- Manual dismiss option

## Styling

The application uses CSS Modules for component-scoped styles with CSS custom properties for theming:

- Consistent color palette
- Responsive design
- Dark mode ready (variables defined)
- Professional animations and transitions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Guidelines

### Code Style
- Use ES6+ features
- Functional components with hooks
- PropTypes or TypeScript for type checking
- Consistent naming conventions

### Component Guidelines
- Keep components small and focused
- Use composition over inheritance
- Implement proper error boundaries
- Add loading and error states

### Performance
- Lazy load routes and components
- Optimize images and assets
- Minimize bundle size
- Use React.memo for expensive components

## License

MIT

## Support

For issues and questions, please contact the development team.
