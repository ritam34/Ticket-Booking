import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('railbook_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('railbook_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then(({ user }) => {
        setUser(user);
        localStorage.setItem('railbook_user', JSON.stringify(user));
      })
      .catch(() => {
        localStorage.removeItem('railbook_token');
        localStorage.removeItem('railbook_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const { token, user } = await authService.login(credentials);
    localStorage.setItem('railbook_token', token);
    localStorage.setItem('railbook_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const signup = async (data) => {
    const { token, user } = await authService.signup(data);
    localStorage.setItem('railbook_token', token);
    localStorage.setItem('railbook_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('railbook_token');
    localStorage.removeItem('railbook_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
