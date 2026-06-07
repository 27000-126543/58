import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Alerts from '@/pages/Alerts';
import ProjectDetail from '@/pages/ProjectDetail';
import Forecast from '@/pages/Forecast';
import Reports from '@/pages/Reports';
import { useAppStore } from '@/store/appStore';

function AuthGuard() {
  const user = useAppStore((s) => s.user);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const publicPaths = ['/login'];
    const isPublic = publicPaths.some((p) => location.pathname.startsWith(p));
    if (!user && !isPublic) {
      navigate('/login', { replace: true });
    } else if (user && location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  return null;
}

export default function App() {
  return (
    <Router>
      <AuthGuard />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
