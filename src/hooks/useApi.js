// src/hooks/useApi.js
import { useState, useEffect, useCallback } from 'react';

export const useApi = (apiFunction, initialParams = null, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (params = initialParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(params);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, initialParams]);

  useEffect(() => {
    if (immediate && initialParams) {
      execute(initialParams);
    }
  }, [execute, immediate, initialParams]);

  const retry = useCallback(() => {
    execute(initialParams);
  }, [execute, initialParams]);

  return {
    data,
    loading,
    error,
    execute,
    retry
  };
};