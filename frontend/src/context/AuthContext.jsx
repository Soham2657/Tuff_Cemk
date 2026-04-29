import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (source) => ({
    ...(source || {}),
    role: String(source?.role || 'Student').trim().toLowerCase(),
  });

  const persistUser = (nextUser) => {
    if (!nextUser) {
      localStorage.removeItem('user');
      return;
    }

    localStorage.setItem('user', JSON.stringify(nextUser));
  };

  const updateUser = React.useCallback((partialUser) => {
    setUser((current) => {
      const merged = normalizeUser({ ...(current || {}), ...(partialUser || {}) });
      persistUser(merged);
      return merged;
    });
  }, []);

  useEffect(() => {
    const syncCurrentUser = async () => {
      const storedUser = authService.getCurrentUser();

      if (!storedUser) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/protected');
        const normalized = normalizeUser(response.data.user);
        setUser(normalized);
        persistUser(normalized);
      } catch {
        const normalized = normalizeUser(storedUser);
        setUser(normalized);
        persistUser(normalized);
      } finally {
        setLoading(false);
      }
    };

    syncCurrentUser();
  }, []);

  const login = React.useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    const normalized = normalizeUser(data.user || data);
    setUser(normalized);
    persistUser(normalized);
    return data;
  }, []);

  const register = React.useCallback(async (userData) => {
    const data = await authService.register(userData);
    const normalized = normalizeUser(data.user || data);
    setUser(normalized);
    persistUser(normalized);
    return data;
  }, []);

  const logout = React.useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
