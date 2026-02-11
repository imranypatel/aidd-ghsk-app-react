import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Stack,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import { ThemeColorPicker } from '../components/ThemeColorPicker';
import type { MenuItem, UserInfo } from '../contracts/components';

// Define menu items for navigation drawer
const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: DashboardIcon,
    path: '/dashboard',
    tooltip: 'Dashboard Overview',
  },
  {
    id: 'users',
    label: 'Users',
    icon: PeopleIcon,
    path: '/users',
    tooltip: 'User Management',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    path: '/settings',
    badge: 1,
    badgeColor: 'error',
    tooltip: 'System Settings',
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpIcon,
    path: '/help',
    tooltip: 'Help & Support',
  },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, setMode } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Convert auth user to UserInfo type
  const userInfo: UserInfo = {
    userId: user?.userId || 'unknown',
    username: user?.username || 'User',
    role: 'User', // Default role, can be extended from auth context
  };

  return (
    <ProtectedLayout
      title="AIDD EMS"
      menuItems={menuItems}
      currentRoute={location.pathname}
      userInfo={userInfo}
      onLogout={handleLogout}
      themeMode={theme.mode}
      onThemeChange={setMode}
      maxContentWidth="1440px"
      contentPadding="24px"
    >
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: 0, 
          position: 'relative', 
          zIndex: 1,
        }}
      >
        <Stack spacing={3}>
          {/* Welcome Card */}
          <Card>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome, {user?.username || 'User'}!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                You have successfully logged into the AIDD Enterprise Management System.
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Dashboard Features (Coming Soon)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • User management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • System analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Reports and monitoring
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Configuration settings
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Theme Color Picker and Session Info Row */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            {/* Theme Color Picker */}
            <Box sx={{ flex: 1 }}>
              <ThemeColorPicker />
            </Box>

            {/* Session Information Card */}
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Session Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    User ID: {user?.userId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Username: {user?.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: Active
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Stack>
          </Stack>
        </Container>
    </ProtectedLayout>
  );
};