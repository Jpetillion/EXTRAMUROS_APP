import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { authAPI } from '../utils/api';
import FormField from '../components/molecules/FormField';
import OtpInput from '../components/molecules/OtpInput';
import Button from '../components/atoms/Button';
import styles from './Login.module.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // MFA state
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  const navigate = useNavigate();
  const { login: loginToContext } = useAuth();
  const { success, error: showError } = useToast();

  const validate = () => {
    const newErrors = {};

    if (!credentials.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.login(credentials);

      // Check if MFA is required
      if (response.data.mfaRequired) {
        setTempToken(response.data.tempToken);
        setShowMfaInput(true);
        setLoading(false);
        return;
      }

      // No MFA required - proceed with normal login
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      loginToContext(credentials);
      success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      showError(err?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();

    if (!mfaCode || mfaCode.length < 6) {
      showError('Please enter a valid code');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.loginMfa({
        tempToken,
        code: mfaCode,
        isBackupCode: useBackupCode
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      success('Login successful!');
      // Force page reload to trigger AuthContext to re-check localStorage
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('MFA verification error:', err);
      showError(err?.data?.error || 'Invalid code');
      setMfaCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowMfaInput(false);
    setTempToken('');
    setMfaCode('');
    setUseBackupCode(false);
    setCredentials({ email: '', password: '' });
  };

  // MFA verification view
  if (showMfaInput) {
    return (
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <div className={styles.header}>
            <h1 className={styles.title}>Two-Factor Authentication</h1>
            <p className={styles.subtitle}>
              {useBackupCode
                ? 'Enter one of your 8-digit backup codes'
                : 'Enter the 6-digit code from your authenticator app'}
            </p>
          </div>

          <form onSubmit={handleMfaSubmit} className={styles.form}>
            <div className={styles.otpWrapper}>
              {useBackupCode ? (
                <FormField
                  label="Backup Code"
                  name="backupCode"
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="12345678"
                  disabled={loading}
                  maxLength={8}
                  required
                  autoFocus
                />
              ) : (
                <OtpInput
                  length={6}
                  value={mfaCode}
                  onChange={setMfaCode}
                  disabled={loading}
                  autoFocus
                />
              )}
            </div>

            <Button type="submit" loading={loading} fullWidth disabled={loading}>
              Verify
            </Button>

            <div className={styles.mfaOptions}>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setMfaCode('');
                }}
                disabled={loading}
              >
                {useBackupCode ? 'Use authenticator app' : 'Use backup code'}
              </button>

              <button
                type="button"
                className={styles.linkButton}
                onClick={handleBackToLogin}
                disabled={loading}
              >
                Back to login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Standard login view
  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1 className={styles.title}>Extra Muros</h1>
          <p className={styles.subtitle}>Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField
            label="Email"
            name="email"
            type="email"
            value={credentials.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="admin@example.com"
            disabled={loading}
            required
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
            disabled={loading}
            required
          />

          <Button type="submit" loading={loading} fullWidth>
            Sign In
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.hint}>
            Use your admin credentials to access the dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
