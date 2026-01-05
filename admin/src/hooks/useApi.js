import { useState, useCallback } from 'react';
import { useToast } from './useToast';
import { extractErrorMessage } from '../utils/helpers';

export const useApi = (apiFunction, options = {}) => {
  const { showSuccessToast = false, showErrorToast = true, successMessage = 'Success!' } = options;
  const { success, error: showError } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFunction(...args);
        const responseData = response.data;

        setData(responseData);

        if (showSuccessToast) {
          success(successMessage);
        }

        return { success: true, data: responseData };
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(errorMessage);

        if (showErrorToast) {
          showError(errorMessage);
        }

        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, showSuccessToast, showErrorToast, successMessage, success, showError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};
