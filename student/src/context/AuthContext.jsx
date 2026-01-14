import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userEmail, setUserEmail] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load stored email and class on mount
    const storedEmail = localStorage.getItem('studentEmail');
    const storedClassId = localStorage.getItem('studentClassId');
    const storedClassName = localStorage.getItem('studentClassName');

    if (storedEmail && storedClassId) {
      setUserEmail(storedEmail);
      setSelectedClass({
        id: storedClassId,
        name: storedClassName || 'Unknown Class'
      });
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email, classData) => {
    localStorage.setItem('studentEmail', email);
    localStorage.setItem('studentClassId', classData.id);
    localStorage.setItem('studentClassName', classData.name);

    setUserEmail(email);
    setSelectedClass(classData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('studentEmail');
    localStorage.removeItem('studentClassId');
    localStorage.removeItem('studentClassName');

    setUserEmail(null);
    setSelectedClass(null);
    setIsAuthenticated(false);
  };

  const changeClass = (classData) => {
    localStorage.setItem('studentClassId', classData.id);
    localStorage.setItem('studentClassName', classData.name);
    setSelectedClass(classData);
  };

  const value = {
    userEmail,
    selectedClass,
    isAuthenticated,
    login,
    logout,
    changeClass
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
