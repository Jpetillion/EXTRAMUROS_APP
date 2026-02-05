import { useAuth } from '../../hooks/useAuth';
import { Backpack } from '@phosphor-icons/react';
import Button from '../atoms/Button';
import styles from './Header.module.css';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const getUserInitial = () => {
    if (user?.role === 'teacher') return 'T';
    if (user?.role === 'admin') return 'A';
    return user?.firstName?.charAt(0).toUpperCase() || 'U';
  };

  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email || 'User';
  };

  const getRoleDisplay = () => {
    if (user?.role === 'teacher') return 'Teacher';
    if (user?.role === 'admin') return 'Administrator';
    return user?.role || 'User';
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Backpack size={24} weight="regular" color="white" />
          </div>
          <h1>Extra Muros</h1>
          <span className={styles.badge}>
            {user?.role === 'teacher' ? 'Teacher' : 'Admin'}
          </span>
        </div>
        <div className={styles.right}>
          <div className={styles.user}>
            <div className={styles.avatar}>
              {getUserInitial()}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{getUserName()}</span>
              <span className={styles.userRole}>{getRoleDisplay()}</span>
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
