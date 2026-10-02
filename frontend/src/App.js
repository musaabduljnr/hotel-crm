import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth, RequireAdmin } from './components/RouteGuards';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Guests from './pages/Guests';
import Bookings from './pages/Bookings';
import Complaints from './pages/Complaints';
import Feedback from './pages/Feedback';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route
              path="/dashboard"
              element={
                <RequireAdmin>
                  <Dashboard />
                </RequireAdmin>
              }
            />
            <Route path="/guests" element={<Guests />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/feedback" element={<Feedback />} />
          </Route>

          <Route path="/" element={<Navigate to="/guests" replace />} />
          <Route path="*" element={<Navigate to="/guests" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
