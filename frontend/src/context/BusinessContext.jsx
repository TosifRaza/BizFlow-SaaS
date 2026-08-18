// @refresh reset
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { businessApi } from '../api/businessApi';
import { useAuth } from './AuthContext';

const BusinessContext = createContext(null);

export const useBusiness = () => {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider');
  return ctx;
};

export const BusinessProvider = ({ children }) => {
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshBusiness = useCallback(async () => {
    if (!user || user.role === 'super_admin') return;
    setLoading(true);
    try {
      const { data } = await businessApi.getBusiness();
      setBusiness(data.data);
    } catch (err) {
      console.error('Failed to load business:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshBusiness();
  }, [refreshBusiness]);

  return (
    <BusinessContext.Provider value={{ business, loading, refreshBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
};
