import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { OfflineProvider } from './context/OfflineContext.jsx';
import { TripProvider } from './context/TripContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
// COMMENTED OUT: Login page disabled
// import { Login } from './pages/Login.jsx';
import { Home } from './pages/Home.jsx';
import { TripListPage } from './pages/TripListPage.jsx';
import { TripView } from './pages/TripView.jsx';
import { ContentView } from './pages/ContentView.jsx';
import { BrowseTrips } from './pages/BrowseTrips.jsx';
import { Settings } from './pages/Settings.jsx';
import { ProtectedRoute } from './components/molecules/ProtectedRoute.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <OfflineProvider>
            <TripProvider>
              <Routes>
                {/* COMMENTED OUT: Login disabled - redirect to home instead */}
                {/* <Route path="/login" element={<Login />} /> */}
                <Route path="/login" element={<Navigate to="/" replace />} />

                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/trips" element={<ProtectedRoute><TripListPage /></ProtectedRoute>} />
                <Route path="/browse" element={<ProtectedRoute><BrowseTrips /></ProtectedRoute>} />
                <Route path="/trip/:tripId" element={<ProtectedRoute><TripView /></ProtectedRoute>} />
                <Route path="/content/:contentId" element={<ProtectedRoute><ContentView /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </TripProvider>
          </OfflineProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
