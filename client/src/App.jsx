import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Providers
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { RobotProvider } from '@/contexts/RobotContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { CatProvider } from '@/contexts/PetContext';

// Components
import Layout from '@/components/Layout';

// Pages
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import CatsPage from '@/pages/CatsPage';
import GalleryPage from '@/pages/GalleryPage';
import LogsPage from '@/pages/LogsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';

// 보호된 라우트
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="h-screen flex items-center justify-center">로딩 중...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* 대시보드 */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      {/* 고양이 관리 */}
      <Route path="/cats" element={
        <ProtectedRoute>
          <Layout>
            <CatsPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* 갤러리 */}
      <Route path="/gallery" element={
        <ProtectedRoute>
          <Layout>
            <GalleryPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* 로그 리포트 */}
      <Route path="/logs" element={
        <ProtectedRoute>
          <Layout>
            <LogsPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* 알림 센터 */}
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Layout>
            <NotificationsPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* 계정 설정 */}
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <SettingsPage />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App = () => {
  return (
    // ✅ 순서 중요! AuthProvider가 가장 먼저 와야 다른 Provider들이 user 정보를 쓸 수 있습니다.
    <AuthProvider> 
      <NotificationProvider>
        <RobotProvider>
          <CatProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
                <AppRoutes />
                <Toaster position="top-right" richColors closeButton />
              </div>
            </Router>
          </CatProvider>
        </RobotProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;