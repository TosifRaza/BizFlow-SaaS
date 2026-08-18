// @refresh reset
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const setAuthData = (accessToken, refreshToken, userData, perms) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    if (perms) localStorage.setItem('permissions', JSON.stringify(perms));
    setToken(accessToken);
    setUser(userData);
    setPermissions(perms || []);
  };

  const hasPermission = (perm) => {
    if (!user) return false;
    if (user.role === 'owner' || user.role === 'super_admin') return true;
    return permissions.includes(perm);
  };

  const hasAnyPermission = (perms) => {
    if (!user) return false;
    if (user.role === 'owner' || user.role === 'super_admin') return true;
    return perms.some((p) => permissions.includes(p));
  };

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    const { user, tokens, permissions: perms } = data.data;
    setAuthData(tokens.accessToken, tokens.refreshToken, user, perms);
    return data;
  };

  const register = async (regData) => {
    const { data } = await authApi.register(regData);
    const { user, tokens, permissions: perms } = data.data;
    setAuthData(tokens.accessToken, tokens.refreshToken, user, perms);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    setToken(null);
    setUser(null);
    setPermissions([]);
  };

  const updateProfile = async (profileData) => {
    const { data } = await authApi.updateProfile(profileData);
    const updatedUser = { ...user, ...data.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return data;
  };

  const refreshPermissions = async () => {
    try {
      const { data } = await authApi.getProfile();
      const perms = data?.data?.permissions || [];
      localStorage.setItem('permissions', JSON.stringify(perms));
      setPermissions(perms);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedPerms = localStorage.getItem('permissions');
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setPermissions(storedPerms ? JSON.parse(storedPerms) : []);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, loading, permissions, isAuthenticated: !!token,
      login, register, logout, updateProfile, setAuthData,
      hasPermission, hasAnyPermission, refreshPermissions,
    }}>
      {children}
    </AuthContext.Provider>
  );
};