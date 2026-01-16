import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export function ProtectedRoute({ children }) {
  // COMMENTED OUT: Auth check disabled - all users have access
  // Keeping this code for future use if authentication is needed
  // const { isAuthenticated } = useAuth();

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  return children;
}
