import { useState, useEffect } from 'react';

let deferredPromptGlobal = null;

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(deferredPromptGlobal);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone
        || document.referrer.includes('android-app://');
      setIsInstalled(isStandalone);
      return isStandalone;
    };

    if (checkInstalled()) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event fired');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPromptGlobal = e;
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('App installed successfully');
      // Clear the deferredPrompt
      deferredPromptGlobal = null;
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
    };

    // Check if the event has already been captured
    if (deferredPromptGlobal) {
      setDeferredPrompt(deferredPromptGlobal);
      setIsInstallable(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      return {
        success: false,
        error: 'NO_PROMPT',
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
      };
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      // Clear the deferredPrompt
      deferredPromptGlobal = null;
      setDeferredPrompt(null);
      setIsInstallable(false);

      return {
        success: outcome === 'accepted',
        outcome
      };
    } catch (error) {
      console.error('Error installing app:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  return {
    isInstallable,
    isInstalled,
    installApp
  };
}
