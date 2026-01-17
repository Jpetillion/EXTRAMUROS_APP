import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { mfaAPI } from '../utils/api';
import Button from '../components/atoms/Button';
import Badge from '../components/atoms/Badge';
import Spinner from '../components/atoms/Spinner';
import OtpInput from '../components/molecules/OtpInput';
import { QRCodeSVG } from 'qrcode.react';
import {
  Warning, Shield, ShieldCheck, Key, QrCode,
  CheckCircle, ArrowRight, ArrowLeft, Download
} from 'phosphor-react';
import styles from './Settings.module.css';

export default function Settings() {
  const { user } = useAuth();
  const [mfaStatus, setMfaStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Setup states
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState(1); // 1: QR, 2: Verify, 3: Backup Codes
  const [otpAuthUrl, setOtpAuthUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [setupToken, setSetupToken] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Disable states
  const [showDisable, setShowDisable] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disabling, setDisabling] = useState(false);

  useEffect(() => {
    fetchMfaStatus();
  }, []);

  const fetchMfaStatus = async () => {
    try {
      setLoading(true);
      const response = await mfaAPI.getStatus();
      setMfaStatus(response.data);
    } catch (err) {
      console.error('Failed to fetch MFA status:', err);
      setError('Failed to load MFA status');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSetup = async () => {
    try {
      setError('');
      const response = await mfaAPI.generateSetup();
      setOtpAuthUrl(response.data.otpAuthUrl);
      setSecret(response.data.secret);
      setBackupCodes(response.data.backupCodes);
      setShowSetup(true);
      setSetupStep(1);
    } catch (err) {
      console.error('Failed to generate MFA setup:', err);
      setError('Failed to start MFA setup. Please try again.');
    }
  };

  const handleVerifySetup = async (e) => {
    e.preventDefault();
    try {
      setVerifying(true);
      setError('');
      await mfaAPI.verifySetup(setupToken);
      setSetupStep(3); // Show backup codes
      await fetchMfaStatus();
    } catch (err) {
      console.error('Failed to verify MFA setup:', err);
      setError('Invalid code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleCompleteSetup = () => {
    setShowSetup(false);
    setSetupStep(1);
    setSetupToken('');
    setOtpAuthUrl('');
    setSecret('');
    setBackupCodes([]);
  };

  const handleDisableMfa = async (e) => {
    e.preventDefault();
    try {
      setDisabling(true);
      setError('');
      await mfaAPI.disable(disablePassword);
      await fetchMfaStatus();
      setShowDisable(false);
      setDisablePassword('');
    } catch (err) {
      console.error('Failed to disable MFA:', err);
      setError('Failed to disable MFA. Please check your password.');
    } finally {
      setDisabling(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    const text = `Extra Muros - Backup Codes\n\nThese codes can be used to access your account if you lose your authenticator device.\nEach code can only be used once.\n\n${backupCodes.join('\n')}\n\nKeep these codes in a safe place!`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extra-muros-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Spinner size="large" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Settings</h1>
      </div>

      {error && (
        <div className={styles.error}>
          <Warning size={24} weight="bold" />
          <p>{error}</p>
        </div>
      )}

      {/* Profile Section */}
      <div className={styles.section}>
        <h2>Profile</h2>
        <div className={styles.card}>
          <div className={styles.profileInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{user.firstName} {user.lastName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{user.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Role:</span>
              <Badge variant={user.role === 'admin' ? 'success' : 'primary'}>
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* MFA Security Section */}
      <div className={styles.section}>
        <h2>Two-Factor Authentication</h2>

        {!showSetup && !showDisable && (
          <div className={styles.card}>
            <div className={styles.mfaStatus}>
              <div className={styles.mfaInfo}>
                <div className={styles.mfaIconWrapper}>
                  {mfaStatus?.enabled ? (
                    <ShieldCheck size={48} weight="duotone" className={styles.mfaIconEnabled} />
                  ) : (
                    <Shield size={48} weight="duotone" className={styles.mfaIconDisabled} />
                  )}
                </div>
                <div>
                  <h3>
                    {mfaStatus?.enabled ? 'Enabled' : 'Not Enabled'}
                  </h3>
                  <p className={styles.mfaDescription}>
                    {mfaStatus?.enabled
                      ? 'Your account is protected with two-factor authentication.'
                      : 'Add an extra layer of security to your account.'}
                  </p>
                  {mfaStatus?.enabled && mfaStatus?.backupCodesRemaining > 0 && (
                    <p className={styles.backupCodesInfo}>
                      <Key size={16} weight="bold" />
                      {mfaStatus.backupCodesRemaining} backup code{mfaStatus.backupCodesRemaining !== 1 ? 's' : ''} remaining
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.mfaActions}>
                {!mfaStatus?.enabled ? (
                  <Button variant="primary" onClick={handleStartSetup}>
                    Enable 2FA
                  </Button>
                ) : (
                  <Button variant="danger" onClick={() => setShowDisable(true)}>
                    Disable 2FA
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MFA Setup Wizard */}
        {showSetup && (
          <div className={styles.card}>
            <div className={styles.setupWizard}>
              {/* Step 1: Scan QR Code */}
              {setupStep === 1 && (
                <div className={styles.setupStep}>
                  <div className={styles.setupHeader}>
                    <QrCode size={64} weight="duotone" color="var(--color-primary)" />
                    <h3>Step 1: Scan QR Code</h3>
                    <p>Use Google Authenticator or Microsoft Authenticator to scan this QR code</p>
                  </div>

                  <div className={styles.qrCodeContainer}>
                    {otpAuthUrl && <QRCodeSVG value={otpAuthUrl} size={200} />}
                  </div>

                  <div className={styles.secretKey}>
                    <p className={styles.label}>Or enter this key manually:</p>
                    <code className={styles.code}>{secret}</code>
                  </div>

                  <div className={styles.setupActions}>
                    <Button variant="secondary" onClick={() => setShowSetup(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={() => setSetupStep(2)}>
                      Next
                      <ArrowRight size={20} weight="bold" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Verify Code */}
              {setupStep === 2 && (
                <div className={styles.setupStep}>
                  <div className={styles.setupHeader}>
                    <Key size={64} weight="duotone" color="var(--color-primary)" />
                    <h3>Step 2: Verify Setup</h3>
                    <p>Enter the 6-digit code from your authenticator app</p>
                  </div>

                  <form onSubmit={handleVerifySetup} className={styles.verifyForm}>
                    <div className={styles.otpWrapper}>
                      <OtpInput
                        length={6}
                        value={setupToken}
                        onChange={setSetupToken}
                        disabled={verifying}
                        autoFocus
                      />
                    </div>

                    <div className={styles.setupActions}>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setSetupStep(1)}
                        disabled={verifying}
                      >
                        <ArrowLeft size={20} weight="bold" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={setupToken.length !== 6 || verifying}
                      >
                        {verifying ? 'Verifying...' : 'Verify & Enable'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: Backup Codes */}
              {setupStep === 3 && (
                <div className={styles.setupStep}>
                  <div className={styles.setupHeader}>
                    <CheckCircle size={64} weight="duotone" color="var(--color-success)" />
                    <h3>Setup Complete!</h3>
                    <p>Save these backup codes in a safe place</p>
                  </div>

                  <div className={styles.backupCodesContainer}>
                    <div className={styles.backupCodesWarning}>
                      <Warning size={24} weight="bold" color="var(--color-warning)" />
                      <p>
                        Each backup code can only be used once. Store them securely - you'll need them if you lose access to your authenticator app.
                      </p>
                    </div>

                    <div className={styles.backupCodesList}>
                      {backupCodes.map((code, index) => (
                        <code key={index} className={styles.backupCode}>
                          {code}
                        </code>
                      ))}
                    </div>

                    <div className={styles.backupCodesActions}>
                      <Button
                        variant="secondary"
                        onClick={handleDownloadBackupCodes}
                      >
                        <Download size={20} weight="bold" />
                        Download Codes
                      </Button>
                    </div>
                  </div>

                  <div className={styles.setupActions}>
                    <Button variant="primary" onClick={handleCompleteSetup}>
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MFA Disable Form */}
        {showDisable && (
          <div className={styles.card}>
            <div className={styles.disableForm}>
              <div className={styles.setupHeader}>
                <Warning size={64} weight="duotone" color="var(--color-danger)" />
                <h3>Disable Two-Factor Authentication</h3>
                <p>Enter your password to confirm</p>
              </div>

              <form onSubmit={handleDisableMfa}>
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    disabled={disabling}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.setupActions}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowDisable(false);
                      setDisablePassword('');
                    }}
                    disabled={disabling}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    disabled={!disablePassword || disabling}
                  >
                    {disabling ? 'Disabling...' : 'Disable 2FA'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
