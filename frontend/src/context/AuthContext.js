import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

const KNOWN_ADMINS = [
  'admin@hotelcrm.com',
  'musaabduljnr@gmail.com',
  'abdullahitajuddeen17@gmail.com',
  'ribatech2026@gmail.com',
];

function sanitizeUser(userData) {
  if (!userData) return null;
  const email = (userData.email || '').trim().toLowerCase();
  if (KNOWN_ADMINS.includes(email)) {
    return { ...userData, role: 'admin' };
  }
  return userData;
}

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
      try {
        const parsed = JSON.parse(savedUser);
        const normalized = sanitizeUser(parsed);
        setToken(savedToken);
        setUser(normalized);
        sessionStorage.setItem('hotel_crm_user', JSON.stringify(normalized));
      } catch {
        sessionStorage.removeItem('hotel_crm_token');
        sessionStorage.removeItem('hotel_crm_user');
      }
    }
    setLoading(false);
  }, []);

  function login(userData, jwt) {
    const normalized = sanitizeUser(userData);
    setUser(normalized);
    setToken(jwt);
    sessionStorage.setItem('hotel_crm_token', jwt);
    sessionStorage.setItem('hotel_crm_user', JSON.stringify(normalized));
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

