import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

// Session is kept in React state and mirrored to sessionStorage so a
// page refresh doesn't log the user out mid-shift. This is a browser
// app (not a Claude artifact), so sessionStorage is safe to use here.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('hotel_crm_token');
    const savedUser = sessionStorage.getItem('hotel_crm_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  function login(userData, jwt) {
    setUser(userData);
    setToken(jwt);
    sessionStorage.setItem('hotel_crm_token', jwt);
    sessionStorage.setItem('hotel_crm_user', JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('hotel_crm_token');
    sessionStorage.removeItem('hotel_crm_user');
  }

  async function register(payload) {
    const data = await api.post('/auth/register', payload);
    login(data.user, data.token);
    return data;
  }

  async function signIn(payload) {
    const data = await api.post('/auth/login', payload);
    login(data.user, data.token);
    return data;
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
