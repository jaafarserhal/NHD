import { useState, useEffect, useCallback } from 'react';

export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  return { data, loading, error, execute };
};

// Custom hook for automatic API calls
export const useApiCall = (apiCall, dependencies = [], autoExecute = true) => {
  const { data, loading, error, execute } = useApi(apiCall, dependencies);

  useEffect(() => {
    if (autoExecute) {
      execute();
    }
  }, [execute, autoExecute]);

  return { data, loading, error, refetch: execute };
};