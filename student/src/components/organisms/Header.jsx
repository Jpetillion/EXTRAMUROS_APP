import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../atoms/Button.jsx';
import { Icon } from '../atoms/Icon.jsx';
import { OfflineBadge } from '../molecules/OfflineBadge.jsx';
import './Header.css';

export function Header({ title, showBack = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const showSettings = location.pathname !== '/settings';

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__left">
          {showBack && (
            <Button
              variant="ghost"
              size="small"
              onClick={() => navigate(-1)}
            >
              <Icon name="back" size="medium" />
            </Button>
          )}
        </div>

        <div className="header__center">
          <h1 className="header__title">{title}</h1>
          <OfflineBadge />
        </div>

        <div className="header__right">
          {showSettings && (
            <Button
              variant="ghost"
              size="small"
              onClick={() => navigate('/settings')}
            >
              <Icon name="settings" size="medium" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
