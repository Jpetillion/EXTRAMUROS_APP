import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/atoms/Button.jsx';
import { Icon } from '../components/atoms/Icon.jsx';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function Login() {
  const [step, setStep] = useState(1); // 1 = email, 2 = class selection
  const [email, setEmail] = useState('');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Fetch available classes
      const response = await fetch(`${API_URL}/classes`);

      if (!response.ok) {
        throw new Error('Failed to load classes');
      }

      const data = await response.json();
      setClasses(data);
      setStep(2);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError('Failed to load classes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (classData) => {
    login(email, classData);
    navigate('/');
  };

  return (
    <div className="login">
      <div className="login__container">
        <div className="login__header">
          <div className="login__logo">
            <Icon name="backpack" size="xlarge" color="var(--color-primary)" />
          </div>
          <h1 className="login__title">Extra Muros</h1>
          <p className="login__subtitle">Your offline-first learning companion</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit} className="login__form">
            <h2 className="login__step-title">Enter your email to continue</h2>

            <div className="login__input-group">
              <input
                type="email"
                className="login__input"
                placeholder="student@school.be"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div className="login__error">
                <Icon name="warning" size="small" />
                {' '}
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Continue'}
            </Button>
          </form>
        ) : (
          <div className="login__class-selection">
            <h2 className="login__step-title">Select your class</h2>
            <p className="login__step-description">
              Choose the class you belong to
            </p>

            {error && (
              <div className="login__error">
                <Icon name="warning" size="small" />
                {' '}
                {error}
              </div>
            )}

            <div className="login__class-list">
              {classes.map((classItem) => (
                <button
                  key={classItem.id}
                  className="login__class-item"
                  onClick={() => handleClassSelect(classItem)}
                >
                  <div className="login__class-info">
                    <span className="login__class-name">{classItem.name}</span>
                    {classItem.schoolYear && (
                      <span className="login__class-year">{classItem.schoolYear}</span>
                    )}
                  </div>
                  <Icon name="chevron-right" size="medium" color="var(--color-gray-500)" />
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="medium"
              fullWidth
              onClick={() => setStep(1)}
            >
              Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
