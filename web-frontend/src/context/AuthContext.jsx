import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (!storedToken) {
      setInitializing(false);
      return;
    }

    setAuthToken(storedToken);
    setToken(storedToken);
    authAPI
      .me()
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => setInitializing(false));
  }, []);

  const persistSession = (newToken, profile) => {
    setToken(newToken);
    setAuthToken(newToken);
    localStorage.setItem('authToken', newToken);
    setUser(profile);
  };

  const clearSession = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
  };

  const login = async (username, password) => {
    const { data } = await authAPI.login({ username, password });
    const profile = {
      username: data.username,
      role: data.role,
      patientId: data.patientId,
    };
    persistSession(data.token, profile);
    return profile;
  };

  const logout = () => {
    clearSession();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [user, token, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
