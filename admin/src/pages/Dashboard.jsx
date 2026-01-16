import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { statsAPI } from '../utils/api';
import { useToast } from '../hooks/useToast';
import Card from '../components/molecules/Card';
import Button from '../components/atoms/Button';
import Spinner from '../components/atoms/Spinner';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { error } = useToast();

  useEffect(() => {
    fetchStats();
  }, [location.key]); // Refetch when navigating back to dashboard

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await statsAPI.getDashboard();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      error('Failed to load dashboard statistics');
      // Set default stats for demo
      setStats({
        totalTrips: 0,
        publishedTrips: 0,
        draftTrips: 0,
        totalModules: 0,
        totalContent: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#dbeafe' }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Total Trips</p>
              <p className={styles.statValue}>{stats?.totalTrips || 0}</p>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#dcfce7' }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Published Trips</p>
              <p className={styles.statValue}>{stats?.publishedTrips || 0}</p>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#fef3c7' }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Draft Trips</p>
              <p className={styles.statValue}>{stats?.draftTrips || 0}</p>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#e0e7ff' }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Total Modules</p>
              <p className={styles.statValue}>{stats?.totalModules || 0}</p>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statIcon} style={{ backgroundColor: '#fce7f3' }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ec4899"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Total Content</p>
              <p className={styles.statValue}>{stats?.totalContent || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.actionsSection}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <Card className={styles.actionCard} onClick={() => navigate('/trips')}>
            <div className={styles.actionIcon} style={{ backgroundColor: '#dbeafe' }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 className={styles.actionTitle}>Manage Trips</h3>
            <p className={styles.actionDescription}>View, edit, and organize all trips</p>
          </Card>

          <Card className={styles.actionCard} onClick={() => navigate('/classes')}>
            <div className={styles.actionIcon} style={{ backgroundColor: '#e0e7ff' }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <h3 className={styles.actionTitle}>Manage Classes</h3>
            <p className={styles.actionDescription}>Create and assign trips to classes</p>
          </Card>

          <Card className={styles.actionCard} onClick={() => navigate('/users')}>
            <div className={styles.actionIcon} style={{ backgroundColor: '#fce7f3' }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ec4899"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 className={styles.actionTitle}>Manage Users</h3>
            <p className={styles.actionDescription}>Add and manage teacher accounts</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
