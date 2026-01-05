import { useAuth } from '../../hooks/useAuth';
import Button from '../atoms/Button';
import styles from './Header.module.css';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h1>Extra Muros</h1>
          <span className={styles.badge}>Admin</span>
        </div>
        <div className={styles.right}>
          <div className={styles.user}>
            <div className={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || 'Admin'}</span>
              <span className={styles.userRole}>{user?.role || 'Administrator'}</span>
            </div>
          </div>
          <Button variant="outline" size="small" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
