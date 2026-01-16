import { useState, useCallback } from 'react';

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
    onConfirm: () => {},
  });

  const confirm = useCallback(
    ({
      title = 'Confirm Action',
      message,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      variant = 'danger',
    }) => {
      return new Promise((resolve) => {
        setConfirmState({
          isOpen: true,
          title,
          message,
          confirmText,
          cancelText,
          variant,
          onConfirm: () => {
            setConfirmState((prev) => ({ ...prev, isOpen: false }));
            resolve(true);
          },
        });
      });
    },
    []
  );

  const handleClose = useCallback(() => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    confirm,
    confirmState,
    handleClose,
  };
};
