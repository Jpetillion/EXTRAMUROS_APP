import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OfflineProvider } from './context/OfflineContext.jsx';
import { TripProvider } from './context/TripContext.jsx';
import { Home } from './pages/Home.jsx';
import { TripListPage } from './pages/TripListPage.jsx';
import { TripView } from './pages/TripView.jsx';
import { ContentView } from './pages/ContentView.jsx';
import { Settings } from './pages/Settings.jsx';

function App() {
  return (
    <BrowserRouter>
      <OfflineProvider>
        <TripProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trips" element={<TripListPage />} />
            <Route path="/trip/:tripId" element={<TripView />} />
            <Route path="/content/:contentId" element={<ContentView />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TripProvider>
      </OfflineProvider>
    </BrowserRouter>
  );
}

export default App;
