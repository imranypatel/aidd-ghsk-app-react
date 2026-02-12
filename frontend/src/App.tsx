import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CssBaseline } from '@mui/material';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { ThemeColorProvider } from './contexts/ThemeColorContext';
import { useTheme } from './hooks/useTheme';

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

function AppContent() {
  const { theme } = useTheme();

  return (
    <ThemeColorProvider mode={theme.effectiveMode}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeColorProvider>
  );
}

function App() {
  return <AppContent />;
}

export default App;
