import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import FormField from '../components/molecules/FormField';
import Button from '../components/atoms/Button';
import styles from './Login.module.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
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
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const result = await login(credentials);

      if (result.success) {
        success('Login successful!');
        navigate('/dashboard');
      } else {
        showError(result.error || 'Login failed');
      }
    } catch (err) {
      showError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

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
